import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';

const statusLabels = { PENDING: 'Onay Bekliyor', ACTIVE: 'Aktif', SUSPENDED: 'Askıya Alındı', REJECTED: 'Reddedildi' };
const businessTypeLabels = { RESTAURANT: 'Restoran', CAFE: 'Kafe', BAR: 'Bar', BAKERY: 'Fırın', FAST_FOOD: 'Fast food' };
const statusClasses = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 ring-rose-200',
  REJECTED: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const formatDate = (date) => new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
const StatusBadge = ({ status }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[status]}`}>{statusLabels[status]}</span>;
const StatCard = ({ label, value, accent }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`mb-5 h-2 w-10 rounded-full ${accent}`} /><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p></div>;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isRestaurantsPage = location.pathname === '/admin/restaurants';
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, restaurantsData] = await Promise.all([adminService.getStats(), adminService.getRestaurants()]);
      setStats(statsData.stats);
      setRestaurants(restaurantsData.restaurants);
    } catch (err) {
      setError(err.response?.data?.error || 'Panel verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (restaurant, action, confirmationMessage) => {
    if (confirmationMessage && !window.confirm(confirmationMessage)) return;
    setActionId(restaurant._id);
    setError('');
    try {
      await adminService.updateStatus(restaurant._id, action);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Restoran durumu güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const renderActions = (restaurant) => {
    const isBusy = actionId === restaurant._id;
    const actionClass = 'rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
    if (restaurant.status === 'PENDING') return <div className="flex flex-wrap gap-2"><button disabled={isBusy} onClick={() => handleAction(restaurant, 'approve')} className={`${actionClass} bg-emerald-600 text-white hover:bg-emerald-700`}>Onayla</button><button disabled={isBusy} onClick={() => handleAction(restaurant, 'reject', 'Bu restoranı reddetmek istediğinize emin misiniz?')} className={`${actionClass} bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50`}>Reddet</button></div>;
    if (restaurant.status === 'ACTIVE') return <button disabled={isBusy} onClick={() => handleAction(restaurant, 'suspend', 'Bu restoranı askıya almak istediğinize emin misiniz?')} className={`${actionClass} bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50`}>Askıya Al</button>;
    return <button disabled={isBusy} onClick={() => handleAction(restaurant, 'activate')} className={`${actionClass} bg-slate-900 text-white hover:bg-slate-700`}>Aktifleştir</button>;
  };

  return <div className="dashboard-shell min-h-screen bg-slate-50 text-slate-900">
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col"><div className="border-b border-slate-100 px-6 py-7"><img src="/logo.svg" alt="zuuqrmenu" className="admin-brand__logo" /><h1 className="mt-3 text-xl font-semibold tracking-tight">Yönetim Paneli</h1></div><nav className="flex-1 space-y-1 px-3 py-6"><NavLink to="/admin" end className={({ isActive }) => `block rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Genel Bakış</NavLink><NavLink to="/admin/restaurants" className={({ isActive }) => `block rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>Restoranlar</NavLink><span className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400">Ayarlar</span></nav><div className="border-t border-slate-100 p-4"><p className="truncate px-2 text-xs text-slate-500">{user?.name}</p><button onClick={logout} className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600">Çıkış Yap</button></div></aside>
    <main className="lg:pl-64"><header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><p className="text-sm font-medium text-emerald-600">Yönetim</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">{isRestaurantsPage ? 'Restoranlar' : 'Genel Bakış'}</h2></div><button onClick={logout} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 lg:hidden">Çıkış</button></div></header>
      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">{error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}{loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Panel verileri yükleniyor...</div> : <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Toplam Restoran" value={stats?.total ?? 0} accent="bg-slate-900" /><StatCard label="Onay Bekleyen" value={stats?.pending ?? 0} accent="bg-amber-400" /><StatCard label="Aktif" value={stats?.active ?? 0} accent="bg-emerald-500" /><StatCard label="Askıya Alınmış" value={stats?.suspended ?? 0} accent="bg-rose-500" /></section>
        {!isRestaurantsPage && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Operasyon özeti</p><h3 className="mt-1 text-xl font-semibold">Restoran başvuruları</h3></div><NavLink to="/admin/restaurants" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Restoranları Gör</NavLink></div><p className="mt-5 text-sm text-slate-600">{stats?.pending ? `${stats.pending} restoran başvurusu onayınızı bekliyor.` : 'Onay bekleyen restoran bulunmuyor.'}</p></section>}
        {isRestaurantsPage && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-6 py-5"><h3 className="font-semibold">Kayıtlı restoranlar</h3><p className="mt-1 text-sm text-slate-500">Başvuruları ve hesap durumlarını buradan yönetin.</p></div>{restaurants.length === 0 ? <p className="px-6 py-12 text-center text-sm text-slate-500">Kayıtlı restoran bulunmuyor.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-6 py-3 font-semibold">Restoran</th><th className="px-6 py-3 font-semibold">İşletme</th><th className="px-6 py-3 font-semibold">Şehir</th><th className="px-6 py-3 font-semibold">Kayıt tarihi</th><th className="px-6 py-3 font-semibold">Durum</th><th className="px-6 py-3 font-semibold">Menü</th><th className="px-6 py-3 font-semibold">İşlemler</th></tr></thead><tbody className="divide-y divide-slate-100">{restaurants.map((restaurant) => <tr key={restaurant._id} className="align-middle hover:bg-slate-50/70"><td className="px-6 py-4"><p className="font-semibold text-slate-900">{restaurant.name}</p><p className="mt-1 text-xs text-slate-500">{restaurant.ownerId?.email || 'E-posta yok'}</p></td><td className="px-6 py-4 text-slate-600">{businessTypeLabels[restaurant.businessType] || restaurant.businessType}</td><td className="px-6 py-4 text-slate-600">{restaurant.city || '-'}</td><td className="whitespace-nowrap px-6 py-4 text-slate-600">{formatDate(restaurant.createdAt)}</td><td className="px-6 py-4"><StatusBadge status={restaurant.status} /></td><td className="px-6 py-4 text-slate-600">{restaurant.menuStatus === 'PUBLISHED' ? 'Yayında' : restaurant.menuStatus === 'HIDDEN' ? 'Gizli' : 'Taslak'}</td><td className="px-6 py-4">{renderActions(restaurant)}</td></tr>)}</tbody></table></div>}</section>}
      </>}</div></main>
  </div>;
};

export default AdminDashboard;
