import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import { analyzeMenuImages, getMenuAnalysisStatus, batchGenerateProductDescriptions } from '../services/aiService';
import { compressImageToWebp } from '../utils/imageOptimizer';
import './ZuuAIAssistant.css';

const MAX_IMAGES = 3;
const MAX_TOTAL_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

/** Returns today's date as YYYY-MM-DD in local time */
const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

/** Check promotional unlimited period (until 1 October 2026) */
const isUnlimitedPromoActive = () => {
  const promoEnd = new Date('2026-10-01T00:00:00.000+03:00');
  return new Date() < promoEnd;
};

/** Scoped storage key per restaurant or user to prevent cross-account limit pollution */
const getScopedLimitKey = (restaurantId, userId) => {
  const id = restaurantId || userId;
  return id ? `zuu_menu_analysis_${id}_last_date` : null;
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
  const safeSeconds = Math.max(0, totalSeconds || 0);
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
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

const SparkleIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" opacity="0.75" />
  </svg>
);

const MenuImportPanel = ({ onImported }) => {
  const { user, restaurant, isAdmin } = useAuth();
  const isPromo = isUnlimitedPromoActive();
  const [files, setFiles] = useState([]);
  const [draft, setDraft] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('Görseller analiz için hazırlanıyor...');
  const [analysisStage, setAnalysisStage] = useState(0);

  // Modal and Batch AI Description states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [optSaveCategories, setOptSaveCategories] = useState(true);
  const [optSaveProducts, setOptSaveProducts] = useState(true);
  const [optSmartDescriptions, setOptSmartDescriptions] = useState(true);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({
    phase: 'idle',
    current: 0,
    total: 0,
    percent: 0,
    statusTitle: '',
    statusSubtitle: '',
  });

  // Daily limit state (scoped to restaurant/user, bypassed for admin or unlimited promo)
  const scopedKey = getScopedLimitKey(restaurant?._id, user?._id || user?.id);
  const [limitUsed, setLimitUsed] = useState(() => {
    if (isAdmin || isPromo) return false;
    if (!scopedKey) return false;
    return localStorage.getItem(scopedKey) === getTodayKey();
  });
  const [countdown, setCountdown] = useState(() => {
    if (isAdmin || isPromo) return 0;
    if (!scopedKey) return 0;
    return localStorage.getItem(scopedKey) === getTodayKey() ? secondsUntilMidnight() : 0;
  });

  // Clean up legacy global key that caused all accounts on the device to be locked out
  useEffect(() => {
    try {
      localStorage.removeItem('zuu_menu_analysis_last_date');
    } catch (_) {}
  }, []);

  // Fetch true limit status from the server for this restaurant on mount or account switch
  useEffect(() => {
    if (isAdmin || isPromo) {
      setLimitUsed(false);
      setCountdown(0);
      return;
    }

    let isMounted = true;
    const fetchLimitStatus = async () => {
      try {
        const res = await getMenuAnalysisStatus();
        if (!isMounted) return;
        if (res?.data?.isPromo) {
          setLimitUsed(false);
          setCountdown(0);
          if (scopedKey) localStorage.removeItem(scopedKey);
          return;
        }
        if (res?.data?.limitUsed) {
          setLimitUsed(true);
          const remainingSecs = res.data.remainingSeconds || secondsUntilMidnight();
          setCountdown(remainingSecs);
          if (scopedKey) localStorage.setItem(scopedKey, getTodayKey());
        } else if (res?.data?.limitUsed === false) {
          setLimitUsed(false);
          setCountdown(0);
          if (scopedKey) localStorage.removeItem(scopedKey);
        }
      } catch (err) {
        // Fall back to scoped local storage
        console.warn('Menü analiz durumu sunucudan alınamadı:', err.message);
      }
    };

    fetchLimitStatus();
    return () => {
      isMounted = false;
    };
  }, [restaurant?._id, user?._id, isAdmin, isPromo, scopedKey]);

  // Countdown timer when daily limit is reached
  useEffect(() => {
    if (isAdmin || !limitUsed) return;
    setCountdown((prev) => (prev > 0 ? prev : secondsUntilMidnight()));
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setLimitUsed(false);
          if (scopedKey) localStorage.removeItem(scopedKey);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [limitUsed, isAdmin, scopedKey]);

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

      // Mark daily limit as used only for normal accounts when promo is not active
      if (!isAdmin && !isPromo) {
        if (scopedKey) localStorage.setItem(scopedKey, getTodayKey());
        setLimitUsed(true);
        setCountdown(secondsUntilMidnight());
      }
      setDraft(result?.data || { categories: [] });
    } catch (err) {
      if (err.response?.status === 429) {
        if (!isAdmin && !isPromo) {
          if (scopedKey) localStorage.setItem(scopedKey, getTodayKey());
          setLimitUsed(true);
          if (err.response?.data?.remainingSeconds) {
            setCountdown(err.response.data.remainingSeconds);
          }
        }
      }
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

  const openConfirmationModal = () => {
    if (!draft?.categories?.length || saving) return;
    setIsModalClosing(false);
    setShowConfirmModal(true);
  };

  const closeConfirmationModal = () => {
    if (isModalClosing) return;
    setIsModalClosing(true);
    setTimeout(() => {
      setShowConfirmModal(false);
      setIsModalClosing(false);
    }, 200);
  };

  const handleProceedImport = async () => {
    if (!draft?.categories?.length || saving) return;
    setShowConfirmModal(false);
    setIsModalClosing(false);
    setSaving(true);
    setBatchProcessing(true);
    setError('');

    let finalCategories = draft.categories;
    const totalProducts = draft.categories.reduce((acc, c) => acc + (c.products?.length || 0), 0);

    // Phase 1: AI Smart Product Descriptions (if enabled)
    if (optSmartDescriptions && totalProducts > 0) {
      setBatchProgress({
        phase: 'ai_descriptions',
        current: 0,
        total: totalProducts,
        percent: 20,
        statusTitle: 'ZuuAI Ürün Açıklamalarını Hazırlıyor...',
        statusSubtitle: 'Yapay zeka menüdeki ürünler için özel açıklamalar oluşturuyor...',
      });

      const progressInterval = setInterval(() => {
        setBatchProgress((prev) => {
          if (prev.phase !== 'ai_descriptions' || prev.percent >= 90) return prev;
          return {
            ...prev,
            percent: Math.min(90, prev.percent + 15),
          };
        });
      }, 700);

      try {
        const batchRes = await batchGenerateProductDescriptions(draft.categories);
        clearInterval(progressInterval);

        if (batchRes?.data?.categories) {
          finalCategories = batchRes.data.categories;
        }
      } catch (aiErr) {
        clearInterval(progressInterval);
        console.warn('Batch AI description generation failed:', aiErr.message);
      }
    }

    try {
      // Phase 2: Save to Database (0 / totalProducts)
      setBatchProgress({
        phase: 'saving_products',
        current: 0,
        total: totalProducts,
        percent: 0,
        statusTitle: 'Ürünler Menünüze Ekleniyor...',
        statusSubtitle: `0 / ${totalProducts} ürün eklendi`,
      });

      // 1. Fetch current categories to match existing or avoid orphan products
      const existingData = await menuService.getCategories();
      const existingCategories = existingData?.categories || [];

      let savedProductCount = 0;

      for (const category of finalCategories) {
        let categoryId = null;
        const catName = (category.name || 'Genel').trim();

        if (optSaveCategories) {
          const categoryResult = await menuService.createCategory({
            name: catName,
            description: String(category.description || '').trim(),
            isActive: true,
          });
          categoryId = categoryResult?.category?._id;
        } else {
          // If not creating new category, match with existing category by name
          const matched = existingCategories.find(
            (c) => (c.name || '').trim().toLowerCase() === catName.toLowerCase()
          );
          if (matched) {
            categoryId = matched._id;
          } else if (optSaveProducts) {
            // If no matching category exists, create category as parent fallback
            const fallbackCat = await menuService.createCategory({
              name: catName,
              description: String(category.description || '').trim(),
              isActive: true,
            });
            categoryId = fallbackCat?.category?._id;
          }
        }

        if (optSaveProducts && (category.products || []).length > 0 && categoryId) {
          for (const product of category.products || []) {
            const prodName = (product.name || '').trim();
            if (!prodName) continue;

            const safePrice = Number.isFinite(Number(product.price)) && Number(product.price) >= 0 ? Number(product.price) : 0;
            const safeOldPrice = Number.isFinite(Number(product.oldPrice)) && Number(product.oldPrice) > 0 ? Number(product.oldPrice) : null;
            const safeCalories = Number.isFinite(Number(product.calories)) && Number(product.calories) >= 0 ? Math.round(Number(product.calories)) : null;

            await menuService.createProduct({
              categoryId,
              name: prodName,
              price: safePrice,
              oldPrice: safeOldPrice,
              shortDescription: String(product.shortDescription || '').trim(),
              description: String(product.description || '').trim(),
              ingredients: Array.isArray(product.ingredients) ? product.ingredients.filter(Boolean) : [],
              allergens: Array.isArray(product.allergens) ? product.allergens.filter(Boolean) : [],
              calories: safeCalories,
              isAvailable: true,
              isFeatured: false,
            });

            savedProductCount++;
            const percent = Math.min(100, Math.round((savedProductCount / Math.max(1, totalProducts)) * 100));
            setBatchProgress({
              phase: 'saving_products',
              current: savedProductCount,
              total: totalProducts,
              percent,
              statusTitle: 'Ürünler Menünüze Ekleniyor...',
              statusSubtitle: `${savedProductCount} / ${totalProducts} ürün eklendi`,
            });
          }
        }
      }

      setBatchProgress({
        phase: 'completed',
        current: totalProducts,
        total: totalProducts,
        percent: 100,
        statusTitle: 'Menü Başarıyla Kaydedildi!',
        statusSubtitle: `${totalProducts} / ${totalProducts} ürün tamamlandı`,
      });

      if (typeof onImported === 'function') {
        await onImported(
          optSmartDescriptions
            ? 'ZuuAI akıllı açıklamaları ve ürünler başarıyla menünüze eklendi.'
            : 'Menü analizindeki veriler başarıyla menünüze eklendi.'
        );
      }

      await wait(400);

      setDraft(null);
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Menü verileri eklenirken bir hata oluştu.');
    } finally {
      setBatchProcessing(false);
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
        <span className={`menu-import-panel__badge ${limitUsed ? 'is-limit-used' : isPromo ? 'is-promo-unlimited' : ''}`}>
          {isAdmin
            ? 'Yönetici Hesabı · Sınırsız'
            : isPromo
            ? '1 Ekim’e Kadar Sınırsız · En fazla 3 görsel'
            : limitUsed
            ? 'Günlük hak kullanıldı'
            : 'Günde 1 kez · En fazla 3 görsel'}
        </span>
      </div>

      {/* Locked state with countdown */}
      {limitUsed && (
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
      )}

      {/* Smoothly collapsible Dropzone (fades out when analyzing or showing draft) */}
      {!limitUsed && (
        <div className={`menu-import-expand ${!loading && !draft ? 'is-expanded' : ''}`}>
          <div className="menu-import-expand__inner">
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
          </div>
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
                  onClick={openConfirmationModal}
                  className="menu-import-result__confirm-btn"
                >
                  {saving ? (
                    <>
                      <span className="menu-import-btn-spinner" />
                      <span>Menüye Ekleniyor...</span>
                    </>
                  ) : (
                    <span>Onayla</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal: "Menünü nasıl kaydetmek istersin?" */}
      {showConfirmModal && typeof document !== 'undefined' && createPortal(
        <div
          className={`menu-import-modal-backdrop ${isModalClosing ? 'is-closing' : ''}`}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => e.target === e.currentTarget && closeConfirmationModal()}
        >
          <div className={`menu-import-modal-card ${isModalClosing ? 'is-closing' : ''}`}>
            <div className="menu-import-modal-header">
              <div className="menu-import-modal-header-left">
                <div className="menu-import-sparkle-badge" aria-hidden="true">
                  <SparkleIcon size={20} />
                </div>
                <div>
                  <h3 className="menu-import-modal-title">
                    Menünü nasıl kaydetmek istersin?
                  </h3>
                  <p className="menu-import-modal-desc">
                    İçe aktarılacak seçenekleri belirleyin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="menu-import-modal-close"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Save Categories */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOptSaveCategories((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOptSaveCategories((prev) => !prev); } }}
                className={`menu-import-toggle-card ${optSaveCategories ? 'is-active' : ''}`}
              >
                <div className="flex-1 pr-2">
                  <p className="menu-import-toggle-title">1. Kategorileri kaydet</p>
                  <p className="menu-import-toggle-desc">Algılanan kategorileri menünüze ekle.</p>
                </div>
                <div
                  className={`menu-import-switch-track ${optSaveCategories ? 'is-on' : ''}`}
                  aria-label="Kategorileri kaydet"
                  role="switch"
                  aria-checked={optSaveCategories}
                >
                  <span className="menu-import-switch-thumb" />
                </div>
              </div>

              {/* Option 2: Save Products */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOptSaveProducts((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOptSaveProducts((prev) => !prev); } }}
                className={`menu-import-toggle-card ${optSaveProducts ? 'is-active' : ''}`}
              >
                <div className="flex-1 pr-2">
                  <p className="menu-import-toggle-title">2. Ürünleri kaydet</p>
                  <p className="menu-import-toggle-desc">Algılanan ürünleri menünüze ekle.</p>
                </div>
                <div
                  className={`menu-import-switch-track ${optSaveProducts ? 'is-on' : ''}`}
                  aria-label="Ürünleri kaydet"
                  role="switch"
                  aria-checked={optSaveProducts}
                >
                  <span className="menu-import-switch-thumb" />
                </div>
              </div>

              {/* Option 3: Smart Product Descriptions */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOptSmartDescriptions((prev) => !prev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOptSmartDescriptions((prev) => !prev); } }}
                className={`menu-import-toggle-card is-ai ${optSmartDescriptions ? 'is-active' : ''}`}
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <p className="menu-import-toggle-title">3. Akıllı ürün açıklamaları oluştur</p>
                    <span className="menu-import-ai-pill">
                      ZuuAI
                    </span>
                  </div>
                  <p className="menu-import-toggle-desc">
                    ZuuAI, ürün bilgilerini kullanarak açıklama önerileri hazırlasın.
                  </p>
                </div>
                <div
                  className={`menu-import-switch-track is-ai ${optSmartDescriptions ? 'is-on' : ''}`}
                  aria-label="Akıllı ürün açıklamaları oluştur"
                  role="switch"
                  aria-checked={optSmartDescriptions}
                >
                  <span className="menu-import-switch-thumb" />
                </div>
              </div>
            </div>

            <div className="menu-import-modal-footer">
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="menu-import-modal-cancel-btn"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={!optSaveCategories && !optSaveProducts}
                onClick={handleProceedImport}
                className="menu-import-modal-confirm-btn"
              >
                Kaydet ve Devam Et
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Saving & Progress Overlay */}
      {batchProcessing && typeof document !== 'undefined' && createPortal(
        <div className="menu-import-modal-backdrop" role="dialog" aria-modal="true">
          <div className="menu-import-modal-card text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 text-2xl animate-pulse">
              <SparkleIcon size={24} />
            </div>
            <div>
              <h4 className="menu-import-modal-title text-base font-bold">
                {batchProgress.statusTitle}
              </h4>
              <p className="menu-import-modal-desc mt-1 font-medium">
                {batchProgress.statusSubtitle}
              </p>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-lime-400 transition-all duration-300 rounded-full"
                style={{ width: `${batchProgress.percent}%` }}
              />
            </div>
            <p className="menu-import-modal-desc text-[11px]">
              {batchProgress.phase === 'ai_descriptions'
                ? 'ZuuAI menü analizi verileriyle akıllı açıklamaları zenginleştiriyor...'
                : 'Veriler işleniyor ve menü yönetim listenize kaydediliyor...'}
            </p>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default MenuImportPanel;
