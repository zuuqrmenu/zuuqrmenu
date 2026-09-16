import { useEffect, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import ProductManager from '../components/ProductManager';
import PublicMenuButton from '../components/PublicMenuButton';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';

const emptyForm = { name: '', description: '', isActive: true, displayOrder: 0 };

const CategoryModal = ({ category, nextOrder, onClose, onSaved }) => {
  const [form, setForm] = useState(category ? { name: category.name, description: category.description || '', isActive: category.isActive, displayOrder: category.displayOrder } : { ...emptyForm, displayOrder: nextOrder });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Kategori adı zorunludur.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, name: form.name.trim(), displayOrder: Number(form.displayOrder) };
      const result = category ? await menuService.updateCategory(category._id, payload) : await menuService.createCategory(payload);
      onSaved(result.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="category-dialog-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-emerald-600">Menü</p><h2 id="category-dialog-title" className="mt-1 text-xl font-semibold">{category ? 'Kategoriyi düzenle' : 'Kategori ekle'}</h2></div><button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Kapat">×</button></div>
        {error && <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-slate-700">Kategori adı</label><input id="category-name" name="name" value={form.name} onChange={updateField} autoFocus className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Örn. Ana Yemekler" /></div>
          <div><label htmlFor="category-description" className="mb-1.5 block text-sm font-medium text-slate-700">Açıklama <span className="font-normal text-slate-400">(opsiyonel)</span></label><textarea id="category-description" name="description" value={form.description} onChange={updateField} rows="3" className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Kategori hakkında kısa bilgi" /></div>
          <div className="grid grid-cols-2 gap-4"><div><label htmlFor="category-order" className="mb-1.5 block text-sm font-medium text-slate-700">Görüntüleme sırası</label><input id="category-order" name="displayOrder" type="number" min="0" value={form.displayOrder} onChange={updateField} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></div><label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-slate-700"><input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-slate-900" /> Aktif</label></div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Vazgeç</button><button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Kaydediliyor...' : category ? 'Değişiklikleri kaydet' : 'Kategori oluştur'}</button></div>
        </form>
      </div>
    </div>
  );
};

const MenuManagement = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [overview, setOverview] = useState(null);
  const [statusDialog, setStatusDialog] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;
    setNoticeVisible(true);
    const fadeTimer = window.setTimeout(() => setNoticeVisible(false), 2500);
    const clearTimer = window.setTimeout(() => setNotice(''), 2800);
    return () => { window.clearTimeout(fadeTimer); window.clearTimeout(clearTimer); };
  }, [notice]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryData, productData, overviewData] = await Promise.all([menuService.getCategories(), menuService.getProducts(), menuService.getOverview()]);
      setCategories(categoryData.categories);
      setProducts(productData.products);
      setOverview(overviewData);
    } catch (err) {
      setError(err.response?.data?.error || 'Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const updateMenuStatus = async () => {
    const nextStatus = statusDialog?.status;
    if (!nextStatus) return;
    setActionId('menu-status');
    setError('');
    try {
      const result = await menuService.updateStatus(nextStatus);
      setOverview((current) => ({ ...current, restaurant: { ...current.restaurant, ...result.restaurant }, stats: { ...current.stats, menuStatus: result.restaurant.menuStatus } }));
      setNotice(result.message);
      setStatusDialog(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Menü durumu güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const menuStatus = overview?.stats?.menuStatus || 'DRAFT';
  const statusCopy = {
    PUBLISHED: ['Menünüz yayında', 'Menünüz müşterileriniz için erişilebilir.', 'Yayından Kaldır', 'HIDDEN'],
    HIDDEN: ['Menünüz şu anda gizli', 'Müşteriler menünüze erişemiyor.', 'Menüyü Yayınla', 'PUBLISHED'],
    DRAFT: ['Menünüz taslak halinde', 'Menünüz henüz yayınlanmadı.', 'Menüyü Yayınla', 'PUBLISHED'],
  }[menuStatus];

  useEffect(() => { loadData(); }, []);

  const showNotice = (message) => {
    setModalOpen(false);
    setEditingCategory(null);
    setNotice(message);
    loadData();
  };

  const toggleCategory = async (category) => {
    setActionId(category._id);
    setError('');
    try {
      const result = await menuService.toggleCategory(category._id);
      setNotice(result.message);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori durumu güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const deleteCategory = async (category) => {
    if (!window.confirm(`"${category.name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setActionId(category._id);
    setError('');
    try {
      const result = await menuService.deleteCategory(category._id);
      setNotice(result.message);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori silinemedi.');
    } finally {
      setActionId(null);
    }
  };

  const moveCategory = async (index, direction) => {
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= categories.length) return;
    const current = categories[index];
    const neighbor = categories[neighborIndex];
    if (current.displayOrder === neighbor.displayOrder) return;
    setActionId(current._id);
    setError('');
    try {
      await Promise.all([
        menuService.updateCategory(current._id, { displayOrder: neighbor.displayOrder }),
        menuService.updateCategory(neighbor._id, { displayOrder: current.displayOrder }),
      ]);
      setNotice('Kategori sırası güncellendi.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori sırası güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        <section className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-emerald-600">Menü Yönetimi</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Menünüzü buradan yönetin.</h2><p className="mt-2 text-sm text-slate-500">Kategorilerinizi oluşturun, düzenleyin ve menü sıralamanızı belirleyin.</p></div><div className="flex flex-wrap items-center gap-3"><PublicMenuButton username={user?.username} label="Müşteri Görünümü" compact /><button onClick={() => { setEditingCategory(null); setModalOpen(true); }} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">+ Kategori Ekle</button></div></section>
        {notice && <div className={`settings-status settings-status--success ${noticeVisible ? 'is-visible' : 'is-hiding'}`} role="status">{notice}<button onClick={() => setNotice('')} className="ml-3" aria-label="Bildirimi kapat">×</button></div>}
        {error && <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={() => setError('')} aria-label="Hatayı kapat">×</button></div>}
        {overview && <section className="menu-publish-card"><div><p className="menu-publish-card__eyebrow">Yayın durumu</p><h3>{statusCopy[0]}</h3><p>{statusCopy[1]}</p>{overview.restaurant?.publishedAt && <small>Son yayın: {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(overview.restaurant.publishedAt))}</small>}</div><div className="menu-publish-card__actions">{menuStatus === 'PUBLISHED' && <PublicMenuButton username={user?.username} label="Menüyü Görüntüle" compact />}<button type="button" disabled={actionId === 'menu-status'} onClick={() => setStatusDialog({ status: statusCopy[3] })} className={menuStatus === 'PUBLISHED' ? 'menu-publish-card__danger' : 'menu-publish-card__primary'}>{statusCopy[2]}</button></div></section>}
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Kategoriler yükleniyor...</div> : categories.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><p className="text-lg font-semibold text-slate-900">Henüz bir kategori oluşturmadınız.</p><p className="mt-2 text-sm text-slate-500">Menünüzü düzenlemeye ilk kategorinizi ekleyerek başlayın.</p><button onClick={() => { setEditingCategory(null); setModalOpen(true); }} className="mt-6 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">+ Kategori Ekle</button></div> : <><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold">Kategoriler</h3><p className="mt-1 text-sm text-slate-500">{categories.length} kategori menünüzde yer alıyor.</p></div><div className="divide-y divide-slate-100">{categories.map((category, index) => <article key={category._id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h4 className="font-semibold text-slate-900">{category.name}</h4><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${category.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-slate-200'}`}>{category.isActive ? 'Aktif' : 'Pasif'}</span></div><p className="mt-1 text-sm text-slate-500">{category.description || 'Açıklama eklenmedi.'}</p><p className="mt-2 text-xs font-medium text-slate-400">{category.productCount} ürün · Sıra {category.displayOrder}</p></div><div className="flex flex-wrap items-center gap-2"><button disabled={index === 0 || !!actionId} onClick={() => moveCategory(index, 'up')} className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Yukarı taşı">↑</button><button disabled={index === categories.length - 1 || !!actionId} onClick={() => moveCategory(index, 'down')} className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Aşağı taşı">↓</button><button disabled={!!actionId} onClick={() => { setEditingCategory(category); setModalOpen(true); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Düzenle</button><button disabled={!!actionId} onClick={() => toggleCategory(category)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">{category.isActive ? 'Pasifleştir' : 'Aktifleştir'}</button><button disabled={!!actionId} onClick={() => deleteCategory(category)} className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">Sil</button></div></article>)}</div></section><section className="space-y-4"><div><h3 className="text-lg font-semibold">Ürünler</h3><p className="mt-1 text-sm text-slate-500">Ürünlerinizi kategoriler altında yönetin.</p></div>{categories.map((category) => <div key={`products-${category._id}`} className="rounded-2xl border border-slate-200 bg-white px-6 shadow-sm"><div className="flex items-center justify-between gap-4 pt-5"><h4 className="font-semibold">{category.name}</h4><span className="text-xs text-slate-400">{products.filter((product) => product.categoryId?._id === category._id || product.categoryId === category._id).length} ürün</span></div><ProductManager category={category} products={products.filter((product) => product.categoryId?._id === category._id || product.categoryId === category._id)} categories={categories} onChanged={loadData} onMessage={(message, isError = false) => { if (isError) setError(message); else setNotice(message); }} /></div>)}</section></>}
      </div>
      {modalOpen && <CategoryModal category={editingCategory} nextOrder={categories.length} onClose={() => { setModalOpen(false); setEditingCategory(null); }} onSaved={showNotice} />}
      {statusDialog && <div className="publish-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setStatusDialog(null)}><div className="publish-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title"><h2 id="publish-dialog-title">{statusDialog.status === 'PUBLISHED' ? 'Menüyü yayınla' : 'Menüyü yayından kaldır'}</h2><p>{statusDialog.status === 'PUBLISHED' ? 'Menünüz yayınlandığında müşteriler güncel menüyü görebilecek.' : 'Menüyü yayından kaldırmak istediğinize emin misiniz? Müşteriler menüye erişemeyecek.'}</p><div className="publish-dialog__actions"><button type="button" onClick={() => setStatusDialog(null)} className="publish-dialog__cancel">Vazgeç</button><button type="button" onClick={updateMenuStatus} disabled={actionId === 'menu-status'} className={statusDialog.status === 'PUBLISHED' ? 'publish-dialog__confirm' : 'publish-dialog__confirm publish-dialog__confirm--danger'}>{statusDialog.status === 'PUBLISHED' ? 'Menüyü Yayınla' : 'Yayından Kaldır'}</button></div></div></div>}
    </RestaurantLayout>
  );
};

export default MenuManagement;