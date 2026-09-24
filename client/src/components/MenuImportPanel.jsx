import { useState } from 'react';
import { menuService } from '../services/menuService';
import { analyzeMenuImages } from '../services/aiService';
import { compressImageToWebp } from '../utils/imageOptimizer';

const MAX_IMAGES = 3;
const MAX_TOTAL_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

const readImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve({ file, dataUrl: String(reader.result) });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const MenuImportPanel = ({ onImported }) => {
  const [files, setFiles] = useState([]);
  const [draft, setDraft] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('Görseller hazırlanıyor...');
  const [analysisStage, setAnalysisStage] = useState(0);
  const analysisStages = [
    'Görseller sıkıştırılıyor',
    'Görseller AI sağlayıcısına gönderiliyor',
    'Model menü metinlerini ve fiyatlarını okuyor',
    'Kategori ve ürün taslağı oluşturuluyor',
  ];

  const addFiles = async (fileList) => {
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
    if (!files.length || loading) return;
    setLoading(true);
    setAnalysisStage(0);
    setLoadingStatus('Görseller hazırlanıyor...');
    setError('');
    try {
      const images = files.map(({ dataUrl }) => {
        const [header, data] = dataUrl.split(',');
        return { mimeType: header.match(/data:(.*?);base64/)?.[1] || 'image/jpeg', data };
      });
      setAnalysisStage(1);
      setLoadingStatus('Görseller AI sağlayıcısına gönderiliyor...');
      await wait(550);
      setAnalysisStage(2);
      setLoadingStatus('Model menü metinlerini ve fiyatlarını okuyor...');
      const result = await analyzeMenuImages(images);
      setAnalysisStage(3);
      setLoadingStatus('Kategori ve ürün listesi düzenleniyor...');
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

  return (
    <section id="menu-import" className={`menu-import-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${loading ? 'is-analyzing' : ''}`}>
      <div className="menu-import-panel__header flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="menu-publish-card__eyebrow">MENÜ İÇE AKTARMA</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">Menünü Yükle</h3>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Menü görsellerini yükleyin. ZuuAI kategori, ürün, fiyat ve açıklamaları çıkarır; siz onaylamadan menünüze hiçbir kayıt eklenmez.</p>
        </div>
        <span className="menu-import-panel__badge rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">En fazla 3 görsel</span>
      </div>

      <div
        className={`menu-import-panel__dropzone mt-4 rounded-xl border-2 border-dashed p-5 text-center transition-colors ${dragActive ? 'is-drag-active' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => { event.preventDefault(); setDragActive(false); addFiles(event.dataTransfer.files); }}
      >
        <input id="menu-import-files" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }} />
        <div className="menu-import-panel__upload-mark" aria-hidden="true">↑</div>
        <p className="menu-import-panel__dropzone-title">Menü görsellerini buraya bırakın</p>
        <p className="mt-1 text-xs text-slate-400">JPG, PNG veya WEBP · En fazla 3 görsel</p>
        <label htmlFor="menu-import-files" className="menu-import-panel__select-button mt-3 inline-flex cursor-pointer items-center">Görselleri Seç</label>
      </div>

      {files.length > 0 && !draft && (
        <div className="menu-import-panel__files mt-4 flex flex-wrap gap-3">
          {files.map((item, index) => <div key={`${item.file.name}-${item.file.size}`} className="relative h-20 w-20"><img src={item.dataUrl} alt={item.file.name} className="h-full w-full rounded-lg object-cover" /><button type="button" onClick={() => removeFile(index)} className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-xs text-white" aria-label="Görseli kaldır">×</button></div>)}
        </div>
      )}

      {loading && <div className="menu-import-progress mt-4" aria-label="Menü analizi devam ediyor"><div className="menu-import-thinking"><div className="menu-import-aura" aria-hidden="true"><span /><span /><span /></div></div></div>}
      {error && <p className="mt-3 text-sm font-semibold text-rose-600" role="alert">{error}</p>}

      {files.length > 0 && !draft && !loading && <button type="button" onClick={startAnalysis} className="menu-import-panel__analyze mt-4">Menüyü Analiz Et</button>}

      {draft && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-bold text-slate-900">Analiz sonucu</h4><p className="text-xs text-slate-500">Bilgileri kontrol edin. Onayladığınızda menünüze eklenecek.</p></div><button type="button" onClick={() => setDraft(null)} className="text-xs font-bold text-slate-500 hover:text-slate-900">İptal</button></div>
          <div className="mt-4 space-y-3">{draft.categories.map((category, categoryIndex) => <div key={`${category.name}-${categoryIndex}`} className="rounded-xl bg-white p-3"><p className="font-bold text-slate-800">{category.name}</p><div className="mt-2 space-y-2">{(category.products || []).map((product, productIndex) => <div key={`${product.name}-${productIndex}`} className="grid grid-cols-[1fr_90px] gap-2"><input value={product.name} onChange={(event) => updateProduct(categoryIndex, productIndex, 'name', event.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" aria-label="Ürün adı" /><input value={product.price} onChange={(event) => updateProduct(categoryIndex, productIndex, 'price', event.target.value)} type="number" min="0" className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" aria-label="Ürün fiyatı" /></div>)}</div></div>)}</div>
          <button type="button" disabled={saving || !draft.categories.length} onClick={confirmImport} className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Menüye ekleniyor...' : 'Onayla ve Menüye Ekle'}</button>
        </div>
      )}
    </section>
  );
};

export default MenuImportPanel;
