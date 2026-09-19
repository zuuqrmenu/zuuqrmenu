import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RestaurantLayout from '../components/RestaurantLayout';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import MenuOnboardingModal from '../components/MenuOnboardingModal';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';

const statusLabels = { DRAFT: 'Taslak', PUBLISHED: 'Yayında', HIDDEN: 'Gizli' };
const statusTone = { DRAFT: 'draft', PUBLISHED: 'published', HIDDEN: 'hidden' };

const IconEye = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTag = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

const IconLayers = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 2 10 5-10 5L2 7l10-5Z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </svg>
);

const IconQr = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

const IconCopy = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const IconCheck = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconExternal = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconSparkles = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
  </svg>
);

const IconPlus = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSliders = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const OverviewStat = ({ icon, tone = 'default', label, value, detail, badge }) => (
  <article className={`overview-stat-card overview-stat-card--${tone}`}>
    <div className="overview-stat-card__topline">
      <span className="overview-stat-card__icon" aria-hidden="true">{icon}</span>
      {badge ? <span className="overview-stat-card__badge">{badge}</span> : <small>{detail}</small>}
    </div>
    <p>{label}</p>
    <div className="overview-stat-card__bottom">
      <strong>{value}</strong>
      {badge && <small>{detail}</small>}
    </div>
  </article>
);

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

const OverviewStatusDialog = ({ currentStatus, onClose, onSelect }) => {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (typeof callback === 'function') callback();
      else onClose();
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

  return (
    <div
      className={`overview-status-dialog-backdrop ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
    >
      <div className={`overview-status-dialog ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="overview-status-dialog-title">
        <div className="overview-status-dialog__heading">
          <div>
            <p className="overview-eyebrow">Menü Durumu</p>
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
      <div className="overview-dashboard overview-dashboard--modern mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <section className="overview-modern-header">
          <div className="overview-modern-header__identity">
            <span className="overview-modern-header__mark" aria-hidden="true">
              <IconSparkles />
            </span>
            <div>
              <div className="overview-modern-header__eyebrow-row">
                <p className="overview-eyebrow">GENEL BAKIŞ</p>
                <span className="overview-status-indicator">
                  <span className={`overview-status-dot-pulse overview-status-dot-pulse--${statusTone[currentStatus] || 'draft'}`} />
                  {statusLabels[currentStatus] || 'Taslak'}
                </span>
              </div>
              <h2>{overview?.restaurant?.name || restaurant?.name}</h2>
              <p>Bugün menünüzdeki son durumları ve ziyaretçi hareketlerini anlık takip edin.</p>
            </div>
          </div>

          <div className="overview-modern-header__actions">
            <button
              type="button"
              className={`overview-menu-status overview-menu-status--${statusTone[currentStatus] || 'draft'}`}
              onClick={() => setStatusDialog(true)}
              title="Menü durumunu değiştir"
              aria-label="Menü durumunu değiştir"
            >
              <span>{statusLabels[currentStatus] || 'Taslak'}</span>
              <b aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="m4 16.5-.8 4.3 4.3-.8L19.2 8.3a2.4 2.4 0 0 0-3.4-3.4L4 16.5Z" />
                  <path d="m14.5 6.5 3 3" />
                </svg>
              </b>
            </button>

            {menuIdentity ? (
              <div className="overview-header-links">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`overview-copy-btn ${copied ? 'is-copied' : ''}`}
                  title={copied ? "Kopyalandı!" : "Linki Kopyala"}
                  aria-label={copied ? "Kopyalandı!" : "Linki Kopyala"}
                >
                  {copied ? <IconCheck /> : <IconCopy />}
                </button>

                <a
                  href={publicUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="overview-view-btn"
                  title="Menüyü yeni sekmede aç"
                >
                  <span>Menüyü Gör</span>
                  <IconExternal />
                </a>
              </div>
            ) : (
              <button
                type="button"
                className="overview-modern-create"
                onClick={() => setOnboardingOpen(true)}
              >
                Menüyü oluştur <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </section>

        {notice && <div className="settings-status settings-status--success is-visible" role="status">{notice}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{error}</div>}

        {loading ? <DashboardSkeleton variant="overview" /> : <>
          <section className="overview-stat-grid overview-stat-grid--modern">
            <OverviewStat
              icon={<IconEye />}
              tone="lime"
              label="Menü Görüntülenmesi"
              value={overview?.stats?.totalViews ?? 0}
              detail="Toplam ziyaret"
              badge="Canlı"
            />
            <OverviewStat
              icon={<IconTag />}
              tone="emerald"
              label="Aktif Ürünler"
              value={overview?.stats?.activeProductCount ?? 0}
              detail={`/ ${overview?.stats?.productCount ?? 0} menü ürünü`}
              badge={`%${activeRatio} Yayında`}
            />
            <OverviewStat
              icon={<IconLayers />}
              tone="amber"
              label="Kategoriler"
              value={overview?.stats?.categoryCount ?? 0}
              detail="Menü bölümü"
            />
            <OverviewStat
              icon={<IconQr />}
              tone="teal"
              label="Masa QR Erişimi"
              value={statusLabels[currentStatus] || 'Taslak'}
              detail={currentStatus === 'PUBLISHED' ? 'Misafirler görebilir' : 'Erişime kapalı'}
              badge={currentStatus === 'PUBLISHED' ? 'Aktif' : 'Pasif'}
            />
          </section>

          <section className="overview-modern-workspace">
            <article className="overview-panel overview-chart-panel overview-panel--modern-chart">
              <div className="overview-panel__heading">
                <div>
                  <p className="overview-eyebrow">ZİYARETÇİ HAREKETLERİ</p>
                  <h3>Menü Görüntülenme Özeti</h3>
                </div>
                <div className="overview-chart-actions">
                  <div className="overview-segmented">
                    <button type="button" className={range === 'sevenDays' ? 'is-active' : ''} onClick={() => setRange('sevenDays')}>7 gün</button>
                    <button type="button" className={range === 'thirtyDays' ? 'is-active' : ''} onClick={() => setRange('thirtyDays')}>30 gün</button>
                  </div>
                  <Link to="/dashboard/analytics" className="overview-detail-link">Detaylı İstatistikler →</Link>
                </div>
              </div>
              <ViewsChart key={chartKey} series={chartSeries} />
            </article>

            <aside className="overview-modern-sidebar">
              <article className="overview-panel overview-insights-panel">
                <div className="overview-panel__heading">
                  <div>
                    <p className="overview-eyebrow">MENÜ SAĞLIĞI</p>
                    <h3>İçerik & Erişilebilirlik</h3>
                  </div>
                  <span className="overview-insights-panel__badge" title="Menü sağlığı">
                    <IconSparkles />
                  </span>
                </div>

                <div className="overview-insights-health">
                  <div className="overview-insights-health__header">
                    <div>
                      <span className="overview-insights-health__title">Aktif Menü Oranı</span>
                      <p className="overview-insights-health__note">
                        {activeRatio === 100
                          ? 'Tüm menünüz misafirlerinize açık ve satışta.'
                          : passiveProducts > 0
                          ? `${passiveProducts} ürün geçici olarak satışa kapalı.`
                          : 'Menünüz ziyaretçilere sunulmaya hazır.'}
                      </p>
                    </div>
                    <span className="overview-insights-health__pct">%{activeRatio}</span>
                  </div>
                  <div className="overview-insights-progress">
                    <span style={{ width: `${activeRatio}%` }} />
                  </div>
                </div>

                <div className="overview-insights-list">
                  <div className="overview-insights-row">
                    <span className="overview-insights-row__label">
                      <i className="overview-dot overview-dot--active" /> Aktif Ürünler
                    </span>
                    <strong>{activeProducts}<small> / {totalProducts}</small></strong>
                  </div>
                  <div className="overview-insights-row">
                    <span className="overview-insights-row__label">
                      <i className="overview-dot overview-dot--category" /> Menü Kategorileri
                    </span>
                    <strong>{overview?.stats?.categoryCount ?? 0}</strong>
                  </div>
                  <div className="overview-insights-row">
                    <span className="overview-insights-row__label">
                      <i className="overview-dot overview-dot--views" /> Toplam Menü Ziyareti
                    </span>
                    <strong>{overview?.stats?.totalViews ?? 0}</strong>
                  </div>
                </div>

                <div className="overview-insights-panel__footer">
                  <div className="overview-insights-footer-action">
                    <p className="overview-panel__hint">Aktif ürün oranı ve masa QR erişiminiz.</p>
                    <Link to="/dashboard/menu" className="overview-insights-link">
                      Menüyü Yönet →
                    </Link>
                  </div>
                </div>
              </article>
            </aside>
          </section>

          <section className="overview-modern-bottom">
            <article className="overview-panel overview-actions-panel overview-actions-panel--modern">
              <div className="overview-panel__heading">
                <div>
                  <p className="overview-eyebrow">HIZLI İŞLEMLER</p>
                  <h3>Bugün ne yapmak istersiniz?</h3>
                </div>
              </div>
              <div className="overview-quick-actions">
                <Link to="/dashboard/menu" className="overview-quick-action">
                  <div className="overview-quick-action__icon overview-quick-action__icon--emerald">
                    <IconPlus />
                  </div>
                  <div className="overview-quick-action__text">
                    <b>Ürün Ekle</b>
                    <small>Yeni fiyat veya lezzet</small>
                  </div>
                </Link>
                <Link to="/dashboard/menu" className="overview-quick-action">
                  <div className="overview-quick-action__icon overview-quick-action__icon--lime">
                    <IconLayers />
                  </div>
                  <div className="overview-quick-action__text">
                    <b>Kategori Ekle</b>
                    <small>Menü bölümlerini düzenle</small>
                  </div>
                </Link>
                <Link to="/dashboard/qr" className="overview-quick-action">
                  <div className="overview-quick-action__icon overview-quick-action__icon--teal">
                    <IconQr />
                  </div>
                  <div className="overview-quick-action__text">
                    <b>Masa QR Kodları</b>
                    <small>İndir veya baskı al</small>
                  </div>
                </Link>
                <Link to="/dashboard/settings" className="overview-quick-action">
                  <div className="overview-quick-action__icon overview-quick-action__icon--amber">
                    <IconSliders />
                  </div>
                  <div className="overview-quick-action__text">
                    <b>Tasarım & Tema</b>
                    <small>Renk ve logo ayarları</small>
                  </div>
                </Link>
              </div>
            </article>

            <article className="overview-panel overview-activity-panel">
              <div className="overview-panel__heading">
                <div>
                  <p className="overview-eyebrow">SON AKTİVİTELER</p>
                  <h3>Menünüzdeki son değişiklikler</h3>
                </div>
                <Link to="/dashboard/menu" className="overview-detail-link">
                  Menüye Git →
                </Link>
              </div>
              {overview?.activity?.length ? (
                <div className="overview-activity-list">
                  {overview.activity.slice(0, 4).map((item, index) => {
                    const isProduct = item.type === 'product';
                    return (
                      <div className="overview-activity" key={`${item.type}-${item.date}-${index}`}>
                        <span className={`overview-activity__icon overview-activity__icon--${isProduct ? 'product' : 'category'}`} aria-hidden="true">
                          {isProduct ? <IconTag /> : <IconLayers />}
                        </span>
                        <div className="overview-activity__body">
                          <b>{item.label}</b>
                          <small>{formatTimeAgo(item.date)}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overview-activity-empty">
                  <p className="overview-empty">Henüz kaydedilmiş bir aktivite bulunmuyor.</p>
                  <Link to="/dashboard/menu" className="overview-activity-empty__action">
                    İlk ürününüzü ekleyin →
                  </Link>
                </div>
              )}
            </article>
          </section>
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
