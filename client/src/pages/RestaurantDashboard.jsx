import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import MenuOnboardingModal from '../components/MenuOnboardingModal';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { PageHeader, Card, Stat, Button, Segmented, ActionRow, EmptyState, Notice, Icon } from '../components/dashboard/ui';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';

const statusTone = { DRAFT: 'draft', PUBLISHED: 'published', HIDDEN: 'hidden' };

const formatTimeAgo = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Az önce';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dk önce`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} saat önce`;
  if (diffSec < 172800) return 'Dün';
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(date);
};

const ViewsChart = ({ series }) => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const maximum = Math.max(...series.map((item) => item.count), 1);
  const totalViews = series.reduce((sum, item) => sum + item.count, 0);
  const avgViews = series.length ? (totalViews / series.length).toFixed(1) : '0.0';
  const hasViews = series.some((item) => item.count > 0);
  const axisStep = Math.max(Math.ceil(maximum / 4), 1);
  const axisValues = [axisStep * 4, axisStep * 3, axisStep * 2, axisStep, 0];

  return (
    <div className="overview-chart-wrapper" aria-label="Günlük menü görüntülenmeleri">
      <div className="overview-chart-meta">
        <div className="overview-chart-meta__stat">
          <span>Dönem Toplamı</span>
          <strong>{totalViews} <small>ziyaret</small></strong>
        </div>
        <div className="overview-chart-meta__divider" />
        <div className="overview-chart-meta__stat">
          <span>Günlük Ortalama</span>
          <strong>{avgViews} <small>/ gün</small></strong>
        </div>
      </div>

      <div className="overview-chart">
        <div className="overview-chart__plot">
          <div className="overview-chart__axis" aria-hidden="true">
            {axisValues.map((value) => <span key={value}>{value}</span>)}
          </div>
          <div className="overview-chart__bars">
            {series.map((item) => {
              const isHovered = hoveredItem?.date === item.date;
              const formattedDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(`${item.date}T12:00:00`));
              const heightPercent = Math.max(item.count ? (item.count / maximum) * 100 : 4, 4);
              return (
                <div
                  className={`overview-chart__bar-wrap ${isHovered ? 'is-hovered' : ''}`}
                  key={item.date}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {isHovered && (
                    <div className="overview-chart__tooltip">
                      <b>{item.count} ziyaret</b>
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  <span className="overview-chart__bar" style={{ height: `${heightPercent}%` }} />
                  <small>{formattedDate}</small>
                </div>
              );
            })}
          </div>
        </div>
        {!hasViews && (
          <div className="overview-chart__empty-wrap">
            <p className="overview-chart__empty">Bu dönemde henüz menü görüntülenmesi bulunmuyor.</p>
            <span className="overview-chart__empty-tip">Masalarınıza QR kod yerleştirerek ilk ziyaretçilerinizi karşılayın.</span>
          </div>
        )}
      </div>
    </div>
  );
};

const OverviewStatusDialog = ({ currentStatus, onClose, onSelect }) => {
const [isClosing, setIsClosing] = useState(false);
const closingRef = useRef(false);
const closeTimer = useRef(null);

const handleClose = useCallback((callback) => {
  if (closingRef.current) return;
  closingRef.current = true;
  setIsClosing(true);
  closeTimer.current = window.setTimeout(() => {
    if (typeof callback === 'function') callback();
    else onClose();
  }, 200);
}, [onClose]);

useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.clearTimeout(closeTimer.current);
  };
}, [handleClose]);

return (
  <div
    className={`overview-status-dialog-backdrop ${isClosing ? 'is-closing' : ''}`}
    role="presentation"
    onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
  >
    <div className={`overview-status-dialog ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="overview-status-dialog-title">
      <div className="overview-status-dialog__heading">
        <div>
          <p className="overview-eyebrow">Menü durumu</p>
          <h2 id="overview-status-dialog-title">Menü Erişimini Yönetin</h2>
        </div>
        <button type="button" onClick={() => handleClose()} aria-label="Kapat">×</button>
      </div>
      <p>Menünüzün QR kod ve public web bağlantısında misafirlere nasıl görüneceğini seçin.</p>
      <div className="overview-status-options">
        {[
          ['DRAFT', 'Taslak', 'Menü hazırlanıyor ekranı gösterilir, müşterilere kapalıdır.'],
          ['PUBLISHED', 'Yayında', 'Misafirler QR kod ile menünüzü anında görüntüler.'],
          ['HIDDEN', 'Gizli', 'Menü geçici olarak erişime kapatılır.'],
        ].map(([value, label, description]) => (
          <button
            type="button"
            key={value}
            onClick={() => handleClose(() => onSelect(value))}
            className={currentStatus === value ? 'is-active' : ''}
          >
            <span>
              <b>{label}</b>
              <small>{description}</small>
            </span>
            <i>{currentStatus === value ? '✓' : '›'}</i>
          </button>
        ))}
      </div>
    </div>
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
  const [copied, setCopied] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => Boolean(user && !user.username));
  const [statusDialog, setStatusDialog] = useState(false);

  useEffect(() => {
    menuService.getOverview().then(setOverview).catch(() => setError('Dashboard verileri yüklenirken bir sorun oluştu.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3300);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const menuIdentity = user?.username || '';
  const publicUrl = menuIdentity ? getPublicMenuUrl(menuIdentity) : null;
  const currentStatus = overview?.stats?.menuStatus || 'DRAFT';
  const chartSeries = overview?.views?.[range] || [];
  const chartKey = useMemo(() => `${range}-${chartSeries.length}`, [range, chartSeries.length]);

  const totalProducts = overview?.stats?.productCount ?? 0;
  const activeProducts = overview?.stats?.activeProductCount ?? 0;
  const passiveProducts = Math.max(0, totalProducts - activeProducts);
  const activeRatio = totalProducts > 0 ? Math.round((activeProducts / totalProducts) * 100) : 0;
  const sevenSeries = overview?.views?.sevenDays || [];
  const todayViews = sevenSeries.length ? sevenSeries[sevenSeries.length - 1].count : 0;
  const weekViews = sevenSeries.reduce((sum, item) => sum + item.count, 0);
  const statusCopy = {
    PUBLISHED: ['Menünüz yayında', 'Masadaki QR kodu okutan herkes güncel menünüzü görüyor.'],
    DRAFT: ['Menünüz taslak', 'Müşteriler şu an "menü hazırlanıyor" ekranını görüyor.'],
    HIDDEN: ['Menünüz gizli', 'Menü geçici olarak erişime kapalı; QR kod açılmıyor.'],
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = publicUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError('Bağlantı kopyalanamadı.');
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

  return (
    <RestaurantLayout>
      <div className="dp">
        <PageHeader
          kicker="Genel bakış"
          title={overview?.restaurant?.name || restaurant?.name}
          lede="Menünüzün bugünkü durumunu ve ziyaretçi hareketlerini buradan takip edin."
          actions={publicUrl && <Button href={publicUrl} variant="solid" icon="external">Menüyü gör</Button>}
        />

        {notice && <Notice tone="ok">{notice}</Notice>}
        {error && <Notice tone="bad">{error}</Notice>}

        {loading ? <DashboardSkeleton variant="overview" /> : <>
          {/* Publish status + public address */}
          <Card className="dp-hero">
            <div className="dp-hero__status">
              <span className={`dp-hero__dot dp-hero__dot--${statusTone[currentStatus] || 'draft'}`} aria-hidden="true" />
              <div>
                <h2 className="dp-hero__title">{statusCopy[currentStatus]?.[0] || statusCopy.DRAFT[0]}</h2>
                <p className="dp-hero__text">{statusCopy[currentStatus]?.[1] || statusCopy.DRAFT[1]}</p>
              </div>
            </div>

            {menuIdentity ? (
              <div className="dp-hero__side">
                <div className="dp-link">
                  <code title={publicUrl}>{publicUrl?.replace(/^https?:\/\//, '')}</code>
                  <button type="button" className={`dp-btn dp-btn--sm ${copied ? 'dp-btn--lime' : ''}`} onClick={handleCopyLink} aria-live="polite">
                    <Icon name={copied ? 'check' : 'copy'} size={15} />
                    <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
                <Button variant="ghost" icon="spark" onClick={() => setStatusDialog(true)}>Yayın durumunu değiştir</Button>
              </div>
            ) : (
              <div className="dp-hero__side">
                <Button variant="lime" icon="plus" onClick={() => setOnboardingOpen(true)}>Menü adresi oluştur</Button>
              </div>
            )}
          </Card>

          {/* Numbers that matter */}
          <div className="dp-grid dp-grid--stats">
            <Stat icon="eye" label="Bugün" value={todayViews} hint="menü görüntülenmesi" />
            <Stat icon="users" label="Son 7 gün" value={weekViews} hint={`Toplam ${overview?.stats?.totalViews ?? 0} ziyaret`} />
            <Stat icon="tag" label="Satıştaki ürün" value={`${activeProducts}/${totalProducts}`} progress={activeRatio} hint={passiveProducts > 0 ? `${passiveProducts} ürün satışa kapalı` : 'Tüm ürünler satışta'} />
            <Stat icon="layers" label="Kategori" value={overview?.stats?.categoryCount ?? 0} hint="Menünüzdeki bölüm" />
          </div>

          {/* Traffic + shortcuts */}
          <div className="dp-grid dp-grid--2-1">
            <Card
              title="Ziyaretçi hareketleri"
              sub="Menünüzün günlük görüntülenme sayısı"
              actions={<>
                <Segmented label="Dönem" value={range} onChange={setRange} options={[['sevenDays', '7 gün'], ['thirtyDays', '30 gün']]} />
                <Button to="/dashboard/analytics" variant="ghost" className="dp-btn--sm" icon="chevron">Ayrıntılar</Button>
              </>}
            >
              <ViewsChart key={chartKey} series={chartSeries} />
            </Card>

            <Card title="Hızlı işlemler" sub="En sık yapılanlar">
              <div className="dp-actions-list">
                <ActionRow to="/dashboard/menu" icon="plus" title="Ürün ekle" desc="Yeni bir lezzet ya da fiyat" />
                <ActionRow to="/dashboard/menu" icon="layers" title="Kategori ekle" desc="Menü bölümlerini düzenleyin" />
                <ActionRow to="/dashboard/qr" icon="qr" title="QR kodunu indir" desc="Masalar için baskıya hazır" />
                <ActionRow to="/dashboard/settings" icon="palette" title="Marka ve tema" desc="Logo, renk ve görünüm" />
              </div>
            </Card>
          </div>

          {/* Health + activity */}
          <div className="dp-grid dp-grid--1-2">
            <Card title="Menü sağlığı" sub="İçeriğinizin ziyaretçilere ne kadarı açık">
              <div className="dp-health">
                <p className="dp-health__pct">%{activeRatio}</p>
                <p className="dp-health__text">
                  {activeRatio === 100 ? 'Tüm menünüz satışta.' : passiveProducts > 0 ? `${passiveProducts} ürün geçici olarak satışa kapalı.` : 'Menünüz ziyaretçilere hazır.'}
                </p>
              </div>
              <div className="dp-bar dp-bar--lg" aria-hidden="true"><span style={{ width: `${activeRatio}%` }} /></div>
              <dl className="dp-kv">
                <div><dt>Satıştaki ürün</dt><dd>{activeProducts} / {totalProducts}</dd></div>
                <div><dt>Kategori</dt><dd>{overview?.stats?.categoryCount ?? 0}</dd></div>
                <div><dt>Toplam ziyaret</dt><dd>{overview?.stats?.totalViews ?? 0}</dd></div>
              </dl>
              <Button to="/dashboard/menu" variant="ghost" icon="chevron">Menüyü yönet</Button>
            </Card>

            <Card title="Son değişiklikler" sub="Menünüzde yapılan güncellemeler" actions={<Button to="/dashboard/menu" variant="ghost" className="dp-btn--sm" icon="chevron">Menüye git</Button>}>
              {overview?.activity?.length ? (
                <ul className="dp-timeline">
                  {overview.activity.slice(0, 5).map((item, index) => (
                    <li key={`${item.type}-${item.date}-${index}`}>
                      <span className="dp-timeline__icon"><Icon name={item.type === 'product' ? 'tag' : 'layers'} size={17} /></span>
                      <div><b>{item.label}</b><small>{formatTimeAgo(item.date)}</small></div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Henüz bir değişiklik yok" text="İlk ürününüzü eklediğinizde yapılan güncellemeler burada listelenir." action={<Button to="/dashboard/menu" variant="lime" icon="plus">İlk ürünü ekle</Button>} />
              )}
            </Card>
          </div>
        </>}
      </div>

      {statusDialog && (
        <OverviewStatusDialog
          currentStatus={currentStatus}
          onClose={() => setStatusDialog(false)}
          onSelect={(status) => updateMenuStatus(status)}
        />
      )}

      {onboardingOpen && (
        <MenuOnboardingModal
          restaurantName={restaurant?.name || overview?.restaurant?.name || 'Restoranınız'}
          onCreate={createMenu}
        />
      )}
    </RestaurantLayout>
  );
};

export default RestaurantDashboard;
