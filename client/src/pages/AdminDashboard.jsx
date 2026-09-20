import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { adminService } from '../services/adminService';
import DashboardSkeleton from '../components/DashboardSkeleton';

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

/* ─── Modern Overview Stat Card ────────────────────────────── */
const ModernStatCard = ({ icon, tone, title, value, subtitle, badge }) => {
  const iconTones = {
    neutral: 'bg-slate-900 text-[#DEFF36]',
    amber: 'bg-amber-500 text-white shadow-amber-500/20',
    emerald: 'bg-emerald-600 text-white shadow-emerald-600/20',
    rose: 'bg-rose-600 text-white shadow-rose-600/20',
  };

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${iconTones[tone] || iconTones.neutral}`}>
            {icon}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
            <strong className="block text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {value}
            </strong>
          </div>
        </div>

        {badge && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </article>
  );
};

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
          {/* 1. Detayları Gör (Always first) */}
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

          {/* Pending Approval Options */}
          {isPending && (
            <>
              <div className="my-1 border-t border-slate-100" />
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

          <div className="my-1 border-t border-slate-100" />

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

          {/* 3. Askıya Al / Aktifleştir */}
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

          {/* 4. Sil */}
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
}) => {
  if (!restaurant) return null;

  const isSuspended = restaurant.status === 'SUSPENDED';

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
                {restaurant.slug && (
                  <a
                    href={`https://zuuqrmenu.com/menu/${restaurant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>zuuqrmenu.com/menu/{restaurant.slug}</span>
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
                <dt className="text-slate-500">Menü Yolu (Slug)</dt>
                <dd className="font-semibold font-mono text-slate-800">/{restaurant.slug || '—'}</dd>
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
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-black text-[#DEFF36] px-4 py-2 text-xs font-bold shadow-xs transition-colors"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Düzenle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Edit Restaurant Modal ────────────────────────────────── */
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
    setError('');
    onSave(form);
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [businessFilter, setBusinessFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination & Dropdown state (5, 10, 20, 50) with "Listele" button
  const [selectedLimit, setSelectedLimit] = useState(5);
  const [appliedLimit, setAppliedLimit] = useState(5);
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
    loadData();
  }, []);

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
          if (!nameMatch && !emailMatch && !cityMatch && !slugMatch) return false;
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
    <AdminLayout title={isRestaurantsPage ? 'Restoranlar | Yönetim Paneli' : 'Yönetim Paneli | zuuqrmenu'}>
      <div className="overview-dashboard mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        {/* ─── Header ─────────────────────────────────────── */}
        <section className="overview-modern-header">
          <div className="overview-modern-header__identity">
            <span className="overview-modern-header__mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <div className="overview-modern-header__eyebrow-row">
                <p className="overview-eyebrow">YÖNETİM PANELİ</p>
                <span className="overview-status-indicator">
                  <span className="overview-status-dot-pulse overview-status-dot-pulse--published" />
                  Sistem Aktif
                </span>
              </div>
              <h2>{isRestaurantsPage ? 'Kayıtlı Restoranlar' : 'Sistem Genel Bakış'}</h2>
              <p>
                {isRestaurantsPage
                  ? 'Kayıtlı işletmeleri sade listede görüntüleyin, detayları inceleyin veya düzenleyin.'
                  : 'Platform genelindeki restoran hareketlerini, başvuruları ve menü metriklerini tek bakışta yönetin.'}
              </p>
            </div>
          </div>

          <div className="overview-modern-header__actions">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-50"
              title="Verileri yenile"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={refreshing ? 'animate-spin text-emerald-600' : ''}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{refreshing ? 'Yenileniyor...' : 'Yenile'}</span>
            </button>

            {!isRestaurantsPage && (
              <Link
                to="/admin/restaurants"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-black"
              >
                <span>Restoranları Yönet</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </section>

        {/* ─── Status Notices ─────────────────────────────── */}
        {notice && (
          <div className="settings-status settings-status--success is-visible" role="status">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton variant="overview" />
        ) : (
          <>
            {/* ═══════════════════════════════════════════════ */}
            {/* ─── VIEW 1: OVERVIEW PAGE (/admin) ───────────── */}
            {/* ═══════════════════════════════════════════════ */}
            {!isRestaurantsPage && (
              <>
                {/* ─── Modern 4 Stat Cards ─────────────────── */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <ModernStatCard
                    icon={
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    }
                    tone="neutral"
                    title="Toplam Restoran"
                    value={stats?.total ?? 0}
                    subtitle="Platformda kayıtlı tüm işletmeler"
                  />

                  <ModernStatCard
                    icon={
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    }
                    tone="amber"
                    title="Onay Bekleyen"
                    value={stats?.pending ?? 0}
                    subtitle={stats?.pending > 0 ? `${stats.pending} işletme onay bekliyor` : 'Bekleyen yeni başvuru yok'}
                    badge={stats?.pending > 0 ? 'Aksiyon Gerekli' : null}
                  />

                  <ModernStatCard
                    icon={
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    }
                    tone="emerald"
                    title="Aktif Restoran"
                    value={stats?.active ?? 0}
                    subtitle={`%${activeRatio} aktif işletme oranı`}
                  />

                  <ModernStatCard
                    icon={
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    }
                    tone="rose"
                    title="Askıya Alınmış"
                    value={stats?.suspended ?? 0}
                    subtitle={stats?.suspended > 0 ? 'Girişi dondurulan işletme' : 'Askıda hesap bulunmuyor'}
                  />
                </section>

                {/* ─── Pending Applications Section ──────────── */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">BAŞVURU YÖNETİMİ</p>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">Restoran Başvuruları</h3>
                    </div>
                    {pendingRestaurants.length > 0 && (
                      <Link
                        to="/admin/restaurants?status=PENDING"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Tümünü Tabloda Gör ({pendingRestaurants.length}) →
                      </Link>
                    )}
                  </div>

                  {pendingRestaurants.length === 0 ? (
                    <div className="flex items-center gap-3 py-6 px-3 text-slate-500">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-base">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Onay bekleyen başvuru bulunmuyor</p>
                        <p className="text-xs text-slate-400">Tüm restoran kayıtları incelendi ve sonuçlandırıldı.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                      {pendingRestaurants.map((restaurant) => (
                        <article
                          key={restaurant._id}
                          className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-slate-900 text-sm truncate">{restaurant.name}</h4>
                                  <BusinessTypeBadge type={restaurant.businessType} />
                                </div>
                                <p className="mt-1 text-xs text-slate-500 truncate">{restaurant.ownerId?.email || 'E-posta yok'}</p>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">{formatTimeAgo(restaurant.createdAt)}</span>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                              {restaurant.city && <span>📍 {restaurant.city}</span>}
                              {restaurant.phone && <span>📞 {restaurant.phone}</span>}
                              {restaurant.slug && <span className="font-mono text-[10px]">/{restaurant.slug}</span>}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200/60 pt-3">
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(restaurant, 'reject')}
                              className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              Reddet
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(restaurant, 'approve')}
                              className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
                            >
                              Onayla
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                {/* ─── Platform Health & Summary ─────────────── */}
                <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Left: Menu & Catalog Health */}
                  <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">MENÜ VE İÇERİK</p>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">Platform Menü Durumu</h3>
                      </div>
                      <span className="rounded-lg bg-[#f4f9d8] border border-[#d4e875] px-2.5 py-1 text-xs font-bold text-[#485900]">
                        %{publishedRatio} Yayında
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                        <span>Menü Yayında Olan İşletmeler</span>
                        <span className="font-bold text-slate-900">{publishedCount} / {totalCount}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-500"
                          style={{ width: `${Math.max(publishedRatio, 4)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 divide-y divide-slate-100 text-xs">
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-slate-500 font-medium">Toplam Menü Ürünü</span>
                        <span className="font-bold text-slate-900">{stats?.totalProducts ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-slate-500 font-medium">Toplam Menü Kategorisi</span>
                        <span className="font-bold text-slate-900">{stats?.totalCategories ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-slate-500 font-medium">Toplam Platform Menü Ziyareti</span>
                        <span className="font-bold text-emerald-700">
                          {(stats?.totalViews ?? 0).toLocaleString('tr-TR')} ziyaret
                        </span>
                      </div>
                    </div>
                  </article>

                  {/* Right: Recent Registrations Stream */}
                  <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SON KATILANLAR</p>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">Son Kayıt Olan Restoranlar</h3>
                      </div>
                      <Link
                        to="/admin/restaurants"
                        className="text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        Tümünü Gör →
                      </Link>
                    </div>

                    <div className="mt-3 divide-y divide-slate-100">
                      {restaurants.slice(0, 4).map((r) => (
                        <div key={r._id} className="flex items-center justify-between py-2.5 gap-3">
                          <div className="min-w-0 flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                              {(r.name || 'R').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{r.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{r.ownerId?.email || r.city || '—'}</p>
                            </div>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  </article>
                </section>
              </>
            )}

            {/* ═══════════════════════════════════════════════ */}
            {/* ─── VIEW 2: RESTAURANTS PAGE (/admin/restaurants) */}
            {/* ═══════════════════════════════════════════════ */}
            {isRestaurantsPage && (
              <section className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Restoran adı, sahip e-postası, şehir veya slug ara..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900/10"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <select
                      value={businessFilter}
                      onChange={(e) => setBusinessFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900"
                    >
                      <option value="ALL">Tüm İşletmeler</option>
                      <option value="RESTAURANT">Restoran</option>
                      <option value="CAFE">Kafe</option>
                      <option value="BAR">Bar</option>
                      <option value="BAKERY">Fırın & Pastane</option>
                      <option value="FAST_FOOD">Fast Food</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900"
                    >
                      <option value="newest">En Yeni Kayıt</option>
                      <option value="oldest">En Eski Kayıt</option>
                      <option value="name">İsme Göre (A-Z)</option>
                      <option value="views">En Çok Ziyaret</option>
                    </select>
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {[
                    { key: 'ALL', label: 'Tümü', count: restaurants.length },
                    { key: 'PENDING', label: 'Onay Bekleyen', count: stats?.pending ?? 0 },
                    { key: 'ACTIVE', label: 'Aktif', count: stats?.active ?? 0 },
                    { key: 'SUSPENDED', label: 'Askıya Alınan', count: stats?.suspended ?? 0 },
                    { key: 'REJECTED', label: 'Reddedilen', count: stats?.rejected ?? 0 },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key)}
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 font-bold transition-all ${
                        statusFilter === tab.key
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${statusFilter === tab.key ? 'bg-slate-700 text-[#DEFF36]' : 'bg-slate-100 text-slate-600'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Streamlined, Optimum & Clean Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                  {filteredRestaurants.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-sm font-bold text-slate-800">Aramanıza uygun restoran bulunamadı.</p>
                      <p className="mt-1 text-xs text-slate-400">Filtreleri sıfırlayarak tekrar deneyebilirsiniz.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('ALL');
                          setBusinessFilter('ALL');
                        }}
                        className="mt-4 rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Filtreleri Temizle
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                            <tr>
                              <th className="px-5 py-3.5 font-bold">Restoran</th>
                              <th className="px-4 py-3.5 font-bold">İşletme Türü</th>
                              <th className="px-4 py-3.5 font-bold">Yetkili & Şehir</th>
                              <th className="px-4 py-3.5 font-bold">Durum</th>
                              <th className="px-4 py-3.5 font-bold">Kayıt Tarihi</th>
                              <th className="px-5 py-3.5 font-bold text-right">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {displayedRestaurants.map((restaurant) => {
                              const isSuspended = restaurant.status === 'SUSPENDED';
                              return (
                                <tr
                                  key={restaurant._id}
                                  className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                                  onClick={() => setDetailRestaurant(restaurant)}
                                >
                                  {/* Col 1: Restoran (Name + Slug) */}
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-800 text-xs shadow-2xs group-hover:bg-slate-900 group-hover:text-[#DEFF36] transition-colors">
                                        {(restaurant.name || 'R').charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-900 text-sm truncate">{restaurant.name}</p>
                                        {restaurant.slug && (
                                          <span className="text-[11px] font-mono text-slate-400 truncate block">
                                            /{restaurant.slug}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Col 2: İşletme Türü with Vector Icon */}
                                  <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                                    <BusinessTypeBadge type={restaurant.businessType} />
                                  </td>

                                  {/* Col 3: Yetkili & Şehir */}
                                  <td className="px-4 py-3.5">
                                    <p className="font-semibold text-slate-800 truncate">
                                      {restaurant.ownerId?.email || restaurant.ownerId?.name || '—'}
                                    </p>
                                    <p className="text-[11px] text-slate-400">
                                      {restaurant.city || 'Şehir belirtilmedi'}
                                    </p>
                                  </td>

                                  {/* Col 4: Durum */}
                                  <td className="px-4 py-3.5 whitespace-nowrap">
                                    <StatusBadge status={restaurant.status} />
                                  </td>

                                  {/* Col 5: Kayıt Tarihi */}
                                  <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                                    <span className="font-medium text-slate-700">{formatDate(restaurant.createdAt)}</span>
                                    <small className="block text-[10px] text-slate-400">{formatTimeAgo(restaurant.createdAt)}</small>
                                  </td>

                                  {/* Col 6: İşlemler */}
                                  <td
                                    className="px-5 py-3.5 text-right whitespace-nowrap"
                                    onClick={(e) => e.stopPropagation()}
                                  >
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

                      {/* Pagination & Dropdown (5, 10, 20, 50) with "Listele" Button */}
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-600">
                        {/* Left: Info summary */}
                        <div className="font-medium">
                          Toplam <strong className="text-slate-900 font-bold">{filteredRestaurants.length}</strong> kayıttan{' '}
                          <strong className="text-slate-900 font-bold">
                            {filteredRestaurants.length === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + appliedLimit, filteredRestaurants.length)}
                          </strong>{' '}
                          arası listeleniyor (Sayfa {validCurrentPage} / {totalPages})
                        </div>

                        {/* Right: Dropdown + Listele Button + Page navigation */}
                        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-2">
                            <label htmlFor="limit-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                              Görüntüleme:
                            </label>
                            <select
                              id="limit-select"
                              value={selectedLimit}
                              onChange={(e) => setSelectedLimit(Number(e.target.value))}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
                            >
                              <option value="5">5'er Listele</option>
                              <option value="10">10'ar Listele</option>
                              <option value="20">20'şer Listele</option>
                              <option value="50">50'şer Listele</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedLimit(Number(selectedLimit));
                                setCurrentPage(1);
                              }}
                              className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-[#DEFF36] hover:bg-black transition-colors shadow-2xs"
                            >
                              Listele
                            </button>
                          </div>

                          {/* Previous / Next page controls */}
                          {totalPages > 1 && (
                            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                              <button
                                type="button"
                                disabled={validCurrentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                title="Önceki Sayfa"
                              >
                                ← Önceki
                              </button>
                              <span className="px-1 text-xs font-bold text-slate-700">
                                {validCurrentPage} / {totalPages}
                              </span>
                              <button
                                type="button"
                                disabled={validCurrentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                                title="Sonraki Sayfa"
                              >
                                Sonraki →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>

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
