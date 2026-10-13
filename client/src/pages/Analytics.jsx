import { useEffect, useMemo, useRef, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { PageHeader, Card, Stat as KpiStat, Button, Segmented, EmptyState, Notice, Icon } from '../components/dashboard/ui';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';

const pad = (value) => String(value).padStart(2, '0');
const dateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const rangeFromDays = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  return { startDate: dateString(start), endDate: dateString(end) };
};
const formatDate = (value) =>
  new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));

const nf = (n) => Number(n || 0).toLocaleString('tr-TR');

/** One ranked list card: top 5 rows with a bar each; "all" opens the detail modal. */
const RankCard = ({ title, sub, items, max, empty, onMore }) => {
  const visible = items.slice(0, 5);
  return (
    <Card title={title} sub={sub} actions={items.length > 5 && <button type="button" className="dp-btn dp-btn--sm" onClick={onMore}>Tümü ({items.length})</button>}>
      {visible.length ? (
        <ol className="dp-rank">
          {visible.map((item, index) => (
            <li key={item.key || index}>
              <span className={`dp-rank__n ${index === 0 ? 'is-first' : ''}`}>{index + 1}</span>
              {item.image !== undefined && (item.image
                ? <img className="dp-rank__img" src={item.image} alt="" loading="lazy" />
                : <span className="dp-rank__img dp-rank__img--empty" aria-hidden="true" />)}
              <div className="dp-rank__body">
                <div className="dp-rank__row">
                  <b title={item.label}>{item.label}</b>
                  <span>{nf(item.count)} <small>{item.unit}</small></span>
                </div>
                <div className="dp-bar" aria-hidden="true"><span style={{ width: `${Math.max(6, Math.round(((item.count || 0) / (max || 1)) * 100))}%` }} /></div>
                {(item.meta || item.share !== undefined && item.share !== null) && (
                  <small className="dp-rank__meta">{item.meta}{item.meta && item.share != null ? ' · ' : ''}{item.share != null ? `%${item.share} pay` : ''}</small>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title={empty} />
      )}
    </Card>
  );
};

const getTimePeriodLabel = (hour) => {
  if (hour >= 8 && hour < 12) return { label: 'Sabah / Kahvaltı', tone: 'bg-slate-100 text-slate-700 border-slate-200' };
  if (hour >= 12 && hour < 16) return { label: 'Öğle Servisi', tone: 'bg-slate-100 text-slate-700 border-slate-200' };
  if (hour >= 16 && hour < 19) return { label: 'İkindi', tone: 'bg-slate-100 text-slate-700 border-slate-200' };
  if (hour >= 19 && hour < 23) return { label: 'Akşam Servisi', tone: 'bg-slate-100 text-slate-700 border-slate-200' };
  return { label: 'Gece', tone: 'bg-slate-100 text-slate-600 border-slate-200' };
};

// Reusable Detail Modal
const AnalyticsDetailModal = ({ config, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    if (!config) return;
    const handleKeyDown = (e) => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow || '';
    };
  }, [config, isClosing]);

  if (!config) return null;

  const { title, subtitle, type, items = [], totalSum = 0, maxCount = 1 } = config;

  const filteredItems = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLocaleLowerCase('tr');
    const label = (item.name || item.day || `${item.hour}:00`).toLocaleLowerCase('tr');
    const cat = (item.categoryName || '').toLocaleLowerCase('tr');
    return label.includes(q) || cat.includes(q);
  });

  return (
    <div
      className={`analytics-detail-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className={`analytics-detail-modal w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="analytics-detail-modal-header flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="modal-title" className="text-base font-bold text-slate-900">
                {title}
              </h3>
              <span className="analytics-modal-badge rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {items.length} kayıt
              </span>
            </div>
            <p className="analytics-modal-subtitle text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors text-lg"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Search filter if items > 6 */}
        {items.length > 6 && (
          <div className="analytics-detail-modal-search px-6 py-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Listede ara..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Items List */}
        <div className="analytics-detail-modal-body flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const pct = Math.round(((item.count || 0) / maxCount) * 100);
              const share = totalSum > 0 ? Math.round(((item.count || 0) / totalSum) * 100) : 0;
              const period = type === 'hours' ? getTimePeriodLabel(item.hour) : null;

              return (
                <div key={item.name || item.day || item.hour || idx} className="analytics-modal-row py-3 first:pt-1 last:pb-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0 ? 'analytics-modal-rank-1' : 'analytics-modal-rank'
                      }`}>
                        {idx + 1}
                      </span>
                      {type === 'products' && item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-8 w-8 shrink-0 rounded-lg object-cover border border-slate-200"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.name || item.day || `${item.hour}:00 – ${item.hour + 1}:00`}
                        </p>
                        {item.categoryName && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.categoryName}
                          </span>
                        )}
                        {period && (
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold border ${period.tone} mt-0.5`}>
                            {period.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {share > 0 && (
                        <span className="text-xs text-slate-400 font-medium">
                          %{share}
                        </span>
                      )}
                      <span className="analytics-modal-count-pill rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800">
                        {item.count} <span className="font-normal text-slate-400">
                          {type === 'products' ? 'inceleme' : type === 'categories' ? 'tık' : type === 'days' ? 'ziyaret' : 'aktivite'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="analytics-modal-track w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`analytics-modal-fill h-full rounded-full transition-all duration-300 ${
                        idx === 0 ? 'analytics-modal-fill-1' : ''
                      }`}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">Aramanızla eşleşen sonuç bulunamadı.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="analytics-detail-modal-footer flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50">
          <span className="analytics-modal-footer-count text-xs text-slate-400">
            Toplam {items.length} kayıt listelendi
          </span>
          <button
            type="button"
            onClick={onClose}
            className="analytics-modal-close-btn px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-[#DEFF36] text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

// Floating Custom Date Picker Popover
const DateRangePopover = ({ isOpen, onClose, onApply, defaultStart, defaultEnd }) => {
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const popoverRef = useRef(null);

  useEffect(() => {
    setStart(defaultStart);
    setEnd(defaultEnd);
  }, [defaultStart, defaultEnd, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    if (start && end) {
      onApply(start, end);
    }
  };

  return (
    <div
      ref={popoverRef}
      className="date-range-popover absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 animate-fadeIn"
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[#485900] shrink-0">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Özel Tarih Aralığı
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleApply} className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[11px] font-bold text-slate-500">
            Başlangıç
            <input
              type="date"
              value={start}
              max={end || dateString(new Date())}
              onChange={(e) => setStart(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 bg-slate-50/70"
              required
            />
          </label>
          <label className="block text-[11px] font-bold text-slate-500">
            Bitiş
            <input
              type="date"
              value={end}
              min={start}
              max={dateString(new Date())}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 font-medium outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 bg-slate-50/70"
              required
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-[#DEFF36] shadow-xs transition-colors cursor-pointer"
          >
            Uygula
          </button>
        </div>
      </form>
    </div>
  );
};

// Modern Timeline Chart with Y-Axis & Clean X-Milestones (No cluttered dots!)
const TimelineViewsChart = ({ dailyViews = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxVal = Math.max(...dailyViews.map((d) => d.count || 0), 0);
  let yMax = 4;
  if (maxVal > 50) yMax = Math.ceil(maxVal / 20) * 20;
  else if (maxVal > 20) yMax = Math.ceil(maxVal / 10) * 10;
  else if (maxVal > 5) yMax = Math.ceil(maxVal / 5) * 5;
  else if (maxVal > 0) yMax = maxVal + 1;

  const yMid = Math.round(yMax / 2);
  const totalDays = dailyViews.length;

  // Clean milestone dates calculation: well-spaced points across the axis for 30d/90d, all days for 7d
  const labelIndices = useMemo(() => {
    if (totalDays <= 8) return new Set(dailyViews.map((_, i) => i));
    const targetCount = totalDays <= 32 ? 5 : 4;
    const indices = new Set();
    const step = (totalDays - 1) / (targetCount - 1);
    for (let i = 0; i < targetCount; i++) {
      indices.add(Math.round(i * step));
    }
    indices.add(0);
    indices.add(totalDays - 1);
    return indices;
  }, [totalDays, dailyViews]);

  return (
    <div className="w-full mt-4 flex flex-col gap-2 select-none">
      <div className="relative flex gap-2 sm:gap-3 h-44 sm:h-48 w-full">
        {/* Y-Axis scale */}
        <div className="flex flex-col justify-between items-end pb-7 pr-1 text-[10px] font-mono text-slate-400 font-semibold w-7 shrink-0">
          <span>{yMax}</span>
          <span>{yMid}</span>
          <span>0</span>
        </div>

        {/* Chart plot area */}
        <div className="relative flex-1 flex flex-col justify-between h-full pb-7">
          {/* Faint horizontal guide lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-7 pointer-events-none">
            <div className="w-full border-b border-slate-200/50 border-dashed" />
            <div className="w-full border-b border-slate-200/50 border-dashed" />
            <div className="w-full border-b border-slate-200" />
          </div>

          {/* Bar columns */}
          <div className="relative z-10 flex items-end h-full w-full gap-0.5 sm:gap-1">
            {dailyViews.map((item, idx) => {
              const heightPct = yMax > 0 ? (item.count / yMax) * 100 : 0;
              const isHovered = hoveredPoint?.date === item.date;
              const hasLabel = labelIndices.has(idx);

              return (
                <div
                  key={item.date}
                  onMouseEnter={() => setHoveredPoint(item)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setHoveredPoint(isHovered ? null : item)}
                  className="group relative flex-1 h-full flex flex-col items-center justify-end cursor-pointer"
                >
                  {/* Floating tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-30 left-1/2 -translate-x-1/2 rounded-xl bg-slate-950 text-white px-3 py-1.5 text-center shadow-xl border border-slate-800 pointer-events-none whitespace-nowrap animate-fadeIn">
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {formatDate(item.date)}
                      </span>
                      <span className="block text-xs font-bold text-[#DEFF36]">
                        {item.count} görüntülenme
                      </span>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-slate-800" />
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[24px] rounded-t-sm transition-all duration-200 ${
                      item.count > 0
                        ? isHovered
                          ? 'bg-[#DEFF36] scale-y-105 shadow-xs'
                          : 'bg-[#485900] hover:bg-[#5a7000]'
                        : 'bg-slate-200/50 hover:bg-slate-300/60'
                    }`}
                    style={{
                      height: `${Math.max(heightPct, 3)}%`,
                    }}
                  />

                  {/* Clean X-axis label without any crowding dots */}
                  {hasLabel && (
                    <div
                      className={`absolute top-full mt-2 whitespace-nowrap text-[9px] sm:text-[10px] font-medium pointer-events-none transition-colors ${
                        idx === 0
                          ? 'left-0'
                          : idx === totalDays - 1
                            ? 'right-0'
                            : 'left-1/2 -translate-x-1/2'
                      } ${
                        isHovered ? 'text-[#485900] font-bold' : 'text-slate-400'
                      }`}
                    >
                      {formatDate(item.date)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Analytics = () => {
  const { user, restaurant } = useAuth();
  const [range, setRange] = useState('7');
  const [custom, setCustom] = useState(rangeFromDays(7));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalConfig, setModalConfig] = useState(null);

  const username = user?.username || restaurant?.slug || '';
  const publicMenuUrl = username ? getPublicMenuUrl(username) : null;

  const selectedRange = useMemo(
    () => (range === 'custom' ? custom : rangeFromDays(Number(range))),
    [range, custom]
  );

  useEffect(() => {
    setLoading(true);
    setError('');
    analyticsService
      .getOverview(selectedRange)
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || 'İstatistikler yüklenemedi.'))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  useEffect(() => {
    if (!modalConfig) {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalConfig]);

  const comparison = data?.summary?.comparison;
  const heatmapMax = Math.max(
    ...(data?.heatmap || []).map((item) => item.count + item.interactions + item.categoryInteractions),
    1
  );
  const hasData =
    (data?.summary?.views || 0) +
      (data?.summary?.productInteractions || 0) +
      (data?.summary?.categoryInteractions || 0) >
    0;
  const heatmapSize =
    (data?.range?.days || 7) <= 7 ? 'comfortable' : (data?.range?.days || 7) <= 30 ? 'compact' : 'dense';
  const activeDay = selectedDay || data?.heatmap?.at(-1);

  // Total Views & Unique Visitors
  const totalViews = data?.summary?.views || 0;
  // Only real data: the server's tekil count, otherwise unknown (never estimated).
  const uniqueVisitors = data?.summary?.uniqueVisitors ?? null;

  const totalProductInteractions = data?.summary?.productInteractions || 0;
  const totalCategoryInteractions = data?.summary?.categoryInteractions || 0;
  const engagementRate =
    totalViews > 0
      ? Math.min(Math.round(((totalProductInteractions + totalCategoryInteractions) / totalViews) * 100), 100)
      : 0;

  // Max counts for progress bars
  const maxProductCount = Math.max(...(data?.topProducts || []).map((p) => p.count || 0), 1);
  const maxCategoryCount = Math.max(...(data?.topCategories || []).map((c) => c.count || 0), 1);
  const maxDayCount = Math.max(...(data?.busiestDays || []).map((d) => d.count || 0), 1);
  const maxHourCount = Math.max(...(data?.busiestHours || []).map((h) => h.count || 0), 1);

  // Total sums for percentage calculation
  const totalCategoryClicks = (data?.topCategories || []).reduce((acc, c) => acc + (c.count || 0), 0);
  const totalDayVisits = (data?.busiestDays || []).reduce((acc, d) => acc + (d.count || 0), 0);

  return (
    <RestaurantLayout>
      <div className="dp">
        <PageHeader
          kicker="İstatistikler"
          title={`${restaurant?.name || 'Menünüz'} nasıl gidiyor?`}
          lede="Ziyaretçilerinizin menüde neler yaptığını, en çok neyi incelediklerini ve yoğun saatleri buradan izleyin."
          actions={(
            <div className="dp-range">
              <Segmented
                label="Dönem"
                value={range === 'custom' ? '' : range}
                onChange={(value) => { setRange(value); setIsDatePickerOpen(false); }}
                options={[['1', 'Bugün'], ['7', '7 gün'], ['30', '30 gün'], ['90', '90 gün']]}
              />
              <button type="button" className={`dp-btn ${range === 'custom' ? 'dp-btn--solid' : ''}`} onClick={() => setIsDatePickerOpen((prev) => !prev)} aria-expanded={isDatePickerOpen}>
                <Icon name="clock" size={16} />
                <span>{range === 'custom' ? `${formatDate(custom.startDate)} – ${formatDate(custom.endDate)}` : 'Tarih seç'}</span>
              </button>
              <DateRangePopover
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onApply={(startDate, endDate) => {
                  setCustom({ startDate, endDate });
                  setRange('custom');
                  setIsDatePickerOpen(false);
                }}
                defaultStart={custom.startDate}
                defaultEnd={custom.endDate}
              />
            </div>
          )}
        />

        {error && <Notice tone="bad">{error}</Notice>}

        {loading ? (
          <DashboardSkeleton variant="analytics" />
        ) : (
          <>
            {!hasData && (
              <EmptyState
                title="Henüz yeterli veri yok"
                text="Menünüz ziyaret edilmeye başladığında görüntülenme ve ürün ilgisi burada görünür. QR kodunu masalara yerleştirerek başlayabilirsiniz."
                action={publicMenuUrl && <Button href={publicMenuUrl} variant="lime" icon="external">Menüyü aç</Button>}
              />
            )}

            <div className="dp-grid dp-grid--stats">
              <KpiStat icon="eye" label="Görüntülenme" value={nf(totalViews)} delta={comparison === null || comparison === undefined ? null : comparison} hint={comparison === null || comparison === undefined ? 'Önceki dönem için yeterli veri yok' : 'önceki döneme göre'} />
              <KpiStat icon="users" label="Benzersiz ziyaretçi" value={uniqueVisitors === null ? '—' : nf(uniqueVisitors)} hint={uniqueVisitors === null ? 'Bu dönem için tekil ziyaretçi verisi yok' : 'Farklı cihaz sayısı'} />
              <KpiStat icon="tag" label="Ürün incelemesi" value={nf(totalProductInteractions)} hint="Ürün detayı açılma sayısı" />
              <KpiStat icon="bolt" label="Etkileşim oranı" value={`%${engagementRate}`} progress={engagementRate} hint="Ziyaretlerin ne kadarı ürün ya da kategoriyle ilgilendi" />
            </div>

            <Card title="Dönemin öne çıkanları" sub="Seçili aralıkta en çok öne çıkan başlıklar">
              <div className="dp-highlights">
                <div><small>En popüler ürün</small><b>{data?.summary?.topProduct?.name || '—'}</b><span>{data?.summary?.topProduct ? `${nf(data.summary.topProduct.count)} inceleme` : 'Veri yok'}</span></div>
                <div><small>En aktif kategori</small><b>{data?.summary?.topCategory?.name || '—'}</b><span>{data?.summary?.topCategory ? `${nf(data.summary.topCategory.count)} seçim` : 'Veri yok'}</span></div>
                <div><small>En yoğun gün</small><b>{data?.busiestDays?.[0]?.day || '—'}</b><span>{data?.busiestDays?.[0] ? `${nf(data.busiestDays[0].count)} ziyaret` : 'Veri yok'}</span></div>
                <div><small>Zirve saat</small><b>{data?.busiestHours?.[0] ? `${data.busiestHours[0].hour}:00 – ${data.busiestHours[0].hour + 1}:00` : '—'}</b><span>{data?.busiestHours?.[0] ? `${nf(data.busiestHours[0].count)} aktivite` : 'Veri yok'}</span></div>
              </div>
            </Card>

            <div className="dp-grid dp-grid--2-1">
              <Card title="Menü görüntülenmeleri" sub={`Son ${data?.range?.days} günün günlük akışı`}>
                {data?.dailyViews?.length > 0 ? (
                  <TimelineViewsChart dailyViews={data.dailyViews} />
                ) : (
                  <EmptyState title="Bu aralıkta görüntülenme yok" />
                )}
              </Card>

              <Card title="Günlük yoğunluk" sub="Koyu günler daha hareketli. Bir güne dokunun.">
                <div className={`analytics-heatmap analytics-heatmap--${heatmapSize}`}>
                  {(data?.heatmap || []).map((item) => {
                    const intensity = (item.count + item.interactions + item.categoryInteractions) / heatmapMax;
                    return (
                      <button
                        type="button"
                        key={item.date}
                        className={activeDay?.date === item.date ? 'is-selected' : ''}
                        onClick={() => setSelectedDay(item)}
                        style={{ opacity: intensity ? 0.2 + intensity * 0.8 : 0.12 }}
                        aria-label={`${formatDate(item.date)} aktivitesi`}
                      />
                    );
                  })}
                </div>
                {activeDay && (
                  <dl className="dp-kv">
                    <div><dt>Tarih</dt><dd>{formatDate(activeDay.date)}</dd></div>
                    <div><dt>Menü görüntülenmesi</dt><dd>{nf(activeDay.count)}</dd></div>
                    <div><dt>Ürün tıklaması</dt><dd>{nf(activeDay.interactions)}</dd></div>
                    <div><dt>Kategori geçişi</dt><dd>{nf(activeDay.categoryInteractions)}</dd></div>
                  </dl>
                )}
              </Card>
            </div>

            <div className="dp-grid dp-grid--2">
              <RankCard
                title="En çok ilgi gören ürünler"
                sub="Müşterilerin detayını açtığı yemekler"
                items={(data?.topProducts || []).map((p) => ({ key: p.name, label: p.name, meta: p.categoryName, image: p.image, count: p.count, unit: 'inceleme' }))}
                max={maxProductCount}
                empty="Bu dönemde henüz ürün ilgisi yok."
                onMore={() => setModalConfig({ type: 'products', title: 'Tüm ilgi gören ürünler', subtitle: 'Müşterilerinizin menünüzde en çok incelediği yemekler', items: data.topProducts, maxCount: maxProductCount })}
              />
              <RankCard
                title="En çok gezilen kategoriler"
                sub="Menünüzün hangi bölümleri öne çıkıyor"
                items={(data?.topCategories || []).map((c) => ({ key: c.name, label: c.name, count: c.count, unit: 'tık', share: totalCategoryClicks ? Math.round(((c.count || 0) / totalCategoryClicks) * 100) : null }))}
                max={maxCategoryCount}
                empty="Bu dönemde henüz kategori verisi yok."
                onMore={() => setModalConfig({ type: 'categories', title: 'Tüm menü kategorileri', subtitle: 'Müşterilerinizin en çok gezindiği bölümler', items: data.topCategories, totalSum: totalCategoryClicks, maxCount: maxCategoryCount })}
              />
              <RankCard
                title="En yoğun günler"
                sub="Haftanın hangi günleri daha hareketli"
                items={(data?.busiestDays || []).map((d) => ({ key: d.day, label: d.day, count: d.count, unit: 'ziyaret', share: totalDayVisits ? Math.round(((d.count || 0) / totalDayVisits) * 100) : null }))}
                max={maxDayCount}
                empty="Bu dönemde henüz gün verisi yok."
                onMore={() => setModalConfig({ type: 'days', title: 'Haftalık ziyaret dağılımı', subtitle: 'Günlere göre menü açılışı', items: data.busiestDays, totalSum: totalDayVisits, maxCount: maxDayCount })}
              />
              <RankCard
                title="En yoğun saatler"
                sub="Mutfak ve servis hazırlığı için"
                items={(data?.busiestHours || []).map((h) => ({ key: String(h.hour), label: `${pad(h.hour)}:00 – ${pad((h.hour + 1) % 24)}:00`, meta: getTimePeriodLabel(h.hour).label, count: h.count, unit: 'aktivite' }))}
                max={maxHourCount}
                empty="Bu dönemde henüz saatlik veri yok."
                onMore={() => setModalConfig({ type: 'hours', title: 'Tüm servis saatleri', subtitle: 'Saat bazında açılma ve incelenme sıklığı', items: data.busiestHours, maxCount: maxHourCount })}
              />
            </div>
          </>
        )}

        {modalConfig && (
          <AnalyticsDetailModal
            config={modalConfig}
            onClose={() => setModalConfig(null)}
          />
        )}
      </div>
    </RestaurantLayout>
  );
};

export default Analytics;
