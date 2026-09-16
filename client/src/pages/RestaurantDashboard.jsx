import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RestaurantLayout from '../components/RestaurantLayout';
import PublicMenuButton from '../components/PublicMenuButton';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';
import MenuOnboardingModal from '../components/MenuOnboardingModal';
import DashboardSkeleton from '../components/DashboardSkeleton';

const statusLabels = { DRAFT: 'Taslak', PUBLISHED: 'Yayında', HIDDEN: 'Gizli' };
const statusDescriptions = { DRAFT: 'Menünüz henüz yayınlanmadı.', PUBLISHED: 'Menünüz misafirleriniz için yayında.', HIDDEN: 'Menünüz şu anda ziyaretçilere gizli.' };
const statusActions = { DRAFT: ['Menüyü Düzenle', '/dashboard/menu'], PUBLISHED: ['Menüyü Görüntüle', null], HIDDEN: ['Menü Ayarlarını Aç', '/dashboard/menu'] };
const statusTone = { DRAFT: 'draft', PUBLISHED: 'published', HIDDEN: 'hidden' };

const OverviewStat = ({ icon, label, value, detail }) => (
  <article className="overview-stat-card">
    <span className="overview-stat-card__icon" aria-hidden="true">{icon}</span>
    <p>{label}</p>
    <strong>{value}</strong>
    <small>{detail}</small>
  </article>
);

const formatActivityDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
};

const getActivityIcon = (type, label = '') => {
  const normalized = label.toLowerCase();
  if (normalized.includes('silindi')) return '⌫';
  if (normalized.includes('eklendi')) return '+';
  if (type === 'category') return '▱';
  if (type === 'product') return '✎';
  return '≡';
};

const ViewsChart = ({ series }) => {
  const maximum = Math.max(...series.map((item) => item.count), 1);
  const hasViews = series.some((item) => item.count > 0);
  const axisStep = Math.max(Math.ceil(maximum / 4), 1);
  const axisValues = [axisStep * 4, axisStep * 3, axisStep * 2, axisStep, 0];
  return (
    <div className="overview-chart" aria-label="Günlük menü görüntülenmeleri">
      <div className="overview-chart__plot">
        <div className="overview-chart__axis" aria-hidden="true">{axisValues.map((value) => <span key={value}>{value}</span>)}</div>
        <div className="overview-chart__bars">
        {series.map((item) => <div className="overview-chart__bar-wrap" key={item.date} title={`${item.date}: ${item.count}`}><span className="overview-chart__bar" style={{ height: `${Math.max(item.count ? (item.count / maximum) * 100 : 3, 3)}%` }} /><small>{new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(`${item.date}T12:00:00`))}</small></div>)}
        </div>
      </div>
      {!hasViews && <p className="overview-chart__empty">Henüz menü görüntülenmesi bulunmuyor.</p>}
    </div>
  );
};

const RestaurantDashboard = () => {
  const { user, restaurant, createMenuIdentity } = useAuth();
  const [overview, setOverview] = useState(null);
  const [range, setRange] = useState('sevenDays');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [onboardingOpen, setOnboardingOpen] = useState(() => Boolean(user && !user.username));
  const [statusDialog, setStatusDialog] = useState(false);

  useEffect(() => {
    menuService.getOverview().then(setOverview).catch(() => setError('Dashboard verileri yüklenirken bir sorun oluştu.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const menuIdentity = user?.username || '';
  const publicUrl = getPublicMenuUrl(menuIdentity);
  const currentStatus = overview?.stats?.menuStatus || 'DRAFT';
  const [statusAction, statusRoute] = statusActions[currentStatus] || statusActions.DRAFT;
  const chartSeries = overview?.views?.[range] || [];
  const chartKey = useMemo(() => `${range}-${chartSeries.length}`, [range, chartSeries.length]);

  const copyUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setNotice('Menü bağlantısı kopyalandı.');
    } catch {
      setNotice('Bağlantı kopyalanamadı.');
    }
  };

  const createMenu = async (username) => {
    const result = await createMenuIdentity(username);
    if (result.success) {
      setOnboardingOpen(false);
      setNotice('Menünüz başarıyla oluşturuldu.');
    }
    return result;
  };

  const updateMenuStatus = async (nextStatus) => {
    try {
      const result = await menuService.updateStatus(nextStatus);
      setOverview((current) => ({
        ...current,
        stats: { ...current.stats, menuStatus: result.restaurant.menuStatus },
        restaurant: { ...current.restaurant, ...result.restaurant },
      }));
      setStatusDialog(false);
      setNotice(result.message);
    } catch (statusError) {
      setError(statusError.response?.data?.error || 'Menü durumu güncellenemedi.');
    }
  };

  const menuAction = menuIdentity
    ? <PublicMenuButton username={menuIdentity} label="Menüyü Görüntüle" />
    : <button type="button" className="overview-panel__action" onClick={() => setOnboardingOpen(true)}>Menüyü Oluştur <span aria-hidden="true">→</span></button>;

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <section className="overview-welcome">
          <div><p className="text-sm font-medium text-emerald-600">Genel Bakış</p><h2>Hoş geldin, {overview?.restaurant?.name || restaurant?.name}</h2><p>Menünüzün ve işletmenizin genel durumuna buradan göz atabilirsiniz.</p></div>
          <div className="overview-welcome__actions">
            <button type="button" className={`overview-menu-status overview-menu-status--${statusTone[currentStatus] || 'draft'}`} onClick={() => setStatusDialog(true)}>
              <span><i /> Menü {statusLabels[currentStatus] || 'Taslak'}</span><b aria-hidden="true">✎</b>
            </button>
            {menuAction}
          </div>
        </section>

        {notice && <div className="settings-status settings-status--success is-visible" role="status">{notice}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</div>}

        {loading ? <DashboardSkeleton variant="overview" /> : <>
          <section className="overview-stat-grid">
            <OverviewStat icon="◷" label="Menü görüntülenmeleri" value={overview?.stats?.totalViews ?? 0} detail="Toplam ziyaret" />
            <OverviewStat icon="▦" label="Kategoriler" value={overview?.stats?.categoryCount ?? 0} detail="Menü kategorisi" />
            <OverviewStat icon="□" label="Ürünler" value={overview?.stats?.productCount ?? 0} detail="Tüm ürünler" />
            <OverviewStat icon="✓" label="Aktif ürünler" value={overview?.stats?.activeProductCount ?? 0} detail="Şu anda satışta" />
          </section>

          <section className="overview-main-grid">
            <article className="overview-panel overview-status-panel">
              <div className="overview-panel__heading"><div><p className="overview-eyebrow">Menü durumu</p><h3>{statusLabels[currentStatus] || currentStatus}</h3></div><div className="overview-status-heading-actions"><span className={`overview-status-dot overview-status-dot--${currentStatus.toLowerCase()}`} /><button type="button" onClick={() => setStatusDialog(true)} aria-label="Menü durumunu düzenle">✎</button></div></div>
              <p className="overview-panel__description">{statusDescriptions[currentStatus] || 'Menünüzün mevcut durumunu buradan takip edin.'}</p>
              {menuIdentity ? (currentStatus === 'PUBLISHED' ? <PublicMenuButton username={menuIdentity} label="Menüyü Görüntüle" compact /> : <Link to={statusRoute} className="overview-panel__action">{statusAction} <span aria-hidden="true">→</span></Link>) : <button type="button" className="overview-panel__action" onClick={() => setOnboardingOpen(true)}>Menüyü Oluştur <span aria-hidden="true">→</span></button>}
            </article>

            <article className="overview-panel overview-chart-panel">
              <div className="overview-panel__heading"><div><p className="overview-eyebrow">Menü görüntülenmeleri</p><h3>Görüntülenme özeti</h3></div><div className="overview-chart-actions"><div className="overview-segmented"><button type="button" className={range === 'sevenDays' ? 'is-active' : ''} onClick={() => setRange('sevenDays')}>7 gün</button><button type="button" className={range === 'thirtyDays' ? 'is-active' : ''} onClick={() => setRange('thirtyDays')}>30 gün</button></div><Link to="/dashboard/analytics" className="overview-detail-link">Detaylı İstatistikler →</Link></div></div>
              <ViewsChart key={chartKey} series={chartSeries} />
            </article>
          </section>

          <section className="overview-lower-grid">
            <article className="overview-panel"><div className="overview-panel__heading"><div><p className="overview-eyebrow">Hızlı İşlemler</p><h3>Sık kullanılanlar</h3></div></div><div className="overview-quick-actions"><Link to="/dashboard/menu" className="overview-quick-action"><span>＋</span><b>Ürün Ekle</b><small>Menü yönetimine git</small></Link><Link to="/dashboard/menu" className="overview-quick-action"><span>▦</span><b>Kategori Ekle</b><small>Kategorileri yönet</small></Link><button type="button" onClick={() => menuIdentity ? window.open(publicUrl, '_blank', 'noopener,noreferrer') : setOnboardingOpen(true)} className="overview-quick-action"><span>↗</span><b>{menuIdentity ? 'Menüyü Görüntüle' : 'Menüyü Oluştur'}</b><small>{menuIdentity ? 'Misafir görünümü' : 'Menü adresini belirle'}</small></button><Link to="/dashboard/qr" className="overview-quick-action"><span>⌁</span><b>QR Kodunu Aç</b><small>QR yönetimine git</small></Link><Link to="/dashboard/appearance" className="overview-quick-action"><span>✦</span><b>Görünümü Düzenle</b><small>Tema ve renkler</small></Link></div></article>

            <article className="overview-panel overview-url-panel"><div className="overview-panel__heading"><div><p className="overview-eyebrow">Public menü</p><h3>Bağlantınız</h3></div></div><div className="overview-url-box"><span>{publicUrl || 'Menü bağlantısı hazırlanıyor'}</span><button type="button" onClick={copyUrl} disabled={!publicUrl}>Kopyala</button></div><p className="overview-panel__hint">Bu bağlantıyı misafirlerinizle paylaşabilirsiniz.</p></article>
          </section>

          <section className="overview-panel"><div className="overview-panel__heading"><div><p className="overview-eyebrow">Son Aktiviteler</p><h3>Menünüzdeki son değişiklikler</h3></div></div>{overview?.activity?.length ? <div className="overview-activity-list">{overview.activity.map((item, index) => <div className="overview-activity" key={`${item.type}-${item.date}-${index}`}><span className="overview-activity__icon" aria-hidden="true">{getActivityIcon(item.type, item.label)}</span><span><b>{item.label}</b><small>{formatActivityDate(item.date)}</small></span></div>)}</div> : <p className="overview-empty">Henüz bir aktivite bulunmuyor.</p>}</section>
        </>}
      </div>
      {statusDialog && <div className="overview-status-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setStatusDialog(false)}><div className="overview-status-dialog" role="dialog" aria-modal="true" aria-labelledby="overview-status-dialog-title"><div className="overview-status-dialog__heading"><div><p className="overview-eyebrow">Menü durumu</p><h2 id="overview-status-dialog-title">Menünüzü yönetin</h2></div><button type="button" onClick={() => setStatusDialog(false)} aria-label="Kapat">×</button></div><p>Menünüzün public linkte görünür olup olmayacağını seçin.</p><div className="overview-status-options">{[['DRAFT', 'Taslak', 'Menü hazırlanıyor ekranı gösterilir.'], ['PUBLISHED', 'Yayında', 'Misafirler menünüzü görüntüleyebilir.'], ['HIDDEN', 'Gizli', 'Menü geçici olarak erişime kapatılır.']].map(([value, label, description]) => <button type="button" key={value} onClick={() => updateMenuStatus(value)} className={currentStatus === value ? 'is-active' : ''}><span><b>{label}</b><small>{description}</small></span><i>{currentStatus === value ? '✓' : '›'}</i></button>)}</div></div></div>}
      {onboardingOpen && <MenuOnboardingModal restaurantName={restaurant?.name || overview?.restaurant?.name || 'Restoranınız'} onCreate={createMenu} />}
    </RestaurantLayout>
  );
};

export default RestaurantDashboard;
