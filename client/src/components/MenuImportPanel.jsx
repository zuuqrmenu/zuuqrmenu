import { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import { analyzeMenuImages } from '../services/aiService';
import { compressImageToWebp } from '../utils/imageOptimizer';
import './ZuuAIAssistant.css';

const MAX_IMAGES = 3;
const MAX_TOTAL_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DAILY_LIMIT_KEY = 'zuu_menu_analysis_last_date';

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

/** Returns today's date as YYYY-MM-DD in local time */
const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/** Seconds remaining until next local midnight */
const secondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.ceil((midnight - now) / 1000);
};

/** Format seconds as HH:MM:SS */
const formatCountdown = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const readImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ file, dataUrl: String(reader.result) });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ANALYSIS_STAGES = [
  { title: 'Görseller', desc: 'Görseller optimize ediliyor...', percent: 25 },
  { title: 'AI İletimi', desc: 'ZuuAI modeline iletiliyor...', percent: 50 },
  { title: 'Metin & Fiyat', desc: 'Menü metinleri ve fiyatları okunuyor...', percent: 78 },
  { title: 'Taslak', desc: 'Kategori ve ürün taslağı hazırlanıyor...', percent: 98 },
];

const MenuImportPanel = ({ onImported }) => {
  const [files, setFiles] = useState([]);
  const [draft, setDraft] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('Görseller analiz için hazırlanıyor...');
  const [analysisStage, setAnalysisStage] = useState(0);

  // Daily limit state
  const [limitUsed, setLimitUsed] = useState(() => localStorage.getItem(DAILY_LIMIT_KEY) === getTodayKey());
  const [countdown, setCountdown] = useState(() => localStorage.getItem(DAILY_LIMIT_KEY) === getTodayKey() ? secondsUntilMidnight() : 0);

  // Countdown timer when daily limit is reached
  useEffect(() => {
    if (!limitUsed) return;
    setCountdown(secondsUntilMidnight());
    const timer = setInterval(() => {
      const secs = secondsUntilMidnight();
      setCountdown(secs);
      // Reset at midnight
      if (localStorage.getItem(DAILY_LIMIT_KEY) !== getTodayKey()) {
        setLimitUsed(false);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [limitUsed]);

  const addFiles = async (fileList) => {
    if (limitUsed) return; // guard: no uploads when limit reached
    const incoming = Array.from(fileList || []);
    const next = [...files, ...incoming].slice(0, MAX_IMAGES);
    if (incoming.length + files.length > MAX_IMAGES) return setError('En fazla 3 menü görseli yükleyebilirsiniz.');
    if (next.some((file) => !ACCEPTED_TYPES.includes(file.type))) return setError('Yalnızca JPG, PNG veya WEBP görseller yükleyebilirsiniz.');
    const optimizedFiles = await Promise.all(next.map(async (file) => {
      const optimized = await compressImageToWebp(file, { maxDimension: 1800, quality: 0.76 });
      return optimized.file || file;
    }));
    const totalSize = optimizedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) return setError('Sıkıştırılmış görsellerin toplam boyutu 8 MB değerinden küçük olmalıdır.');
    setError('');
    setFiles(await Promise.all(optimizedFiles.map(readImage)));
  };

  const removeFile = (index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const startAnalysis = async () => {
    if (!files.length || loading || limitUsed) return;
    setLoading(true);
    setAnalysisStage(0);
    setLoadingStatus('Görseller optimize ediliyor...');
    setError('');
    try {
      const images = files.map(({ dataUrl }) => {
        const [header, data] = dataUrl.split(',');
        return { mimeType: header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg', data };
      });
      setAnalysisStage(1);
      setLoadingStatus('Görseller ZuuAI modeline aktarılıyor...');
      await wait(700);
      setAnalysisStage(2);
      setLoadingStatus('Menü metinleri ve fiyatları taranıyor...');
      const result = await analyzeMenuImages(images);
      setAnalysisStage(3);
      setLoadingStatus('Kategori ve ürün taslağı yapılandırılıyor...');
      await wait(550);
      // Mark daily limit as used
      localStorage.setItem(DAILY_LIMIT_KEY, getTodayKey());
      setLimitUsed(true);
      setDraft(result?.data || { categories: [] });
    } catch (err) {
      setError(err.response?.data?.error || 'Menü analiz edilemedi. Görselleri daha net yükleyip tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = (categoryIndex, productIndex, field, value) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.map((category, index) => index !== categoryIndex ? category : {
        ...category,
        products: category.products.map((product, itemIndex) => itemIndex !== productIndex ? product : { ...product, [field]: value }),
      }),
    }));
  };

  const confirmImport = async () => {
    if (!draft?.categories?.length || saving) return;
    setSaving(true);
    setError('');
    try {
      for (const category of draft.categories) {
        const categoryResult = await menuService.createCategory({ name: category.name, description: category.description || '', isActive: true });
        const categoryId = categoryResult.category?._id;
        for (const product of category.products || []) {
          if (!categoryId || !product.name) continue;
          await menuService.createProduct({
            categoryId,
            name: product.name,
            price: Number(product.price) || 0,
            oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            ingredients: product.ingredients || [],
            allergens: product.allergens || [],
            calories: product.calories === null ? null : Number(product.calories) || null,
            isAvailable: true,
            isFeatured: false,
          });
        }
      }
      setDraft(null);
      setFiles([]);
      onImported?.('Menü analizindeki kategori ve ürünler menünüze eklendi.');
    } catch (err) {
      setError(err.response?.data?.error || 'Menü verileri eklenirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const currentPercent = ANALYSIS_STAGES[analysisStage]?.percent || 25;

  return (
    <section id="menu-import" className={`menu-import-panel ${loading ? 'is-analyzing' : ''}`}>
      <div className="menu-import-panel__header">
        <div>
          <p className="menu-import-panel__eyebrow">MENÜ İÇE AKTARMA</p>
          <h3 className="menu-import-panel__header-title">Menünü Yükle</h3>
          <p className="menu-import-panel__header-desc">
            Menü fotoğraflarınızı yükleyin. ZuuAI ürünleri, fiyatları ve kategorileri otomatik ayıklar.
          </p>
        </div>
        <span className={`menu-import-panel__badge ${limitUsed ? 'is-limit-used' : ''}`}>
          {limitUsed ? 'Günlük hak kullanıldı' : 'Günde 1 kez · En fazla 3 görsel'}
        </span>
      </div>

      {/* Locked state with countdown */}
      {limitUsed ? (
        <div className="menu-import-limit-card" aria-live="polite">
          <div className="menu-import-limit-card__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="menu-import-limit-card__body">
            <p className="menu-import-limit-card__title">Bugünkü analiz hakkınızı kullandınız</p>
            <p className="menu-import-limit-card__desc">Yeni hak günlük sıfırlama için gece yarısını bekleyin.</p>
          </div>
          <div className="menu-import-limit-card__countdown" aria-label="Kalan süre">
            <span className="menu-import-limit-card__countdown-label">Yeni hak</span>
            <span className="menu-import-limit-card__countdown-time">{formatCountdown(countdown)}</span>
          </div>
        </div>
      ) : (
        <div
          className={`menu-import-panel__dropzone ${dragActive ? 'is-drag-active' : ''}`}
          onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => { event.preventDefault(); setDragActive(false); addFiles(event.dataTransfer.files); }}
        >
          <input
            id="menu-import-files"
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
          />
          <div className="menu-import-panel__upload-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
          <p className="menu-import-panel__dropzone-title">Menü fotoğraflarını buraya bırakın</p>
          <p className="menu-import-panel__dropzone-desc">JPG, PNG veya WEBP · En fazla 3 görsel</p>
          <label htmlFor="menu-import-files" className="menu-import-panel__select-button">
            Görselleri Seç
          </label>
        </div>
      )}

      {error && <p className="menu-import-panel__error" role="alert">{error}</p>}

      {/* Smoothly expanding Selected Files Section */}
      <div className={`menu-import-expand ${files.length > 0 && !draft && !loading ? 'is-expanded' : ''}`}>
        <div className="menu-import-expand__inner">
          <div className="menu-import-panel__files">
            {files.map((item, index) => (
              <div key={`${item.file.name}-${item.file.size}`} className="menu-import-panel__file-preview">
                <img src={item.dataUrl} alt={item.file.name} className="menu-import-panel__file-thumb" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="menu-import-panel__file-remove"
                  aria-label="Görseli kaldır"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="menu-import-panel__actions">
            <button
              type="button"
              onClick={startAnalysis}
              className="menu-import-panel__analyze"
            >
              <span>Menüyü Analiz Et</span>
              <span className="menu-import-panel__analyze-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smoothly expanding Minimal AI Processing Card */}
      <div className={`menu-import-expand ${loading ? 'is-expanded' : ''}`}>
        <div className="menu-import-expand__inner">
          <div className="menu-import-ai-card" aria-label="Menü analizi devam ediyor">
            <div className="menu-import-ai-card__top">
              {/* Soft rotating loader */}
              <div className="menu-import-ai-spinner-wrap" aria-hidden="true">
                <div className="menu-import-ai-soft-spinner" />
              </div>

              {/* Status info */}
              <div className="menu-import-ai-info">
                <div className="menu-import-ai-badge">
                  <span className="menu-import-ai-badge-dot" />
                  <span>Menü Analiz Ediliyor</span>
                </div>
                <h4 className="menu-import-ai-title">{loadingStatus}</h4>
              </div>
            </div>

            {/* Slim 3px Progress Bar */}
            <div className="menu-import-ai-track">
              <div
                className="menu-import-ai-fill"
                style={{ width: `${currentPercent}%` }}
              />
            </div>

            {/* Minimalist Stage Breadcrumbs */}
            <div className="menu-import-ai-stages">
              {ANALYSIS_STAGES.map((stage, idx) => {
                const isDone = idx < analysisStage;
                const isActive = idx === analysisStage;
                return (
                  <div
                    key={stage.title}
                    className={`menu-import-ai-stage-item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="menu-import-ai-stage-dot">
                      {isDone ? '✓' : ''}
                    </span>
                    <span className="menu-import-ai-stage-text">{stage.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Smoothly expanding Result Draft */}
      <div className={`menu-import-expand ${draft ? 'is-expanded' : ''}`}>
        <div className="menu-import-expand__inner">
          {draft && (
            <div className="menu-import-result">
              <div className="menu-import-result__header">
                <div>
                  <div className="menu-import-result__title-wrap">
                    <h4 className="menu-import-result__title">Analiz Sonucu</h4>
                    <span className="menu-import-result__count-badge">
                      {draft.categories?.length || 0} Kategori · {draft.categories?.reduce((acc, c) => acc + (c.products?.length || 0), 0) || 0} Ürün
                    </span>
                  </div>
                  <p className="menu-import-result__desc">
                    Bilgileri kontrol edin. Onayladığınızda menünüze aktarılacaktır.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="menu-import-result__cancel-btn"
                >
                  İptal
                </button>
              </div>

              <div className="menu-import-result__categories">
                {draft.categories.map((category, categoryIndex) => (
                  <div key={`${category.name}-${categoryIndex}`} className="menu-import-result__category-card">
                    <p className="menu-import-result__category-name">{category.name}</p>
                    <div className="menu-import-result__products">
                      {(category.products || []).map((product, productIndex) => (
                        <div key={`${product.name}-${productIndex}`} className="menu-import-result__product-row">
                          <input
                            value={product.name}
                            onChange={(event) => updateProduct(categoryIndex, productIndex, 'name', event.target.value)}
                            className="menu-import-result__input menu-import-result__input--name"
                            aria-label="Ürün adı"
                            placeholder="Ürün adı"
                          />
                          <div className="menu-import-result__price-input-wrap">
                            <input
                              value={product.price}
                              onChange={(event) => updateProduct(categoryIndex, productIndex, 'price', event.target.value)}
                              type="number"
                              min="0"
                              className="menu-import-result__input menu-import-result__input--price"
                              aria-label="Ürün fiyatı"
                              placeholder="Fiyat"
                            />
                            <span className="menu-import-result__currency">₺</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="menu-import-result__actions">
                <button
                  type="button"
                  disabled={saving || !draft.categories?.length}
                  onClick={confirmImport}
                  className="menu-import-result__confirm-btn"
                >
                  {saving ? (
                    <>
                      <span className="menu-import-btn-spinner" />
                      <span>Menüye Ekleniyor...</span>
                    </>
                  ) : (
                    <span>Onayla ve Menüye Ekle</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MenuImportPanel;
