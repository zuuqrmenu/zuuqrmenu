import { useState } from 'react';
import { menuService } from '../services/menuService';

const dietaryOptions = [
  ['VEGAN', 'Vegan'], ['VEGETARIAN', 'Vejetaryen'], ['GLUTEN_FREE', 'Glutensiz'],
  ['SPICY', 'Acılı'], ['MILD', 'Acısız'], ['HALAL', 'Helal'],
];

const initialForm = (categoryId) => ({
  categoryId,
  name: '', price: '', oldPrice: '', shortDescription: '', description: '',
  ingredients: '', allergens: '', calories: '', dietaryTags: [], isAvailable: true, isFeatured: false, displayOrder: 0,
});

const toForm = (product) => ({
  categoryId: product.categoryId?._id || product.categoryId,
  name: product.name,
  price: product.price,
  oldPrice: product.oldPrice ?? '',
  shortDescription: product.shortDescription || '',
  description: product.description || '',
  ingredients: (product.ingredients || []).join(', '),
  allergens: (product.allergens || []).join(', '),
  calories: product.calories ?? '',
  dietaryTags: product.dietaryTags || [],
  isAvailable: product.isAvailable,
  isFeatured: product.isFeatured,
  displayOrder: product.displayOrder,
});

const ProductModal = ({ product, categoryId, categories, onClose, onSaved }) => {
  const [form, setForm] = useState(product ? toForm(product) : initialForm(categoryId));
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleTag = (tag) => setForm((current) => ({
    ...current,
    dietaryTags: current.dietaryTags.includes(tag) ? current.dietaryTags.filter((item) => item !== tag) : [...current.dietaryTags, tag],
  }));

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Yalnızca JPG, PNG veya WEBP görseller yükleyebilirsiniz.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Görsel boyutu 5 MB değerinden küçük olmalıdır.');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = async () => {
    if (!product?.image) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    setUploading(true);
    setError('');
    try {
      await menuService.removeProductImage(product._id);
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setError(err.response?.data?.error || 'Görsel kaldırılamadı.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setError('Ürün adı zorunludur.');
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) return setError('Fiyat sıfır veya daha büyük geçerli bir sayı olmalıdır.');
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
      calories: form.calories === '' ? null : Number(form.calories),
      displayOrder: Number(form.displayOrder),
      ingredients: form.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
      allergens: form.allergens.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      const result = product ? await menuService.updateProduct(product._id, payload) : await menuService.createProduct(payload);
      if (imageFile) {
        setUploading(true);
        await menuService.uploadProductImage(result.product._id, imageFile);
        setUploading(false);
      }
      onSaved(result.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Ürün kaydedilemedi.');
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-emerald-600">Ürün Yönetimi</p><h2 className="mt-1 text-xl font-semibold">{product ? 'Ürünü düzenle' : 'Ürün ekle'}</h2></div><button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400" aria-label="Kapat">×</button></div>
      {error && <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-4"><div className="product-image-preview">{imagePreview ? <img src={imagePreview} alt="Ürün önizlemesi" /> : <span>Görsel ekle</span>}</div><div><p className="text-sm font-semibold text-slate-800">Ürün Görseli</p><p className="mt-1 text-xs text-slate-500">JPG, PNG veya WEBP · Maks. 5 MB</p><div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">Görsel Seç<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" disabled={saving || uploading} /></label>{imagePreview && <button type="button" onClick={removeImage} disabled={saving || uploading} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Görseli Kaldır</button>}</div>{uploading && <p className="mt-2 text-xs font-medium text-emerald-600">Yükleniyor...</p>}</div></div></div>
        <div><label className="mb-1.5 block text-sm font-medium">Ürün adı</label><input name="name" value={form.name} onChange={updateField} autoFocus className="field-input" placeholder="Örn. Mercimek Çorbası" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Kategori</label><select name="categoryId" value={form.categoryId} onChange={updateField} className="field-input">{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></div>
        <div><label className="mb-1.5 block text-sm font-medium">Fiyat</label><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} className="field-input" placeholder="120" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Eski fiyat <span className="font-normal text-slate-400">(opsiyonel)</span></label><input name="oldPrice" type="number" min="0" step="0.01" value={form.oldPrice} onChange={updateField} className="field-input" /></div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium">Kısa açıklama</label><input name="shortDescription" value={form.shortDescription} onChange={updateField} className="field-input" placeholder="Kısa ve iştah açıcı açıklama" /></div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium">Açıklama <span className="font-normal text-slate-400">(opsiyonel)</span></label><textarea name="description" value={form.description} onChange={updateField} rows="2" className="field-input resize-none" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">İçindekiler</label><input name="ingredients" value={form.ingredients} onChange={updateField} className="field-input" placeholder="Domates, soğan" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Alerjenler</label><input name="allergens" value={form.allergens} onChange={updateField} className="field-input" placeholder="Süt, gluten" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Kalori</label><input name="calories" type="number" min="0" step="1" value={form.calories} onChange={updateField} className="field-input" /></div>
        <div><label className="mb-1.5 block text-sm font-medium">Görüntüleme sırası</label><input name="displayOrder" type="number" min="0" step="1" value={form.displayOrder} onChange={updateField} className="field-input" /></div>
        <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium">Diyet etiketleri</legend><div className="flex flex-wrap gap-2">{dietaryOptions.map(([value, label]) => <button type="button" key={value} onClick={() => toggleTag(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ring-1 ${form.dietaryTags.includes(value) ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-600 ring-slate-200'}`}>{label}</button>)}</div></fieldset>
        <div className="flex flex-wrap gap-5 sm:col-span-2"><label className="flex items-center gap-2 text-sm font-medium"><input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={updateField} className="h-4 w-4 accent-slate-900" /> Mevcut</label><label className="flex items-center gap-2 text-sm font-medium"><input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={updateField} className="h-4 w-4 accent-slate-900" /> Öne Çıkan</label></div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 sm:col-span-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Vazgeç</button><button type="submit" disabled={saving || uploading} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{uploading ? 'Yükleniyor...' : saving ? 'Kaydediliyor...' : product ? 'Değişiklikleri kaydet' : 'Ürün oluştur'}</button></div>
      </form>
    </div>
  </div>;
};

const ProductManager = ({ category, products, categories, onChanged, onMessage }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionId, setActionId] = useState(null);

  const saved = (message) => { setModalOpen(false); setEditingProduct(null); onMessage(message); onChanged(); };
  const runAction = async (product, action, message) => {
    if (message && !window.confirm(message)) return;
    setActionId(product._id);
    try {
      const result = action === 'delete' ? await menuService.deleteProduct(product._id) : await menuService[action](product._id);
      onMessage(result.message);
      await onChanged();
    } catch (err) {
      onMessage(err.response?.data?.error || 'Ürün işlemi başarısız oldu.', true);
    } finally { setActionId(null); }
  };

  const move = async (index, direction) => {
    const next = direction === 'up' ? index - 1 : index + 1;
    if (next < 0 || next >= products.length) return;
    setActionId(products[index]._id);
    try {
      await Promise.all([menuService.updateProduct(products[index]._id, { displayOrder: products[next].displayOrder }), menuService.updateProduct(products[next]._id, { displayOrder: products[index].displayOrder })]);
      onMessage('Ürün sırası güncellendi.');
      await onChanged();
    } catch (err) { onMessage(err.response?.data?.error || 'Ürün sırası güncellenemedi.', true); } finally { setActionId(null); }
  };

  return <div className="mt-5 border-t border-slate-100 pt-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ürünler</p><button onClick={() => { setEditingProduct(null); setModalOpen(true); }} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">+ Ürün Ekle</button></div>{products.length === 0 ? <div className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Bu kategoride henüz ürün yok.</div> : <div className="space-y-2">{products.map((product, index) => <div key={product._id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{product.name}</p><span className={`text-xs font-semibold ${product.isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>{product.isAvailable ? '● Mevcut' : '○ Tükendi'}</span>{product.isFeatured && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Öne Çıkan</span>}</div><p className="mt-1 text-sm font-semibold text-slate-700">₺{Number(product.price).toFixed(2)}</p>{product.shortDescription && <p className="mt-1 truncate text-xs text-slate-500">{product.shortDescription}</p>}</div><div className="flex flex-wrap items-center gap-2"><button disabled={!!actionId || index === 0} onClick={() => move(index, 'up')} className="small-action disabled:opacity-40" aria-label="Yukarı taşı">↑</button><button disabled={!!actionId || index === products.length - 1} onClick={() => move(index, 'down')} className="small-action disabled:opacity-40" aria-label="Aşağı taşı">↓</button><button disabled={!!actionId} onClick={() => { setEditingProduct(product); setModalOpen(true); }} className="small-action">Düzenle</button><button disabled={!!actionId} onClick={() => runAction(product, 'toggleAvailability')} className="small-action">{product.isAvailable ? 'Tükendi' : 'Mevcut'}</button><button disabled={!!actionId} onClick={() => runAction(product, 'toggleFeatured')} className="small-action">{product.isFeatured ? 'Öne çıkandan çıkar' : 'Öne çıkar'}</button><button disabled={!!actionId} onClick={() => runAction(product, 'delete', 'Bu ürünü silmek istediğinize emin misiniz?')} className="small-action text-rose-600 hover:bg-rose-50">Sil</button></div></div>)}</div>}{modalOpen && <ProductModal product={editingProduct} categoryId={category._id} categories={categories} onClose={() => { setModalOpen(false); setEditingProduct(null); }} onSaved={saved} />}</div>;
};

export default ProductManager;