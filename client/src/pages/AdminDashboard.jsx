import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/adminService';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { PageHeader, Card, Stat, Button, EmptyState, Notice, Icon } from '../components/dashboard/ui';
import SystemLimitsTab from '../components/admin/SystemLimitsTab';
import AdminSettingsTab from '../components/admin/AdminSettingsTab';
import { getPublicMenuAbsoluteUrl } from '../utils/domainHelpers';

const getMenuIdentity = (restaurant) => restaurant?.ownerId?.username || restaurant?.slug || '';

const getRestaurantMenuUrl = (restaurant) => {
  const identity = getMenuIdentity(restaurant);
  return identity ? getPublicMenuAbsoluteUrl(identity) : null;
};

const getRestaurantMenuDisplay = (restaurant) => {
  const identity = getMenuIdentity(restaurant);
  return identity ? `zuuqrmenu.com/${identity}/menu` : '—';
};

const statusLabels = {
  PENDING: 'Onay Bekliyor',
  ACTIVE: 'Aktif',
  SUSPENDED: 'Askıya Alındı',
  REJECTED: 'Reddedildi',
};

const businessTypeLabels = {
  RESTAURANT: 'Restoran',
  CAFE: 'Kafe',
  BAR: 'Bar',
  BAKERY: 'Fırın & Pastane',
  FAST_FOOD: 'Fast Food',
};

/* ─── Vector Icon for Business Types (No Emojis) ──────────── */
const BusinessTypeIcon = ({ type, className = 'w-3.5 h-3.5' }) => {
  switch (type) {
    case 'RESTAURANT':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M18 2v20" />
          <path d="M21 2v6a3 3 0 0 1-6 0V2" />
          <path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2" />
          <path d="M6 11v11" />
        </svg>
      );
    case 'CAFE':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      );
    case 'BAR':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 22h8" />
          <path d="M12 15v7" />
          <path d="m19 3-7 8-7-8Z" />
        </svg>
      );
    case 'BAKERY':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="m2 14 3-5 5 1 4-4 4 4 4-2" />
          <path d="M6 17h12a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a4 4 0 0 0 4 4Z" />
        </svg>
      );
    case 'FAST_FOOD':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4 11h16" />
          <path d="M4 15h16" />
          <path d="M6 19h12a2 2 0 0 0 2-2v-2H4v2a2 2 0 0 0 2 2Z" />
          <path d="M5 11V9a7 7 0 0 1 14 0v2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
        </svg>
      );
  }
};

const PencilIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

/* ─── Business Type Badge ──────────────────────────────────── */
const BusinessTypeBadge = ({ type }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
    <BusinessTypeIcon type={type} className="h-3 w-3 text-slate-500 shrink-0" />
    <span>{businessTypeLabels[type] || type}</span>
  </span>
);

const statusClasses = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SUSPENDED: 'bg-rose-50 text-rose-800 border-rose-200',
  REJECTED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const menuStatusLabels = {
  PUBLISHED: 'Yayında',
  DRAFT: 'Taslak',
  HIDDEN: 'Gizli',
};

const menuStatusClasses = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  HIDDEN: 'bg-amber-50 text-amber-700 border-amber-200',
};

const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
};

const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Az önce';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} dk önce`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} saat önce`;
  if (diffSec < 172800) return 'Dün';
  return formatDate(date);
};

/* ─── Status Badge ─────────────────────────────────────────── */
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClasses[status] || statusClasses.REJECTED}`}>
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        status === 'ACTIVE'
          ? 'bg-emerald-500'
          : status === 'PENDING'
          ? 'bg-amber-500'
          : status === 'SUSPENDED'
          ? 'bg-rose-500'
          : 'bg-slate-400'
      }`}
    />
    {statusLabels[status] || status}
  </span>
);

/* ─── Three Dots Action Menu ───────────────────────────────── */
const RowActionMenu = ({
  restaurant,
  onViewDetails,
  onEdit,
  onSuspendToggle,
  onDelete,
  onApprove,
  onReject,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  const isPending = restaurant.status === 'PENDING';
  const isSuspended = restaurant.status === 'SUSPENDED';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none"
        title="İşlemler"
        aria-label="İşlemler"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl animate-fadeIn">
          {/* 1. Detayları Gör */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onViewDetails(restaurant);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 text-left transition-colors"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Detayları Gör</span>
          </button>

          {/* 2. Düzenle */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit(restaurant);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>Düzenle</span>
          </button>

          {/* 3. Menüyü Görüntüle */}
          {getRestaurantMenuUrl(restaurant) && (
            <a
              href={getRestaurantMenuUrl(restaurant)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 text-left transition-colors"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>Menüyü Görüntüle</span>
            </a>
          )}

          {/* 4. Pending Approval Options */}
          {isPending && (
            <>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onApprove(restaurant);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 text-left transition-colors"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Başvuruyu Onayla</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onReject(restaurant);
                }}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                <span>Başvuruyu Reddet</span>
              </button>
            </>
          )}

          {/* 5. Askıya Al / Aktifleştir */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSuspendToggle(restaurant);
            }}
            className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
              isSuspended ? 'text-emerald-700 hover:bg-emerald-50' : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            {isSuspended ? (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Aktifleştir</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="4" height="16" x="6" y="4" />
                  <rect width="4" height="16" x="14" y="4" />
                </svg>
                <span>Askıya Al</span>
              </>
            )}
          </button>

          <div className="my-1 border-t border-slate-100" />

          {/* 6. Sil */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(restaurant);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 text-left transition-colors"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Restoranı Sil</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Restaurant Detail Modal ──────────────────────────────── */
const RestaurantDetailModal = ({
  restaurant,
  onClose,
  onEdit,
  onSuspendToggle,
  onRestaurantUpdated,
}) => {
  // ZuuAI state for this restaurant
  const [zuuaiEnabled, setZuuaiEnabled] = useState(restaurant?.zuuai?.enabled !== false);
  const [customDailyLimit, setCustomDailyLimit] = useState(
    restaurant?.zuuai?.customDailyLimit !== null && restaurant?.zuuai?.customDailyLimit !== undefined
      ? String(restaurant.zuuai.customDailyLimit)
      : ''
  );
  const [customMonthlyLimit, setCustomMonthlyLimit] = useState(
    restaurant?.zuuai?.customMonthlyLimit !== null && restaurant?.zuuai?.customMonthlyLimit !== undefined
      ? String(restaurant.zuuai.customMonthlyLimit)
      : ''
  );
  const [zuuaiUsage, setZuuaiUsage] = useState({ todayUsed: 0, thisMonthUsed: 0 });
  const [globalDefaults, setGlobalDefaults] = useState({ dailyLimit: 20, monthlyLimit: 300 });
  const [savingZuuai, setSavingZuuai] = useState(false);
  const [zuuaiMsg, setZuuaiMsg] = useState({ type: '', text: '' });

  // Load fresh ZuuAI stats & defaults on mount/change
  useEffect(() => {
    if (!restaurant?._id) return;
    let isMounted = true;
    adminService.getRestaurant(restaurant._id)
      .then((res) => {
        if (!isMounted) return;
        if (res?.zuuaiStats) setZuuaiUsage(res.zuuaiStats);
        if (res?.globalDefaults) setGlobalDefaults(res.globalDefaults);
        if (res?.restaurant?.zuuai) {
          setZuuaiEnabled(res.restaurant.zuuai.enabled !== false);
          setCustomDailyLimit(
            res.restaurant.zuuai.customDailyLimit !== null && res.restaurant.zuuai.customDailyLimit !== undefined
              ? String(res.restaurant.zuuai.customDailyLimit)
              : ''
          );
          setCustomMonthlyLimit(
            res.restaurant.zuuai.customMonthlyLimit !== null && res.restaurant.zuuai.customMonthlyLimit !== undefined
              ? String(res.restaurant.zuuai.customMonthlyLimit)
              : ''
          );
        }
      })
      .catch((err) => console.warn('Failed to load restaurant ZuuAI stats:', err));

    return () => {
      isMounted = false;
    };
  }, [restaurant?._id]);

  if (!restaurant) return null;

  const isSuspended = restaurant.status === 'SUSPENDED';

  const handleSaveZuuai = async () => {
    setSavingZuuai(true);
    setZuuaiMsg({ type: '', text: '' });
    try {
      const dailyVal = customDailyLimit.trim() === '' ? null : Number(customDailyLimit);
      const monthlyVal = customMonthlyLimit.trim() === '' ? null : Number(customMonthlyLimit);

      if (dailyVal !== null && (isNaN(dailyVal) || dailyVal < 0)) {
        setZuuaiMsg({ type: 'error', text: 'Günlük limit 0 veya pozitif bir tam sayı olmalıdır.' });
        setSavingZuuai(false);
        return;
      }
      if (monthlyVal !== null && (isNaN(monthlyVal) || monthlyVal < 0)) {
        setZuuaiMsg({ type: 'error', text: 'Aylık limit 0 veya pozitif bir tam sayı olmalıdır.' });
        setSavingZuuai(false);
        return;
      }

      const res = await adminService.updateRestaurant(restaurant._id, {
        zuuai: {
          enabled: zuuaiEnabled,
          customDailyLimit: dailyVal,
          customMonthlyLimit: monthlyVal,
        },
      });

      if (res?.restaurant) {
        setZuuaiMsg({ type: 'success', text: 'ZuuAI ayarları kaydedildi.' });
        if (res.zuuaiStats) setZuuaiUsage(res.zuuaiStats);
        if (onRestaurantUpdated) {
          onRestaurantUpdated(res.restaurant);
        }
        setTimeout(() => setZuuaiMsg({ type: '', text: '' }), 3500);
      }
    } catch (err) {
      setZuuaiMsg({ type: 'error', text: err?.response?.data?.error || 'ZuuAI ayarları kaydedilemedi.' });
      setTimeout(() => setZuuaiMsg({ type: '', text: '' }), 4500);
    } finally {
      setSavingZuuai(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with identity */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-[#DEFF36] shadow-sm">
              {(restaurant.name || 'R').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">{restaurant.name}</h3>
                <BusinessTypeBadge type={restaurant.businessType} />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                {getMenuIdentity(restaurant) && (
                  <a
                    href={getRestaurantMenuUrl(restaurant)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                    title="Canlı Menüyü Aç"
                  >
                    <span>{getRestaurantMenuDisplay(restaurant)}</span>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {/* Status badges bar */}
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Hesap Durumu:</span>
            <StatusBadge status={restaurant.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Menü:</span>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${menuStatusClasses[restaurant.menuStatus] || menuStatusClasses.DRAFT}`}>
              {menuStatusLabels[restaurant.menuStatus] || 'Taslak'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Görüntülenme:</span>
            <span className="text-xs font-extrabold text-emerald-700">
              {(restaurant.menuViewCount || 0).toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Content sections */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Section 1: İşletme & İletişim Bilgileri */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <BusinessTypeIcon type={restaurant.businessType} className="h-4 w-4 text-slate-600" />
              <span>İşletme Bilgileri</span>
            </h4>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">İşletme Adı</dt>
                <dd className="font-semibold text-slate-900">{restaurant.name}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">İşletme Türü</dt>
                <dd className="font-semibold text-slate-800">
                  {businessTypeLabels[restaurant.businessType] || restaurant.businessType}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Şehir</dt>
                <dd className="font-semibold text-slate-800">{restaurant.city || 'Belirtilmedi'}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Telefon</dt>
                <dd className="font-semibold text-slate-800 font-mono">
                  {restaurant.phone ? (
                    <a href={`tel:${restaurant.phone}`} className="text-emerald-700 hover:underline">
                      {restaurant.phone}
                    </a>
                  ) : (
                    'Belirtilmedi'
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Canlı Menü Adresi</dt>
                <dd className="font-semibold font-mono text-emerald-700">
                  <a href={getRestaurantMenuUrl(restaurant)} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                    <span>/{getMenuIdentity(restaurant)}/menu</span>
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Kullanıcı Adı (Menü ID)</dt>
                <dd className="font-semibold font-mono text-slate-800">
                  {restaurant.ownerId?.username ? (
                    <span className="text-emerald-700 font-bold">@{restaurant.ownerId.username}</span>
                  ) : (
                    <span className="text-slate-400 font-normal">Henüz seçilmedi</span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Kayıt Slug'ı</dt>
                <dd className="font-semibold font-mono text-slate-500">/{restaurant.slug || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Section 2: Yetkili Hesap & Giriş */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Yetkili & Giriş Hesabı</span>
            </h4>
            <dl className="divide-y divide-slate-100 text-xs">
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Yetkili Adı</dt>
                <dd className="font-semibold text-slate-900">{restaurant.ownerId?.name || '—'}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Giriş E-postası</dt>
                <dd className="font-semibold text-slate-800">
                  {restaurant.ownerId?.email ? (
                    <a href={`mailto:${restaurant.ownerId.email}`} className="text-emerald-700 hover:underline">
                      {restaurant.ownerId.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Kullanıcı Rolü</dt>
                <dd className="font-semibold text-slate-800">{restaurant.ownerId?.role || 'RESTAURANT'}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Kayıt Tarihi</dt>
                <dd className="font-semibold text-slate-800">{formatDateTime(restaurant.createdAt)}</dd>
              </div>
              <div className="flex justify-between py-2">
                <dt className="text-slate-500">Son Güncelleme</dt>
                <dd className="font-semibold text-slate-800">{formatDateTime(restaurant.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          {/* Section 3: ZuuAI Yönetimi & Özel Limitler */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">ZuuAI</h4>
                  <p className="text-[11px] text-slate-400">Bu işletmeye özel yapay zeka asistanı erişimi ve limit kontrolü</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {customDailyLimit === '' && customMonthlyLimit === '' ? (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    Varsayılan limitler kullanılıyor
                  </span>
                ) : (
                  <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-600">
                    Özel Limit Devrede
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Access State Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">Durum</label>
                <button
                  type="button"
                  onClick={() => setZuuaiEnabled(!zuuaiEnabled)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                    zuuaiEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${zuuaiEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{zuuaiEnabled ? 'Açık' : 'Kapalı'}</span>
                </button>
              </div>

              {/* Custom Daily Limit */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                  Günlük Mesaj Limiti
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder={`Varsayılan (${globalDefaults.dailyLimit})`}
                    value={customDailyLimit}
                    onChange={(e) => setCustomDailyLimit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-slate-900 focus:outline-none"
                  />
                  {customDailyLimit !== '' && (
                    <button
                      type="button"
                      onClick={() => setCustomDailyLimit('')}
                      className="absolute right-2 top-2 text-[10px] font-semibold text-slate-400 hover:text-slate-700"
                      title="Varsayılana sıfırla"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Monthly Limit */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                  Aylık Mesaj Limiti
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder={`Varsayılan (${globalDefaults.monthlyLimit})`}
                    value={customMonthlyLimit}
                    onChange={(e) => setCustomMonthlyLimit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-slate-900 focus:outline-none"
                  />
                  {customMonthlyLimit !== '' && (
                    <button
                      type="button"
                      onClick={() => setCustomMonthlyLimit('')}
                      className="absolute right-2 top-2 text-[10px] font-semibold text-slate-400 hover:text-slate-700"
                      title="Varsayılana sıfırla"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Usage Stats Row & Save Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Bugün kullanılan:</span>
                  <strong className="text-slate-800 font-bold">{zuuaiUsage.todayUsed ?? 0} mesaj</strong>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Bu ay kullanılan:</span>
                  <strong className="text-slate-800 font-bold">{zuuaiUsage.thisMonthUsed ?? 0} mesaj</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {zuuaiMsg.text && (
                  <span className={`text-xs font-semibold ${zuuaiMsg.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {zuuaiMsg.text}
                  </span>
                )}
                <button
                  type="button"
                  disabled={savingZuuai}
                  onClick={handleSaveZuuai}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-[#DEFF36] hover:bg-black transition-colors disabled:opacity-50 shadow-2xs"
                >
                  {savingZuuai ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onSuspendToggle(restaurant)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              isSuspended
                ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                : 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            {isSuspended ? 'Hesabı Aktifleştir' : 'Hesabı Askıya Al'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(restaurant);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <PencilIcon className="h-3.5 w-3.5" />
              Restoranı Düzenle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Restaurant Modal ──────────────────────────────── */
const EditRestaurantModal = ({ restaurant, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    name: restaurant?.name || '',
    businessType: restaurant?.businessType || 'RESTAURANT',
    city: restaurant?.city || '',
    phone: restaurant?.phone || '',
    ownerName: restaurant?.ownerId?.name || '',
    ownerEmail: restaurant?.ownerId?.email || '',
    password: '',
    status: restaurant?.status || 'ACTIVE',
    menuStatus: restaurant?.menuStatus || 'DRAFT',
    zuuaiEnabled: restaurant?.zuuai?.enabled !== false,
    zuuaiDailyLimit: restaurant?.zuuai?.customDailyLimit !== null && restaurant?.zuuai?.customDailyLimit !== undefined
      ? String(restaurant.zuuai.customDailyLimit)
      : '',
    zuuaiMonthlyLimit: restaurant?.zuuai?.customMonthlyLimit !== null && restaurant?.zuuai?.customMonthlyLimit !== undefined
      ? String(restaurant.zuuai.customMonthlyLimit)
      : '',
  });
  const [error, setError] = useState('');

  if (!restaurant) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Restoran adı zorunludur.');
      return;
    }
    if (!form.ownerEmail.trim()) {
      setError('Yetkili e-posta adresi zorunludur.');
      return;
    }
    if (form.password && form.password.trim().length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    const dailyVal = form.zuuaiDailyLimit.trim() === '' ? null : Number(form.zuuaiDailyLimit);
    const monthlyVal = form.zuuaiMonthlyLimit.trim() === '' ? null : Number(form.zuuaiMonthlyLimit);

    if (dailyVal !== null && (isNaN(dailyVal) || dailyVal < 0)) {
      setError('ZuuAI günlük limiti 0 veya pozitif bir tam sayı olmalıdır.');
      return;
    }
    if (monthlyVal !== null && (isNaN(monthlyVal) || monthlyVal < 0)) {
      setError('ZuuAI aylık limiti 0 veya pozitif bir tam sayı olmalıdır.');
      return;
    }

    setError('');
    const payload = {
      name: form.name.trim(),
      businessType: form.businessType,
      city: form.city.trim(),
      phone: form.phone.trim(),
      ownerName: form.ownerName.trim(),
      ownerEmail: form.ownerEmail.trim(),
      status: form.status,
      menuStatus: form.menuStatus,
      zuuai: {
        enabled: form.zuuaiEnabled,
        customDailyLimit: dailyVal,
        customMonthlyLimit: monthlyVal,
      },
    };
    if (form.password && form.password.trim()) {
      payload.password = form.password.trim();
    }
    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">YÖNETİCİ DÜZENLEME</p>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{restaurant.name}</h3>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1 rounded-lg hover:bg-slate-100"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Restoran Adı</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İşletme Türü</label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              >
                <option value="RESTAURANT">Restoran</option>
                <option value="CAFE">Kafe</option>
                <option value="BAR">Bar</option>
                <option value="BAKERY">Fırın & Pastane</option>
                <option value="FAST_FOOD">Fast Food</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şehir</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Örn. İstanbul"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yetkili Ad Soyad</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                placeholder="Yetkili kişi adı"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefon</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05xxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Giriş & Güvenlik Bilgileri</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giriş E-posta Adresi</label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yeni Şifre <span className="font-normal text-slate-400">(Değiştirmek istemiyorsanız boş bırakın)</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Yeni şifre belirleyin..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hesap Durumu</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              >
                <option value="ACTIVE">Aktif (Giriş Açık)</option>
                <option value="PENDING">Onay Bekliyor</option>
                <option value="SUSPENDED">Askıya Alındı (Giriş Kapalı)</option>
                <option value="REJECTED">Reddedildi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Menü Durumu</label>
              <select
                value={form.menuStatus}
                onChange={(e) => setForm({ ...form, menuStatus: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
              >
                <option value="PUBLISHED">Yayında</option>
                <option value="DRAFT">Taslak</option>
                <option value="HIDDEN">Gizli</option>
              </select>
            </div>
          </div>

          {/* ZuuAI Kullanım Hakları ve Limitleri */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ZuuAI Kullanım Hakları</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, zuuaiEnabled: !form.zuuaiEnabled })}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  form.zuuaiEnabled
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {form.zuuaiEnabled ? '● ZuuAI Açık' : '○ ZuuAI Kapalı'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Özel Günlük Mesaj Limiti
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Varsayılan (20)"
                  value={form.zuuaiDailyLimit}
                  onChange={(e) => setForm({ ...form, zuuaiDailyLimit: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Boş bırakılırsa global varsayılan geçerlidir</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Özel Aylık Mesaj Limiti
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Varsayılan (300)"
                  value={form.zuuaiMonthlyLimit}
                  onChange={(e) => setForm({ ...form, zuuaiMonthlyLimit: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Boş bırakılırsa global varsayılan geçerlidir</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-black text-[#DEFF36] px-4 py-2 text-xs font-bold shadow-xs disabled:opacity-50 transition-colors"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Delete Confirmation Modal ────────────────────────────── */
const DeleteRestaurantModal = ({ restaurant, onClose, onConfirm, deleting }) => {
  if (!restaurant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && !deleting && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Restoranı Kalıcı Olarak Sil</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              <strong className="text-slate-900">"{restaurant.name}"</strong> restoranını sistemden tamamen silmek istediğinize emin misiniz?
            </p>
            <p className="mt-2 rounded-xl bg-rose-50 border border-rose-100 p-2.5 text-[11px] text-rose-700 leading-relaxed">
              ⚠️ Bu işlem geri alınamaz. Restorana ait tüm menü kategorileri, ürünler, ayarlar ve yetkili kullanıcı hesabı kalıcı olarak silinecektir.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-xs disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Siliniyor...' : 'Restoranı Tamamen Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Admin Dashboard Component ────────────────────────── */
const AdminDashboard = () => {
  const location = useLocation();
  const isRestaurantsPage = location.pathname === '/admin/restaurants';
  const isServicesPage = location.pathname === '/admin/services' || location.pathname === '/admin/resources';
  const isSettingsPage = location.pathname === '/admin/settings';

  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Modals state
  const [detailRestaurant, setDetailRestaurant] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  // Filters for /admin/restaurants
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const initialStatus = (searchParams.get('status') || 'ALL').toUpperCase();
  const [statusFilter, setStatusFilter] = useState(['ALL', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].includes(initialStatus) ? initialStatus : 'ALL');
  const [businessFilter, setBusinessFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination & Dropdown state (5, 10, 20, 50) with "Listele" button
  const [appliedLimit, setAppliedLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [statsData, restaurantsData] = await Promise.all([
        adminService.getStats(),
        adminService.getRestaurants(),
      ]);
      setStats(statsData.stats);
      setRestaurants(restaurantsData.restaurants || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Panel verileri yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isServicesPage && !isSettingsPage && !stats) {
      loadData();
    }
  }, [location.pathname, isServicesPage, isSettingsPage]);

  useEffect(() => {
    const wanted = (searchParams.get('status') || '').toUpperCase();
    if (['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].includes(wanted)) setStatusFilter(wanted);
  }, [searchParams]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, businessFilter, sortBy, appliedLimit]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Quick Action (Approve / Reject / Suspend / Activate)
  const handleQuickStatus = async (restaurant, action) => {
    setError('');
    try {
      await adminService.updateStatus(restaurant._id, action);
      const actionText =
        action === 'approve'
          ? 'onaylandı'
          : action === 'reject'
          ? 'reddedildi'
          : action === 'suspend'
          ? 'askıya alındı'
          : 'aktifleştirildi';
      setNotice(`"${restaurant.name}" başarıyla ${actionText}.`);

      // If detail modal is open for this restaurant, update its status
      if (detailRestaurant && detailRestaurant._id === restaurant._id) {
        setDetailRestaurant((prev) => ({
          ...prev,
          status:
            action === 'approve'
              ? 'ACTIVE'
              : action === 'reject'
              ? 'REJECTED'
              : action === 'suspend'
              ? 'SUSPENDED'
              : 'ACTIVE',
        }));
      }

      await loadData(true);
    } catch (err) {
      setError(err.response?.data?.error || 'İşlem gerçekleştirilemedi.');
    }
  };

  // Save Edit
  const handleSaveEdit = async (formPayload) => {
    if (!editingRestaurant) return;
    setSavingEdit(true);
    setError('');
    try {
      await adminService.updateRestaurant(editingRestaurant._id, formPayload);
      setNotice(`"${formPayload.name}" bilgileri başarıyla güncellendi.`);
      setEditingRestaurant(null);
      await loadData(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Restoran güncellenemedi.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Restaurant
  const handleConfirmDelete = async () => {
    if (!deletingRestaurant) return;
    setDeletingBusy(true);
    setError('');
    try {
      await adminService.deleteRestaurant(deletingRestaurant._id);
      setNotice(`"${deletingRestaurant.name}" ve bağlı tüm verileri sistemden tamamen silindi.`);
      setDeletingRestaurant(null);
      if (detailRestaurant?._id === deletingRestaurant._id) {
        setDetailRestaurant(null);
      }
      await loadData(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Restoran silinemedi.');
    } finally {
      setDeletingBusy(false);
    }
  };

  // Pending applications
  const pendingRestaurants = useMemo(
    () => restaurants.filter((r) => r.status === 'PENDING'),
    [restaurants]
  );

  // Filtered restaurants for /admin/restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
        if (businessFilter !== 'ALL' && r.businessType !== businessFilter) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLocaleLowerCase('tr');
          const nameMatch = (r.name || '').toLocaleLowerCase('tr').includes(query);
          const emailMatch = (r.ownerId?.email || '').toLocaleLowerCase('tr').includes(query);
          const cityMatch = (r.city || '').toLocaleLowerCase('tr').includes(query);
          const slugMatch = (r.slug || '').toLocaleLowerCase('tr').includes(query);
          const usernameMatch = (r.ownerId?.username || '').toLocaleLowerCase('tr').includes(query);
          if (!nameMatch && !emailMatch && !cityMatch && !slugMatch && !usernameMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '', 'tr');
        if (sortBy === 'views') return (b.menuViewCount || 0) - (a.menuViewCount || 0);
        return 0;
      });
  }, [restaurants, statusFilter, businessFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / appliedLimit));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * appliedLimit;
  const displayedRestaurants = useMemo(
    () => filteredRestaurants.slice(startIndex, startIndex + appliedLimit),
    [filteredRestaurants, startIndex, appliedLimit]
  );

  // Derived metrics
  const activeCount = stats?.active ?? 0;
  const totalCount = stats?.total ?? 0;
  const activeRatio = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const publishedCount = stats?.publishedMenus ?? 0;
  const publishedRatio = totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0;

  return (
    <AdminLayout
      title={
        isSettingsPage
          ? 'Ayarlar | Yönetim Paneli'
          : isServicesPage
            ? 'Kaynak Kontrol | Yönetim Paneli'
            : isRestaurantsPage
              ? 'Restoranlar | Yönetim Paneli'
              : 'Yönetim Paneli | zuuqrmenu'
      }
    >
      {isSettingsPage ? (
        <AdminSettingsTab />
      ) : (
        <div className="dp">
          {isServicesPage ? (
            <SystemLimitsTab />
          ) : (
            <>
              <PageHeader
                kicker="Yönetim paneli"
                title={isRestaurantsPage ? 'Restoranlar' : 'Sistem genel bakış'}
                lede={isRestaurantsPage
                  ? 'Kayıtlı işletmeleri arayın, durumlarını değiştirin ve ayrıntılarını düzenleyin.'
                  : 'Başvuruları, platformdaki restoranları ve menü kullanımını tek bakışta izleyin.'}
                actions={(
                  <>
                    <Button variant="ghost" icon="refresh" onClick={() => loadData(true)} disabled={refreshing}>{refreshing ? 'Yenileniyor…' : 'Yenile'}</Button>
                    {!isRestaurantsPage && <Button to="/admin/restaurants" variant="solid" icon="chevron">Restoranları yönet</Button>}
                  </>
                )}
              />

              {notice && <Notice tone="ok">{notice}</Notice>}
              {error && <Notice tone="bad">{error}</Notice>}

              {loading ? (
                <DashboardSkeleton variant={isRestaurantsPage ? 'table' : 'admin'} />
              ) : (
                <>
                  {/* ═════════ OVERVIEW ═════════ */}
                  {!isRestaurantsPage && (
                    <>
                      <div className="dp-grid dp-grid--stats">
                        <Stat icon="home" label="Toplam restoran" value={stats?.total ?? 0} hint="Platformda kayıtlı işletme" />
                        <Stat icon="check" label="Aktif restoran" value={stats?.active ?? 0} progress={activeRatio} hint={`%${activeRatio} aktif işletme oranı`} />
                        <Stat icon="clock" label="Onay bekleyen" value={stats?.pending ?? 0} hint={stats?.pending > 0 ? 'İncelemenizi bekliyor' : 'Bekleyen başvuru yok'} />
                        <Stat icon="shield" label="Askıya alınmış" value={stats?.suspended ?? 0} hint={stats?.suspended > 0 ? 'Girişi dondurulmuş işletme' : 'Askıda hesap yok'} />
                      </div>

                      <Card
                        title="Başvurular"
                        sub={pendingRestaurants.length ? `${pendingRestaurants.length} işletme onayınızı bekliyor` : 'Bekleyen başvuru yok'}
                        actions={pendingRestaurants.length > 0 && <Button to="/admin/restaurants?status=PENDING" variant="ghost" className="dp-btn--sm" icon="chevron">Tabloda gör</Button>}
                      >
                        {pendingRestaurants.length === 0 ? (
                          <EmptyState title="Tüm başvurular sonuçlandı" text="Yeni bir restoran kayıt olduğunda burada onayınız için listelenir." />
                        ) : (
                          <ul className="dp-apps">
                            {pendingRestaurants.map((restaurant) => (
                              <li key={restaurant._id}>
                                <span className="dp-avatar" aria-hidden="true">{(restaurant.name || 'R').charAt(0).toUpperCase()}</span>
                                <div className="dp-apps__main">
                                  <div className="dp-apps__title">
                                    <b>{restaurant.name}</b>
                                    <BusinessTypeBadge type={restaurant.businessType} />
                                  </div>
                                  <small>{restaurant.ownerId?.email || 'E-posta yok'}{restaurant.city ? ` · ${restaurant.city}` : ''} · {formatTimeAgo(restaurant.createdAt)}</small>
                                </div>
                                <div className="dp-apps__actions">
                                  <button type="button" className="dp-btn dp-btn--sm" onClick={() => handleQuickStatus(restaurant, 'reject')}>Reddet</button>
                                  <button type="button" className="dp-btn dp-btn--sm dp-btn--lime" onClick={() => handleQuickStatus(restaurant, 'approve')}>Onayla</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Card>

                      <div className="dp-grid dp-grid--2">
                        <Card title="Menü durumu" sub="Menüsünü yayına almış işletmeler">
                          <div className="dp-health">
                            <p className="dp-health__pct">%{publishedRatio}</p>
                            <p className="dp-health__text">{publishedCount} / {totalCount} işletmenin menüsü yayında</p>
                          </div>
                          <div className="dp-bar dp-bar--lg" aria-hidden="true"><span style={{ width: `${publishedRatio}%` }} /></div>
                          <dl className="dp-kv">
                            <div><dt>Toplam ürün</dt><dd>{(stats?.totalProducts ?? 0).toLocaleString('tr-TR')}</dd></div>
                            <div><dt>Toplam kategori</dt><dd>{(stats?.totalCategories ?? 0).toLocaleString('tr-TR')}</dd></div>
                            <div><dt>Toplam menü ziyareti</dt><dd>{(stats?.totalViews ?? 0).toLocaleString('tr-TR')}</dd></div>
                          </dl>
                        </Card>

                        <Card title="Son kayıtlar" sub="En yeni restoranlar" actions={<Button to="/admin/restaurants" variant="ghost" className="dp-btn--sm" icon="chevron">Tümü</Button>}>
                          {restaurants.length === 0 ? (
                            <EmptyState title="Henüz kayıtlı restoran yok" />
                          ) : (
                            <ul className="dp-apps dp-apps--plain">
                              {restaurants.slice(0, 5).map((r) => (
                                <li key={r._id}>
                                  <span className="dp-avatar" aria-hidden="true">{(r.name || 'R').charAt(0).toUpperCase()}</span>
                                  <div className="dp-apps__main">
                                    <div className="dp-apps__title"><b>{r.name}</b></div>
                                    <small>{r.ownerId?.email || r.city || '—'}</small>
                                  </div>
                                  <StatusBadge status={r.status} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </Card>
                      </div>
                    </>
                  )}

                  {/* ═════════ RESTAURANTS ═════════ */}
                  {isRestaurantsPage && (
                    <>
                      <Card className="dp-toolbar">
                        <label className="dp-search">
                          <Icon name="search" size={18} />
                          <span className="dp-sr">Restoran ara</span>
                          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ad, e-posta, şehir veya kullanıcı adı ile arayın" />
                        </label>
                        <label className="dp-select">
                          <span className="dp-sr">İşletme türü</span>
                          <select value={businessFilter} onChange={(e) => setBusinessFilter(e.target.value)}>
                            <option value="ALL">Tüm işletmeler</option>
                            <option value="RESTAURANT">Restoran</option>
                            <option value="CAFE">Kafe</option>
                            <option value="BAR">Bar</option>
                            <option value="BAKERY">Fırın ve pastane</option>
                            <option value="FAST_FOOD">Fast food</option>
                          </select>
                        </label>
                        <label className="dp-select">
                          <span className="dp-sr">Sıralama</span>
                          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">En yeni kayıt</option>
                            <option value="oldest">En eski kayıt</option>
                            <option value="name">İsme göre (A-Z)</option>
                            <option value="views">En çok ziyaret</option>
                          </select>
                        </label>
                      </Card>

                      <div className="dp-tabs" role="tablist" aria-label="Durum">
                        {[
                          ['ALL', 'Tümü', restaurants.length],
                          ['PENDING', 'Onay bekleyen', stats?.pending ?? 0],
                          ['ACTIVE', 'Aktif', stats?.active ?? 0],
                          ['SUSPENDED', 'Askıda', stats?.suspended ?? 0],
                          ['REJECTED', 'Reddedilen', stats?.rejected ?? 0],
                        ].map(([key, label, count]) => (
                          <button key={key} type="button" role="tab" aria-selected={statusFilter === key} className={statusFilter === key ? 'is-active' : ''} onClick={() => setStatusFilter(key)}>
                            {label}<span>{count}</span>
                          </button>
                        ))}
                      </div>

                      <Card className="dp-tablecard">
                        {filteredRestaurants.length === 0 ? (
                          <EmptyState
                            title="Aramanıza uygun restoran yok"
                            text="Filtreleri değiştirerek ya da temizleyerek tekrar deneyin."
                            action={<button type="button" className="dp-btn" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setBusinessFilter('ALL'); }}>Filtreleri temizle</button>}
                          />
                        ) : (
                          <>
                            <div className="dp-tablewrap">
                              <table className="dp-table">
                                <thead>
                                  <tr>
                                    <th>Restoran</th>
                                    <th>İşletme türü</th>
                                    <th>Yetkili ve şehir</th>
                                    <th>Durum</th>
                                    <th>Kayıt tarihi</th>
                                    <th className="dp-table__end"><span className="dp-sr">İşlemler</span></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {displayedRestaurants.map((restaurant) => {
                                    const isSuspended = restaurant.status === 'SUSPENDED';
                                    return (
                                      <tr key={restaurant._id} onClick={() => setDetailRestaurant(restaurant)}>
                                        <td>
                                          <div className="dp-cell">
                                            <span className="dp-avatar" aria-hidden="true">{(restaurant.name || 'R').charAt(0).toUpperCase()}</span>
                                            <div className="dp-cell__text">
                                              <b>{restaurant.name}</b>
                                              <small>/{getMenuIdentity(restaurant)}/menu{restaurant.ownerId?.username ? ` · @${restaurant.ownerId.username}` : ''}</small>
                                            </div>
                                          </div>
                                        </td>
                                        <td><BusinessTypeBadge type={restaurant.businessType} /></td>
                                        <td>
                                          <div className="dp-cell__text">
                                            <b>{restaurant.ownerId?.email || restaurant.ownerId?.name || '—'}</b>
                                            <small>{restaurant.city || 'Şehir belirtilmedi'}</small>
                                          </div>
                                        </td>
                                        <td><StatusBadge status={restaurant.status} /></td>
                                        <td>
                                          <div className="dp-cell__text">
                                            <b>{formatDate(restaurant.createdAt)}</b>
                                            <small>{formatTimeAgo(restaurant.createdAt)}</small>
                                          </div>
                                        </td>
                                        <td className="dp-table__end" onClick={(e) => e.stopPropagation()}>
                                          <RowActionMenu
                                            restaurant={restaurant}
                                            onViewDetails={(r) => setDetailRestaurant(r)}
                                            onEdit={(r) => setEditingRestaurant(r)}
                                            onSuspendToggle={(r) => handleQuickStatus(r, isSuspended ? 'activate' : 'suspend')}
                                            onDelete={(r) => setDeletingRestaurant(r)}
                                            onApprove={(r) => handleQuickStatus(r, 'approve')}
                                            onReject={(r) => handleQuickStatus(r, 'reject')}
                                          />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="dp-pager">
                              <p>
                                <b>{filteredRestaurants.length}</b> kayıttan <b>{startIndex + 1}–{Math.min(startIndex + appliedLimit, filteredRestaurants.length)}</b> arası gösteriliyor
                              </p>
                              <div className="dp-pager__controls">
                                <label className="dp-select dp-select--sm">
                                  <span className="dp-sr">Sayfa başına kayıt</span>
                                  <select value={appliedLimit} onChange={(e) => { setAppliedLimit(Number(e.target.value)); setCurrentPage(1); }}>
                                    <option value="5">5 kayıt</option>
                                    <option value="10">10 kayıt</option>
                                    <option value="20">20 kayıt</option>
                                    <option value="50">50 kayıt</option>
                                  </select>
                                </label>
                                <button type="button" className="dp-btn dp-btn--sm dp-btn--icon" disabled={validCurrentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} aria-label="Önceki sayfa"><span className="dp-flip"><Icon name="chevron" size={16} /></span></button>
                                <span className="dp-pager__page">{validCurrentPage} / {totalPages}</span>
                                <button type="button" className="dp-btn dp-btn--sm dp-btn--icon" disabled={validCurrentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} aria-label="Sonraki sayfa"><Icon name="chevron" size={16} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </Card>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── Detail Modal ────────────────────────────────────── */}
      {detailRestaurant && (
        <RestaurantDetailModal
          restaurant={detailRestaurant}
          onClose={() => setDetailRestaurant(null)}
          onEdit={(r) => {
            setDetailRestaurant(null);
            setEditingRestaurant(r);
          }}
          onSuspendToggle={(r) => {
            handleQuickStatus(r, r.status === 'SUSPENDED' ? 'activate' : 'suspend');
          }}
          onRestaurantUpdated={(updated) => {
            setRestaurants((prev) =>
              prev.map((r) => (r._id === updated._id ? { ...r, ...updated } : r))
            );
            setDetailRestaurant(updated);
          }}
        />
      )}

      {/* ─── Edit Modal ─────────────────────────────────────── */}
      {editingRestaurant && (
        <EditRestaurantModal
          restaurant={editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSave={handleSaveEdit}
          saving={savingEdit}
        />
      )}

      {/* ─── Delete Confirmation Modal ──────────────────────── */}
      {deletingRestaurant && (
        <DeleteRestaurantModal
          restaurant={deletingRestaurant}
          onClose={() => setDeletingRestaurant(null)}
          onConfirm={handleConfirmDelete}
          deleting={deletingBusy}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
