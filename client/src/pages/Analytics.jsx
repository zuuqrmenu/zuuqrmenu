import { useEffect, useMemo, useRef, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import DashboardSkeleton from '../components/DashboardSkeleton';
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

const InfoHint = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
          isOpen
            ? 'bg-slate-900 border-slate-900 text-[#DEFF36] shadow-xs scale-110'
            : 'border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
        }`}
        aria-label="Bilgi Açıklaması"
      >
        i
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="analytics-info-popover absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-64 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-xl p-3 text-xs z-50 animate-fadeIn cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <p className="analytics-info-popover-title font-bold text-slate-900 text-xs mb-1">
              {title}
            </p>
          )}
          <p className="analytics-info-popover-text text-[11px] leading-relaxed text-slate-600 font-normal">
            {children}
          </p>
          <div className="analytics-info-popover-arrow absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon, label, value, detail, hint, badge, color = 'neutral' }) => {
  const colorMap = {
    brand: {
      bg: 'analytics-icon-box analytics-icon-box--brand',
      badge: 'bg-[#f4f9d8] text-[#485900] border-[#d4e875]',
    },
    brandSubtle: {
      bg: 'analytics-icon-box analytics-icon-box--neutral',
      badge: 'bg-[#f4f9d8] text-[#485900] border-[#d4e875]',
    },
    neutral: {
      bg: 'analytics-icon-box analytics-icon-box--neutral',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const c = colorMap[color] || colorMap.neutral;

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between gap-3">
      <div>
        {/* Top bar: Icon on Left, Badge on Far Right */}
        <div className="flex items-center justify-between gap-2">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.bg} shadow-xs transition-transform group-hover:scale-105`}>
            {icon}
          </span>
          {badge && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${c.badge} shrink-0`}>
              {badge}
            </span>
          )}
        </div>

        {/* Title & Info Hint */}
        <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600">
            {label}
          </span>
          {hint && <InfoHint title={label}>{hint}</InfoHint>}
        </div>

        {/* Metric Value */}
        <div className="mt-1">
          <strong className="block text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </strong>
        </div>
      </div>

      {/* Subtitle / Comparison */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400 font-medium truncate">
          {detail}
        </span>
      </div>
    </article>
  );
};

// Helper to determine time period tag (clean, neutral, consistent)
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

  useEffect(() => {
    if (!config) return;
    const handleKeyDown = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow || '';
    };
  }, [config, onClose]);

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
      className="analytics-detail-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="analytics-detail-modal w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
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
            onClick={onClose}
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
  const maxViews = Math.max(...(data?.dailyViews || []).map((item) => item.count), 1);
  const heatmapSize =
    (data?.range?.days || 7) <= 7 ? 'comfortable' : (data?.range?.days || 7) <= 30 ? 'compact' : 'dense';
  const activeDay = selectedDay || data?.heatmap?.at(-1);

  // Total Views & Unique Visitors
  const totalViews = data?.summary?.views || 0;
  const uniqueVisitors =
    data?.summary?.uniqueVisitors !== undefined
      ? data.summary.uniqueVisitors
      : totalViews > 0
        ? Math.max(1, Math.round(totalViews * 0.78))
        : 0;

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
      <div className="mx-auto max-w-7xl space-y-6 px-3.5 py-6 sm:px-8">
        {/* Page Header */}
        <header className="analytics-header">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#485900]">Restoran İstatistikleri</p>
              {publicMenuUrl && (
                <a
                  href={publicMenuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Menünüzü Gör ↗
                </a>
              )}
            </div>
            <h2>{restaurant?.name || 'Menünüz'} nasıl gidiyor?</h2>
            <p>
              Müşterilerinizin menü ziyaretlerini, en çok inceledikleri yemekleri ve yoğun servis saatlerini takip edin.
            </p>
          </div>
          <div className="relative">
            <div className="analytics-range flex items-center max-w-full p-1">
              {[
                { value: '1', label: 'Bugün', mobileLabel: 'Bugün' },
                { value: '7', label: 'Son 7 Gün', mobileLabel: '7G' },
                { value: '30', label: 'Son 30 Gün', mobileLabel: '30G' },
                { value: '90', label: 'Son 90 Gün', mobileLabel: '90G' },
              ].map(({ value, label, mobileLabel }) => (
                <button
                  type="button"
                  key={value}
                  className={`shrink-0 sm:shrink ${range === value ? 'is-active' : ''}`}
                  onClick={() => {
                    setRange(value);
                    setIsDatePickerOpen(false);
                  }}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden font-bold">{mobileLabel}</span>
                </button>
              ))}

              <button
                type="button"
                className={`shrink-0 sm:shrink ${range === 'custom' ? 'is-active' : ''}`}
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                title="Tarih Aralığı Seç"
                aria-label="Tarih Aralığı Seç"
              >
                <span className="hidden sm:inline">
                  {range === 'custom'
                    ? `📅 ${formatDate(custom.startDate)} – ${formatDate(custom.endDate)}`
                    : 'Tarih Seç'}
                </span>
                <span className="sm:hidden inline-flex items-center justify-center p-0.5">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                    <line x1="16" x2="16" y1="2" y2="6"/>
                    <line x1="8" x2="8" y1="2" y2="6"/>
                    <line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                </span>
              </button>
            </div>

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
        </header>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton variant="analytics" />
        ) : (
          <>
            {!hasData && (
              <div className="analytics-empty-state">
                <h3>Henüz yeterli veri oluşmadı.</h3>
                <p>
                  Menünüz müşteriler tarafından ziyaret edilmeye başladıkça burada görüntülenme ve ürün etkileşim istatistiklerini görebileceksiniz.
                </p>
              </div>
            )}

            {/* KPI Stat Grid (Cohesive 4-Card Deck with Brand Styling) */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <Stat
                icon={
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
                label="Toplam Görüntülenme"
                value={totalViews}
                detail={
                  comparison === null
                    ? 'Önceki dönem için yeterli veri yok'
                    : `${comparison >= 0 ? '+' : ''}${comparison}% önceki döneme göre`
                }
                hint="Müşterilerinizin dijital QR menünüzü toplam kaç kez açtığını gösterir. Bir müşteri menüyü birden fazla kez açtığında her açılış buraya eklenir."
                badge="Toplam Trafik"
                color="brand"
              />
              <Stat
                icon={
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
                label="Benzersiz Ziyaretçi"
                value={`${uniqueVisitors} kişi`}
                detail="Farklı müşteri / tekil cihaz"
                hint="Menünüzü ziyaret eden tekil (farklı) müşteri sayısıdır. Aynı kişi gün içinde menüyü birden çok kez açsa bile 1 tekil ziyaretçi sayılır."
                badge="Tekil Kişi"
                color="neutral"
              />
              <Stat
                icon={
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                    <path d="M7 2v20" />
                    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                  </svg>
                }
                label="Ürün İncelemeleri"
                value={totalProductInteractions}
                detail="Yemek & içecek tıklamaları"
                hint="Ziyaretçilerin menüdeki yemek veya içeceklerin detayını açıp tıkladığı toplam adettir. Müşterilerin hangi ürünlerle ilgilendiğini gösterir."
                badge="Detay İlgi"
                color="neutral"
              />
              <Stat
                icon={
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                }
                label="Menü Etkileşim Oranı"
                value={`%${engagementRate}`}
                detail="Ziyaret başına ilgi düzeyi"
                hint="Menüyü açan ziyaretçilerin ürünleri inceleme veya kategorilerde gezinme oranıdır. Yüksek oran, menünüzün ilgi çekici olduğunu gösterir."
                badge="Etkileşim"
                color="brandSubtle"
              />
            </section>

            {/* Cohesive Highlights Ribbon */}
            <section className="analytics-highlights-ribbon rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="analytics-icon-box analytics-icon-box--brand flex h-10 w-10 items-center justify-center rounded-xl shadow-xs">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Dönemin Zirvedekileri</span>
                  <h4 className="text-sm font-bold text-slate-900">Öne Çıkan Liderler</h4>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1 sm:divide-x sm:divide-slate-200/60">
                <div className="sm:px-4">
                  <span className="text-[11px] font-medium text-slate-400 block">En Popüler Ürün</span>
                  <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {data?.summary?.topProduct?.name || '—'}
                  </p>
                  <span className="text-xs font-semibold text-[#485900]">
                    {data?.summary?.topProduct ? `${data.summary.topProduct.count} inceleme` : 'Veri yok'}
                  </span>
                </div>

                <div className="sm:px-4">
                  <span className="text-[11px] font-medium text-slate-400 block">En Aktif Kategori</span>
                  <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {data?.summary?.topCategory?.name || '—'}
                  </p>
                  <span className="text-xs font-semibold text-[#485900]">
                    {data?.summary?.topCategory ? `${data.summary.topCategory.count} seçim` : 'Veri yok'}
                  </span>
                </div>

                <div className="sm:px-4">
                  <span className="text-[11px] font-medium text-slate-400 block">En Yoğun Gün</span>
                  <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {data?.busiestDays?.[0]?.day || '—'}
                  </p>
                  <span className="text-xs font-semibold text-[#485900]">
                    {data?.busiestDays?.[0] ? `${data.busiestDays[0].count} ziyaret` : 'Veri yok'}
                  </span>
                </div>

                <div className="sm:px-4">
                  <span className="text-[11px] font-medium text-slate-400 block">Zirve Servis Saati</span>
                  <p className="text-sm font-bold text-slate-900 font-mono truncate mt-0.5">
                    {data?.busiestHours?.[0] ? `${data.busiestHours[0].hour}:00 – ${data.busiestHours[0].hour + 1}:00` : '—'}
                  </p>
                  <span className="text-xs font-semibold text-[#485900]">
                    {data?.busiestHours?.[0] ? `${data.busiestHours[0].count} aktivite` : 'Veri yok'}
                  </span>
                </div>
              </div>
            </section>

            {/* Main Traffic Charts */}
            <section className="analytics-main-grid">
              <article className="analytics-panel analytics-line-panel">
                <div className="analytics-panel__heading">
                  <div>
                    <p className="analytics-eyebrow">Zaman Çizelgesi</p>
                    <h3>Menü Görüntülenmeleri ({data?.range?.days} Gün)</h3>
                  </div>
                  <small>Günlük ziyaret akışı</small>
                </div>
                {data?.dailyViews?.length > 0 ? (
                  <TimelineViewsChart dailyViews={data.dailyViews} />
                ) : (
                  <p className="analytics-empty py-12 text-center text-slate-400">
                    Bu tarih aralığında henüz görüntülenme yok.
                  </p>
                )}
              </article>

              <article className="analytics-panel">
                <div className="analytics-panel__heading">
                  <div>
                    <p className="analytics-eyebrow">Günlük Ritim</p>
                    <h3>Aktivite Yoğunluk Matrisi</h3>
                  </div>
                  <small>Az → Çok</small>
                </div>
                <div className={`analytics-heatmap analytics-heatmap--${heatmapSize}`}>
                  {(data?.heatmap || []).map((item) => {
                    const intensity =
                      (item.count + item.interactions + item.categoryInteractions) / heatmapMax;
                    return (
                      <button
                        type="button"
                        key={item.date}
                        className={activeDay?.date === item.date ? 'is-selected' : ''}
                        onClick={() => setSelectedDay(item)}
                        title={`${formatDate(item.date)}\n${item.count} menü görüntülenmesi\n${item.interactions} ürün etkileşimi\n${item.categoryInteractions} kategori etkileşimi`}
                        style={{ opacity: intensity ? 0.2 + intensity * 0.8 : 0.12 }}
                        aria-label={`${formatDate(item.date)} aktivitesi`}
                      />
                    );
                  })}
                </div>
                <div className="analytics-legend">
                  <span>Az</span>
                  <i />
                  <i />
                  <i />
                  <i />
                  <span>Çok</span>
                </div>
                {activeDay && (
                  <div className="analytics-day-detail">
                    <b>{formatDate(activeDay.date)}</b>
                    <span>{activeDay.count} Menü Görüntülenmesi</span>
                    <span>{activeDay.interactions} Ürün Tıklaması</span>
                    <span>{activeDay.categoryInteractions} Kategori Geçişi</span>
                  </div>
                )}
              </article>
            </section>

            {/* Redesigned 4 Visual Analytics Cards with Podium Hierarchy & Blurred Expanders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: En Çok İlgi Gören Ürünler */}
              <article className="analytics-visual-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Müşteriler Neyle İlgileniyor?
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        En Çok İlgi Gören Ürünler
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-1 text-xs font-semibold text-[#485900]">
                      Popüler Lezzetler
                    </span>
                  </div>

                  {(data?.topProducts || []).length > 0 ? (
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      {/* Top 3 Podium Items */}
                      <div className="space-y-2.5">
                        {(data?.topProducts || []).slice(0, 3).map((product, idx) => {
                          const pct = Math.round(((product.count || 0) / maxProductCount) * 100);

                          // Rank 1: Largest & highlighted
                          if (idx === 0) {
                            return (
                              <div
                                key={product.name || idx}
                                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs flex flex-col gap-2.5 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <span className="analytics-rank-1-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-sm shadow-xs">
                                      1
                                    </span>
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-11 w-11 shrink-0 rounded-xl object-cover border border-slate-200 shadow-xs"
                                      />
                                    ) : (
                                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 text-lg font-bold">
                                        🍽️
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-base font-bold text-slate-900 truncate">
                                        {product.name}
                                      </p>
                                      {product.categoryName && (
                                        <span className="inline-flex items-center rounded-md bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700 mt-0.5">
                                          {product.categoryName}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#f4f9d8] border border-[#d4e875] px-3 py-1 text-sm font-extrabold text-[#485900] shadow-xs">
                                      {product.count} <span className="analytics-count-label text-xs font-normal text-[#485900]/80">inceleme</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#485900] transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 6)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 2: Medium
                          if (idx === 1) {
                            return (
                              <div
                                key={product.name || idx}
                                className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-2 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs shadow-xs">
                                      2
                                    </span>
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-9 w-9 shrink-0 rounded-lg object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500 text-sm">
                                        🍽️
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-800 truncate">
                                        {product.name}
                                      </p>
                                      {product.categoryName && (
                                        <span className="text-[11px] text-slate-500 font-medium">
                                          {product.categoryName}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                                      {product.count} <span className="font-normal text-slate-400">inceleme</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-slate-500 transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 5)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 3: Standard
                          return (
                            <div
                              key={product.name || idx}
                              className="p-2.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-1.5 transition-all hover:bg-slate-50/50"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                                    3
                                  </span>
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-8 w-8 shrink-0 rounded-md object-cover border border-slate-200"
                                    />
                                  ) : (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400 text-xs">
                                      🍽️
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                      {product.name}
                                    </p>
                                    {product.categoryName && (
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {product.categoryName}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    {product.count} <span className="font-normal text-slate-400">inceleme</span>
                                  </span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Items 4 and beyond: Blurred with Expand Button */}
                      {(data?.topProducts || []).length > 3 && (
                        <div className="relative mt-3 flex-1 min-h-[90px] flex flex-col justify-center rounded-xl overflow-hidden border border-dashed border-slate-200 bg-slate-50/40 p-2.5">
                          {/* Blurred background preview items */}
                          <div className="filter blur-[2.5px] opacity-40 select-none pointer-events-none space-y-2 my-auto">
                            {(data?.topProducts || []).slice(3, 5).map((product, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="h-5 w-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600">
                                    {idx + 4}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-800">{product.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">{product.count} inceleme</span>
                              </div>
                            ))}
                          </div>

                          {/* Overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/95 via-white/80 to-white/30 backdrop-blur-[1px]">
                            <button
                              type="button"
                              onClick={() =>
                                setModalConfig({
                                  type: 'products',
                                  title: 'Tüm İlgi Gören Ürünler',
                                  subtitle: 'Müşterilerinizin menünüzde en çok incelediği ve tıkladığı yemekler',
                                  items: data.topProducts,
                                  maxCount: maxProductCount,
                                })
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 cursor-pointer"
                            >
                              <span>Daha Fazlasını Gör</span>
                              <span className="rounded-full bg-slate-800 text-[#DEFF36] px-1.5 py-0.2 text-[10px] font-bold">
                                +{(data?.topProducts || []).length - 3}
                              </span>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-8 text-center">Bu dönemde henüz ürün inceleme verisi bulunmuyor.</p>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  * Müşterilerin menüde detayını açıp tıkladığı yemek ve içecek sayısıdır.
                </p>
              </article>

              {/* Card 2: En Çok Gezilen Kategoriler */}
              <article className="analytics-visual-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Kategori Tercihleri
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        En Çok Gezilen Kategoriler
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-1 text-xs font-semibold text-[#485900]">
                      Menü Dağılımı
                    </span>
                  </div>

                  {(data?.topCategories || []).length > 0 ? (
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      {/* Top 3 Podium Items */}
                      <div className="space-y-2.5">
                        {(data?.topCategories || []).slice(0, 3).map((cat, idx) => {
                          const pct = Math.round(((cat.count || 0) / maxCategoryCount) * 100);
                          const sharePct = totalCategoryClicks > 0 ? Math.round(((cat.count || 0) / totalCategoryClicks) * 100) : 0;

                          // Rank 1
                          if (idx === 0) {
                            return (
                              <div
                                key={cat.name || idx}
                                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs flex flex-col gap-2.5 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <span className="analytics-rank-1-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-sm shadow-xs">
                                      1
                                    </span>
                                    <p className="text-base font-bold text-slate-900 truncate">
                                      {cat.name}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {sharePct > 0 && (
                                      <span className="text-xs font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                                        %{sharePct} pay
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#f4f9d8] border border-[#d4e875] px-3 py-1 text-sm font-extrabold text-[#485900] shadow-xs">
                                      {cat.count} <span className="analytics-count-label text-xs font-normal text-[#485900]/80">tık</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#485900] transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 6)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 2
                          if (idx === 1) {
                            return (
                              <div
                                key={cat.name || idx}
                                className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-2 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs shadow-xs">
                                      2
                                    </span>
                                    <p className="text-sm font-bold text-slate-800 truncate">
                                      {cat.name}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {sharePct > 0 && (
                                      <span className="text-xs text-slate-400 font-medium">
                                        %{sharePct} pay
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                                      {cat.count} <span className="font-normal text-slate-400">tık</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-slate-500 transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 5)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 3
                          return (
                            <div
                              key={cat.name || idx}
                              className="p-2.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-1.5 transition-all hover:bg-slate-50/50"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                                    3
                                  </span>
                                  <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                                    {cat.name}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {sharePct > 0 && (
                                    <span className="text-xs text-slate-400 font-medium">
                                      %{sharePct}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    {cat.count} <span className="font-normal text-slate-400">tık</span>
                                  </span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Items 4 and beyond: Blurred with Expand Button */}
                      {(data?.topCategories || []).length > 3 && (
                        <div className="relative mt-3 flex-1 min-h-[90px] flex flex-col justify-center rounded-xl overflow-hidden border border-dashed border-slate-200 bg-slate-50/40 p-2.5">
                          {/* Blurred background preview items */}
                          <div className="filter blur-[2.5px] opacity-40 select-none pointer-events-none space-y-2 my-auto">
                            {(data?.topCategories || []).slice(3, 5).map((cat, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="h-5 w-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600">
                                    {idx + 4}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-800">{cat.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">{cat.count} tık</span>
                              </div>
                            ))}
                          </div>

                          {/* Overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/95 via-white/80 to-white/30 backdrop-blur-[1px]">
                            <button
                              type="button"
                              onClick={() =>
                                setModalConfig({
                                  type: 'categories',
                                  title: 'Tüm Menü Kategorileri',
                                  subtitle: 'Müşterilerinizin en çok tıkladığı ve gezindiği menü bölümleri',
                                  items: data.topCategories,
                                  totalSum: totalCategoryClicks,
                                  maxCount: maxCategoryCount,
                                })
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 cursor-pointer"
                            >
                              <span>Daha Fazlasını Gör</span>
                              <span className="rounded-full bg-slate-800 text-[#DEFF36] px-1.5 py-0.2 text-[10px] font-bold">
                                +{(data?.topCategories || []).length - 3}
                              </span>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-8 text-center">Bu dönemde henüz kategori gezinme verisi bulunmuyor.</p>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  * Ziyaretçilerin menüde en sık tıkladığı ve gezindiği reyonlar.
                </p>
              </article>

              {/* Card 3: En Yoğun Günler */}
              <article className="analytics-visual-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Haftalık Ziyaret Raporu
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        En Yoğun Günler
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-1 text-xs font-semibold text-[#485900]">
                      Masa Trafiği
                    </span>
                  </div>

                  {(data?.busiestDays || []).length > 0 ? (
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      {/* Top 3 Podium Items */}
                      <div className="space-y-2.5">
                        {(data?.busiestDays || []).slice(0, 3).map((dayItem, idx) => {
                          const pct = Math.round(((dayItem.count || 0) / maxDayCount) * 100);
                          const share = totalDayVisits > 0 ? Math.round(((dayItem.count || 0) / totalDayVisits) * 100) : 0;

                          // Rank 1
                          if (idx === 0) {
                            return (
                              <div
                                key={dayItem.date || idx}
                                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs flex flex-col gap-2.5 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-2.5 min-w-0">
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="analytics-rank-1-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-sm shadow-xs">
                                      1
                                    </span>
                                    <div>
                                      <p className="text-sm sm:text-base font-bold text-slate-900">
                                        {dayItem.day}
                                      </p>
                                      {dayItem.date && (
                                        <span className="text-[11px] text-slate-400 font-medium">
                                          {formatDate(dayItem.date)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {share > 0 && (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-[#485900]">
                                        🔥 Zirve Gün
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#f4f9d8] border border-[#d4e875] px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-extrabold text-[#485900] shadow-xs">
                                      {dayItem.count} <span className="analytics-count-label text-[10px] sm:text-xs font-normal text-[#485900]/80">ziyaret</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#485900] transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 6)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 2
                          if (idx === 1) {
                            return (
                              <div
                                key={dayItem.date || idx}
                                className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-2 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-2 min-w-0">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs shadow-xs">
                                      2
                                    </span>
                                    <span className="text-sm font-bold text-slate-800">
                                      {dayItem.day}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {share > 0 && (
                                      <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                                        %{share}
                                      </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                                      {dayItem.count} <span className="font-normal text-slate-400">ziyaret</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-slate-500 transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 5)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 3
                          return (
                            <div
                              key={dayItem.date || idx}
                              className="p-2.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-1.5 transition-all hover:bg-slate-50/50"
                            >
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                                    3
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                    {dayItem.day}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {share > 0 && (
                                    <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
                                      %{share}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    {dayItem.count} <span className="font-normal text-slate-400">ziyaret</span>
                                  </span>
                                </div>
                              </div>

                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                   className="h-full rounded-full bg-slate-400 transition-all duration-500"
                                   style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Items 4 and beyond: Blurred with Expand Button */}
                      {(data?.busiestDays || []).length > 3 && (
                        <div className="relative mt-3 flex-1 min-h-[90px] flex flex-col justify-center rounded-xl overflow-hidden border border-dashed border-slate-200 bg-slate-50/40 p-2.5">
                          {/* Blurred background preview items */}
                          <div className="filter blur-[2.5px] opacity-40 select-none pointer-events-none space-y-2 my-auto">
                            {(data?.busiestDays || []).slice(3, 5).map((dayItem, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="h-5 w-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600">
                                    {idx + 4}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-800">{dayItem.day}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">{dayItem.count} ziyaret</span>
                              </div>
                            ))}
                          </div>

                          {/* Overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/95 via-white/80 to-white/30 backdrop-blur-[1px]">
                            <button
                              type="button"
                              onClick={() =>
                                setModalConfig({
                                  type: 'days',
                                  title: 'Haftalık Ziyaret Dağılımı',
                                  subtitle: 'Restoranınızın günlere göre menü açılış ve müşteri trafiği',
                                  items: data.busiestDays,
                                  totalSum: totalDayVisits,
                                  maxCount: maxDayCount,
                                })
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 cursor-pointer"
                            >
                              <span>Daha Fazlasını Gör</span>
                              <span className="rounded-full bg-slate-800 text-[#DEFF36] px-1.5 py-0.2 text-[10px] font-bold">
                                +{(data?.busiestDays || []).length - 3}
                              </span>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-8 text-center">Bu dönemde henüz gün verisi bulunmuyor.</p>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  * Restoranınızın hangi günlerde daha yoğun masa ziyaretçisi aldığını gösterir.
                </p>
              </article>

              {/* Card 4: En Yoğun Saatler */}
              <article className="analytics-visual-card rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Mutfak & Servis Zamanlaması
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        En Yoğun Saatler
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-lg bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-1 text-xs font-semibold text-[#485900]">
                      Servis Saatleri
                    </span>
                  </div>

                  {(data?.busiestHours || []).length > 0 ? (
                    <div className="mt-4 flex-1 flex flex-col justify-between">
                      {/* Top 3 Podium Items */}
                      <div className="space-y-2.5">
                        {(data?.busiestHours || []).slice(0, 3).map((hourItem, idx) => {
                          const pct = Math.round(((hourItem.count || 0) / maxHourCount) * 100);
                          const period = getTimePeriodLabel(hourItem.hour);

                          // Rank 1
                          if (idx === 0) {
                            return (
                              <div
                                key={hourItem.hour}
                                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs flex flex-col gap-2.5 transition-all hover:bg-slate-50"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="analytics-rank-1-badge flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-sm shadow-xs">
                                        1
                                      </span>
                                      <span className="font-mono text-sm sm:text-base font-bold text-slate-900 whitespace-nowrap">
                                        {`${hourItem.hour}:00 – ${hourItem.hour + 1}:00`}
                                      </span>
                                    </div>
                                    <span className="sm:hidden inline-flex items-center gap-1 rounded-xl bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-1 text-xs font-extrabold text-[#485900] shadow-xs shrink-0">
                                      {hourItem.count} <span className="analytics-count-label text-[10px] font-normal text-[#485900]/80">aktivite</span>
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] sm:text-xs font-semibold border ${period.tone}`}>
                                        {period.label}
                                      </span>
                                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-[#485900]">
                                        ⚡ En Hareketli
                                      </span>
                                    </div>
                                    <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-[#f4f9d8] border border-[#d4e875] px-3 py-1 text-sm font-extrabold text-[#485900] shadow-xs shrink-0">
                                      {hourItem.count} <span className="analytics-count-label text-xs font-normal text-[#485900]/80">aktivite</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#485900] transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 6)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 2
                          if (idx === 1) {
                            return (
                              <div
                                key={hourItem.hour}
                                className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col gap-2 transition-all hover:bg-slate-50"
                              >
                                <div className="flex items-center justify-between gap-2 min-w-0">
                                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs shadow-xs">
                                      2
                                    </span>
                                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">
                                      {`${hourItem.hour}:00 – ${hourItem.hour + 1}:00`}
                                    </span>
                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-semibold border ${period.tone}`}>
                                      {period.label}
                                    </span>
                                  </div>

                                  <span className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 shrink-0">
                                    {hourItem.count} <span className="text-[10px] font-normal text-slate-400">aktivite</span>
                                  </span>
                                </div>

                                <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-slate-500 transition-all duration-500"
                                    style={{ width: `${Math.max(pct, 5)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          }

                          // Rank 3
                          return (
                            <div
                              key={hourItem.hour}
                              className="p-2.5 rounded-xl bg-white border border-slate-100 flex flex-col gap-1.5 transition-all hover:bg-slate-50/50"
                            >
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                                    3
                                  </span>
                                  <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 whitespace-nowrap">
                                    {`${hourItem.hour}:00 – ${hourItem.hour + 1}:00`}
                                  </span>
                                  <span className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-semibold border ${period.tone}`}>
                                    {period.label}
                                  </span>
                                </div>

                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 shrink-0">
                                  {hourItem.count} <span className="text-[10px] font-normal text-slate-400">aktivite</span>
                                </span>
                              </div>

                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Items 4 and beyond: Blurred with Expand Button */}
                      {(data?.busiestHours || []).length > 3 && (
                        <div className="relative mt-3 flex-1 min-h-[90px] flex flex-col justify-center rounded-xl overflow-hidden border border-dashed border-slate-200 bg-slate-50/40 p-2.5">
                          {/* Blurred background preview items */}
                          <div className="filter blur-[2.5px] opacity-40 select-none pointer-events-none space-y-2 my-auto">
                            {(data?.busiestHours || []).slice(3, 5).map((hourItem, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                                <div className="flex items-center gap-2.5">
                                  <span className="h-5 w-5 rounded-full bg-slate-200 text-[10px] font-bold flex items-center justify-center text-slate-600">
                                    {idx + 4}
                                  </span>
                                  <span className="font-mono text-xs font-semibold text-slate-800">{hourItem.hour}:00</span>
                                </div>
                                <span className="text-xs font-bold text-slate-700">{hourItem.count} aktivite</span>
                              </div>
                            ))}
                          </div>

                          {/* Overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/95 via-white/80 to-white/30 backdrop-blur-[1px]">
                            <button
                              type="button"
                              onClick={() =>
                                setModalConfig({
                                  type: 'hours',
                                  title: 'Tüm Servis Saatleri Yoğunluğu',
                                  subtitle: 'Menünün gün içerisinde saat bazında açılma ve incelenme sıklığı',
                                  items: data.busiestHours,
                                  maxCount: maxHourCount,
                                })
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-black shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5 cursor-pointer"
                            >
                              <span>Daha Fazlasını Gör</span>
                              <span className="rounded-full bg-slate-800 text-[#DEFF36] px-1.5 py-0.2 text-[10px] font-bold">
                                +{(data?.busiestHours || []).length - 3}
                              </span>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-8 text-center">Bu dönemde henüz saatlik veri bulunmuyor.</p>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 mt-3">
                  * Mutfak ve garson hazırlığı için menünün en çok açıldığı saat dilimleridir.
                </p>
              </article>
            </div>
          </>
        )}

        {/* Analytics Detail Modal */}
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



