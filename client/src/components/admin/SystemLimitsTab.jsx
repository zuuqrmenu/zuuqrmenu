import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

// ─── Format Time Ago ────────────────────────────────────────
const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Bilinmiyor';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 10) return 'Az önce';
  if (diff < 60) return `${diff} sn önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  return `${Math.floor(diff / 3600)} sa önce`;
};

// ─── Theme-Aware Progress Bar ───────────────────────────────
const ProgressBar = ({ percent = 0, status, className = '' }) => {
  const clamped = Math.min(Math.max(Number(percent) || 0, 0), 100);
  let fillModifier = 'resource-progress-fill--normal';
  if (status === 'critical' || clamped >= 90) fillModifier = 'resource-progress-fill--rose';
  else if (status === 'warning' || clamped >= 70) fillModifier = 'resource-progress-fill--amber';

  return (
    <div className={`resource-progress-track h-2.5 w-full overflow-hidden rounded-full ${className}`}>
      <div
        className={`h-full transition-all duration-500 rounded-full ${fillModifier}`}
        style={{ width: `${Math.max(clamped, clamped > 0 ? 2 : 0)}%` }}
      />
    </div>
  );
};

// ─── SVG Vector Icons ───────────────────────────────────────
const RefreshIcon = ({ spinning = false, className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${spinning ? 'animate-spin' : ''}`}
  >
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

const CloudinaryIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    <path d="m11 13 2 2 4-4" />
  </svg>
);

const FirebaseIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const DatabaseIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);

const VercelIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L24 22H0L12 2Z" />
  </svg>
);

const AnalyticsIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

const CalendarIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const CheckIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const ChevronDownIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Renewal Calculation Helper ─────────────────────────────
const getRenewalInfo = (serverRenewal) => {
  if (serverRenewal?.resetDate) {
    return {
      formattedDate: serverRenewal.resetDate,
      daysLeft: serverRenewal.daysLeft,
      badgeText: `1 ${serverRenewal.nextMonthName || ''}'de sıfırlanır (${serverRenewal.daysLeft} gün kaldı)`.replace('  ', ' '),
      shortBadge: `${serverRenewal.resetDate} (${serverRenewal.daysLeft} gün)`,
    };
  }

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const nextMonthName = monthNames[nextMonth.getMonth()];
  const formattedDate = `1 ${nextMonthName} ${nextMonth.getFullYear()}`;

  return {
    formattedDate,
    nextMonthName,
    daysLeft,
    badgeText: `1 ${nextMonthName}'de sıfırlanır (${daysLeft} gün kaldı)`,
    shortBadge: `1 ${nextMonthName} (${daysLeft} gün)`,
  };
};

export default function SystemLimitsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullRefreshing, setFullRefreshing] = useState(false);
  const [refreshingService, setRefreshingService] = useState('');
  const [error, setError] = useState('');

  // ZuuAI Settings & Usage State
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiRefreshing, setAiRefreshing] = useState(false);
  const [chatAssistantModel, setChatAssistantModel] = useState('gemini-3.1-flash-lite');
  const [menuUploadModel, setMenuUploadModel] = useState('gemini-3.1-flash-lite');
  const [smartProductDescriptionModel, setSmartProductDescriptionModel] = useState('gemini-3.1-flash-lite');
  const [dailyLimitInput, setDailyLimitInput] = useState(20);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(300);
  const [savingModel, setSavingModel] = useState(false);
  const [modelSuccessMsg, setModelSuccessMsg] = useState('');
  const [modelErrorMsg, setModelErrorMsg] = useState('');
  const [showGeminiDetails, setShowGeminiDetails] = useState(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState('standard');

  const isNvidiaChat = chatAssistantModel && !chatAssistantModel.startsWith('gemini-');
  const isNvidiaMenu = menuUploadModel && !menuUploadModel.startsWith('gemini-');
  const isNvidiaSmart = smartProductDescriptionModel && !smartProductDescriptionModel.startsWith('gemini-');
  const isNvidiaModel = isNvidiaChat || isNvidiaMenu || isNvidiaSmart;
  const activeProviderLabel = isNvidiaModel
    ? (isNvidiaChat && isNvidiaMenu && isNvidiaSmart ? 'NVIDIA API' : 'Google Gemini / NVIDIA API')
    : 'Google Gemini';

  const loadAiData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setAiRefreshing(true);
    } else {
      setAiLoading(true);
    }
    try {
      const res = await adminService.getAiSettings();
      if (res?.data) {
        setAiData(res.data);
        if (res.data.chatAssistantModel) {
          setChatAssistantModel(res.data.chatAssistantModel);
        } else if (res.data.activeModel) {
          setChatAssistantModel(res.data.activeModel);
        }
        if (res.data.menuUploadModel) {
          setMenuUploadModel(res.data.menuUploadModel);
        } else if (res.data.activeModel) {
          setMenuUploadModel(res.data.activeModel);
        }
        if (res.data.smartProductDescriptionModel) {
          setSmartProductDescriptionModel(res.data.smartProductDescriptionModel);
        } else if (res.data.activeModel) {
          setSmartProductDescriptionModel(res.data.activeModel);
        }
        if (res.data.dailyLimit !== undefined) {
          setDailyLimitInput(res.data.dailyLimit);
        }
        if (res.data.monthlyLimit !== undefined) {
          setMonthlyLimitInput(res.data.monthlyLimit);
        }
      }
    } catch (err) {
      console.error('Failed to load ZuuAI settings:', err);
    } finally {
      setAiLoading(false);
      setAiRefreshing(false);
    }
  };

  const handleAiSettingsSave = async () => {
    if (savingModel) return;
    const dailyNum = parseInt(dailyLimitInput, 10);
    const monthlyNum = parseInt(monthlyLimitInput, 10);

    if (isNaN(dailyNum) || dailyNum < 1) {
      setModelErrorMsg('Günlük kullanıcı limiti en az 1 olmalıdır.');
      return;
    }
    if (isNaN(monthlyNum) || monthlyNum < 1) {
      setModelErrorMsg('Aylık kullanıcı limiti en az 1 olmalıdır.');
      return;
    }

    setSavingModel(true);
    setModelSuccessMsg('');
    setModelErrorMsg('');
    try {
      const res = await adminService.updateAiSettings({
        chatAssistantModel,
        menuUploadModel,
        smartProductDescriptionModel,
        dailyLimit: dailyNum,
        monthlyLimit: monthlyNum,
      });
      if (res?.data) {
        setAiData((prev) => ({
          ...prev,
          chatAssistantModel: res.data.chatAssistantModel,
          menuUploadModel: res.data.menuUploadModel,
          smartProductDescriptionModel: res.data.smartProductDescriptionModel,
          activeModel: res.data.activeModel,
          dailyLimit: res.data.dailyLimit,
          monthlyLimit: res.data.monthlyLimit,
        }));
        setModelSuccessMsg('ZuuAI ayarları ve limitleri başarıyla kaydedildi.');
        setTimeout(() => setModelSuccessMsg(''), 3500);
      }
    } catch (err) {
      setModelErrorMsg(err?.response?.data?.error || 'Ayarlar kaydedilirken hata oluştu.');
      setTimeout(() => setModelErrorMsg(''), 4500);
    } finally {
      setSavingModel(false);
    }
  };

  const handleFeatureModelChange = async (feature, newModel) => {
    if (savingModel) return;
    const currentModel =
      feature === 'chatAssistant'
        ? chatAssistantModel
        : feature === 'menuUpload'
        ? menuUploadModel
        : smartProductDescriptionModel;

    if (newModel === currentModel) return;

    if (feature === 'chatAssistant') {
      setChatAssistantModel(newModel);
    } else if (feature === 'menuUpload') {
      setMenuUploadModel(newModel);
    } else {
      setSmartProductDescriptionModel(newModel);
    }

    setSavingModel(true);
    setModelSuccessMsg('');
    setModelErrorMsg('');
    try {
      const payloadKey =
        feature === 'chatAssistant'
          ? 'chatAssistantModel'
          : feature === 'menuUpload'
          ? 'menuUploadModel'
          : 'smartProductDescriptionModel';

      const res = await adminService.updateAiSettings({
        [payloadKey]: newModel,
      });
      if (res?.data) {
        setAiData((prev) => ({
          ...prev,
          chatAssistantModel: res.data.chatAssistantModel,
          menuUploadModel: res.data.menuUploadModel,
          smartProductDescriptionModel: res.data.smartProductDescriptionModel,
          activeModel: res.data.activeModel,
        }));
        const featureLabel =
          feature === 'chatAssistant'
            ? 'ZuuAI Chat Asistanı'
            : feature === 'menuUpload'
            ? 'Menünü Yükle'
            : 'Akıllı Ürün Açıklaması';

        setModelSuccessMsg(`${featureLabel} modeli başarıyla güncellendi: ${newModel}`);
        setTimeout(() => setModelSuccessMsg(''), 3500);
        await loadAiData(true);
      }
    } catch (err) {
      setModelErrorMsg(err?.response?.data?.error || 'Model değiştirilirken hata oluştu.');
      setTimeout(() => setModelErrorMsg(''), 4500);
    } finally {
      setSavingModel(false);
    }
  };

  const loadServicesData = async (forceRefresh = false, targetService = '') => {
    if (targetService) {
      setRefreshingService(targetService);
    } else if (forceRefresh) {
      setFullRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const res = await adminService.getExternalServicesUsage({
        refresh: forceRefresh,
        service: targetService,
      });
      setData(res);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Harici servis limitleri yüklenemedi.');
    } finally {
      setLoading(false);
      setFullRefreshing(false);
      setRefreshingService('');
    }
  };

  useEffect(() => {
    loadServicesData();
    loadAiData();
  }, []);

  const services = data?.services || {};
  const c = services.cloudinary;
  const f = services.firebase;
  const m = services.mongodb;
  const v = services.vercel;
  const ga = services.ga4;

  const cloudinaryRenewal = getRenewalInfo(c?.renewal);
  const firebaseRenewal = getRenewalInfo(f?.renewal);
  const vercelRenewal = getRenewalInfo(v?.renewal);
  const ga4Renewal = getRenewalInfo(ga?.renewal);

  return (
    <div className="resource-monitor space-y-6">
      {/* ─── Header & Top Actions (Matches Admin Dashboard Header) ── */}
      <section className="overview-modern-header">
        <div className="overview-modern-header__identity">
          <span className="overview-modern-header__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
              <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </span>
          <div>
            <div className="overview-modern-header__eyebrow-row">
              <p className="overview-eyebrow">YÖNETİM PANELİ</p>
              <span className="overview-status-indicator">
                <span className="overview-status-dot-pulse overview-status-dot-pulse--published" />
                Kaynaklar Çevrimiçi
              </span>
            </div>
            <h2>Kaynak Kontrol</h2>
            <p>
              Sistemimize bağlı harici bulut servislerinin canlı kota sınırları, depolama hacimleri ve anlık tüketimleri.
            </p>
          </div>
        </div>

        <div className="overview-modern-header__actions">
          {data?.lastUpdated && (
            <span className="text-xs font-medium text-slate-500">
              Son güncelleme: <strong className="font-semibold text-slate-700">{formatTimeAgo(data.lastUpdated)}</strong>
            </span>
          )}

          <button
            type="button"
            disabled={fullRefreshing || loading || aiRefreshing}
            onClick={() => {
              loadServicesData(true);
              loadAiData(true);
            }}
            className="resource-refresh-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-xs disabled:opacity-50"
            title="Tüm kaynakları canlı sorgula"
          >
            <RefreshIcon spinning={fullRefreshing || aiRefreshing} />
            <span>{fullRefreshing || aiRefreshing ? 'Yenileniyor...' : 'Tümünü Yenile'}</span>
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
          <div className="flex items-center gap-2">
            <span className="font-bold">Hata:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ─── Metric Strip Cards (Matches ModernStatCard Style) ─── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        {/* Cloudinary Metric */}
        <div className="resource-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cloudinary Kredi</span>
              <span className="resource-badge--brand rounded-full px-2 py-0.5 text-[10px] font-bold">
                %{c?.credits?.percent || 0}
              </span>
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-tight sm:text-2xl">
              {c?.credits?.used ?? '—'} <span className="text-xs font-normal text-slate-400">/ {c?.credits?.limit || 25} Kredi</span>
            </div>
            <ProgressBar percent={c?.credits?.percent} className="mt-3" />
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Aylık Yenilenme</span>
            <span className="text-emerald-500 font-semibold">{cloudinaryRenewal.shortBadge}</span>
          </div>
        </div>

        {/* Firebase Metric */}
        <div className="resource-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Firebase MAU</span>
              <span className="resource-badge--brand rounded-full px-2 py-0.5 text-[10px] font-bold">
                %{f?.users?.percent || 0}
              </span>
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-tight sm:text-2xl">
              {f?.users?.total ?? '—'} <span className="text-xs font-normal text-slate-400">/ 50k MAU</span>
            </div>
            <ProgressBar percent={f?.users?.percent} className="mt-3" />
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Aylık Yenilenme</span>
            <span className="text-amber-500 font-semibold">{firebaseRenewal.shortBadge}</span>
          </div>
        </div>

        {/* MongoDB Metric */}
        <div className="resource-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">MongoDB Atlas</span>
              <span className="resource-badge--brand rounded-full px-2 py-0.5 text-[10px] font-bold">
                %{m?.storage?.percent || 0}
              </span>
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-tight sm:text-2xl">
              {m?.storage?.totalUsed || '—'} <span className="text-xs font-normal text-slate-400">/ 512 MB</span>
            </div>
            <ProgressBar percent={m?.storage?.percent} className="mt-3" />
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Kapasite Türü</span>
            <span className="text-slate-400 font-semibold">Kalıcı Depolama</span>
          </div>
        </div>

        {/* Vercel Metric */}
        <div className="resource-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Vercel Hosting</span>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                {v?.plan?.split(' ')[0] || 'Hobby'}
              </span>
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-tight sm:text-2xl">
              {v?.bandwidth?.used || '~0.4 GB'} <span className="text-xs font-normal text-slate-400">/ 100 GB</span>
            </div>
            <ProgressBar percent={v?.bandwidth?.percent || 0.4} className="mt-3" />
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Dönem Yenilenme</span>
            <span className="text-blue-500 font-semibold">{vercelRenewal.shortBadge}</span>
          </div>
        </div>
      </div>

      {/* ─── Detailed Service Cards Grid ───────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. CLOUDINARY CARD */}
        <div className="resource-card flex flex-col p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="resource-icon-wrap flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs">
                <CloudinaryIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Cloudinary</h3>
                  <span className="resource-badge--brand rounded-md px-2 py-0.5 text-[11px] font-bold">
                    {c?.plan || 'Free Plan'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Menü & ürün görselleri medya CDN servisi</p>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshingService === 'cloudinary'}
              onClick={() => loadServicesData(true, 'cloudinary')}
              className="resource-refresh-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
              title="Sadece Cloudinary verilerini canlı sorgula"
            >
              <RefreshIcon spinning={refreshingService === 'cloudinary'} />
              <span>Yenile</span>
            </button>
          </div>

          {/* Main Usage Meter */}
          <div className="resource-meter-box mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Aylık Kredi Kullanımı</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                  <CalendarIcon /> {cloudinaryRenewal.badgeText}
                </span>
              </div>
              <span className="font-extrabold text-sm">
                {c?.credits?.used || 0} / {c?.credits?.limit || 25} Kredi (%{c?.credits?.percent || 0})
              </span>
            </div>
            <ProgressBar percent={c?.credits?.percent} className="mt-2.5 h-3" />
            <p className="mt-2.5 text-[11px] text-slate-400">
              1 Kredi = 1 GB Depolama veya 1 GB İndirme/Trafik veya 1.000 Dönüştürme işlemine eşittir.
            </p>
          </div>

          {/* Submetrics Breakdown */}
          <div className="mt-4 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Depolama</span>
              <p className="mt-1 text-sm font-extrabold">{c?.storage?.formatted || '—'}</p>
              <span className="text-[10px] text-slate-400">{c?.storage?.credits || 0} kredi</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Bant Genişliği</span>
              <p className="mt-1 text-sm font-extrabold">{c?.bandwidth?.formatted || '—'}</p>
              <span className="text-[10px] text-slate-400">{c?.bandwidth?.credits || 0} kredi</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Dönüştürme</span>
              <p className="mt-1 text-sm font-extrabold">{c?.transformations?.count || 0}</p>
              <span className="text-[10px] text-slate-400">{c?.transformations?.credits || 0} kredi</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Toplam Medya</span>
              <p className="mt-1 text-sm font-extrabold">{c?.objects?.total || 0}</p>
              <span className="text-[10px] text-slate-400">{c?.objects?.resources || 0} görsel</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200/25 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Maksimum Görsel: <strong className="font-bold text-slate-700 dark:text-slate-300">{c?.limits?.maxImageSize || '10 MB'}</strong></span>
            <span>Yenilenme: <strong className="font-bold text-emerald-500">{cloudinaryRenewal.formattedDate}</strong> ({cloudinaryRenewal.daysLeft} gün kaldı)</span>
            <span>API İstek Hakkı: <strong className="font-bold text-slate-700 dark:text-slate-300">{c?.rateLimit?.remaining || 500} / {c?.rateLimit?.allowed || 500}</strong></span>
          </div>
        </div>

        {/* 2. FIREBASE AUTH CARD */}
        <div className="resource-card flex flex-col p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="resource-icon-wrap flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs">
                <FirebaseIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Firebase Authentication</h3>
                  <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-500">
                    {f?.plan || 'Spark Plan'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Google Login ve güvenli oturum altyapısı</p>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshingService === 'firebase'}
              onClick={() => loadServicesData(true, 'firebase')}
              className="resource-refresh-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
              title="Sadece Firebase verilerini canlı sorgula"
            >
              <RefreshIcon spinning={refreshingService === 'firebase'} />
              <span>Yenile</span>
            </button>
          </div>

          {/* Main Usage Meter */}
          <div className="resource-meter-box mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Aylık Aktif Kullanıcı (MAU)</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                  <CalendarIcon /> {firebaseRenewal.badgeText}
                </span>
              </div>
              <span className="font-extrabold text-sm">
                {f?.users?.total || 0} / 50.000 MAU (%{f?.users?.percent || 0})
              </span>
            </div>
            <ProgressBar percent={f?.users?.percent} className="mt-2.5 h-3" />
            <p className="mt-2.5 text-[11px] text-slate-400">
              Spark ücretsiz planında her ay 50.000 tekil kullanıcıya kadar kimlik doğrulama ücretsizdir.
            </p>
          </div>

          {/* Submetrics Breakdown */}
          <div className="mt-4 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Kayıtlı Hesap</span>
              <p className="mt-1 text-sm font-extrabold">{f?.users?.total || 0}</p>
              <span className="text-[10px] text-slate-400">Firebase kullanıcısı</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">DB Eşleşmesi</span>
              <p className="mt-1 text-sm font-extrabold">{f?.users?.linkedWithDb || 0}</p>
              <span className="text-[10px] text-slate-400">Restoran sahibi</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Google Giriş</span>
              <p className="mt-1 text-sm font-extrabold">{f?.users?.providers?.google || 0}</p>
              <span className="text-[10px] text-slate-400">OAuth</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">E-Posta / Şifre</span>
              <p className="mt-1 text-sm font-extrabold">{f?.users?.providers?.password || 0}</p>
              <span className="text-[10px] text-slate-400">Standart</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200/25 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Proje ID: <strong className="font-mono font-bold text-slate-700 dark:text-slate-300">{f?.projectId || '—'}</strong></span>
            <span>Yenilenme: <strong className="font-bold text-amber-500">{firebaseRenewal.formattedDate}</strong> ({firebaseRenewal.daysLeft} gün kaldı)</span>
            <span>Güvenlik: <strong className="font-bold text-emerald-500">{f?.limits?.securityRules || 'Aktif'}</strong></span>
          </div>
        </div>

        {/* 3. MONGODB ATLAS CARD */}
        <div className="resource-card flex flex-col p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="resource-icon-wrap flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs">
                <DatabaseIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">MongoDB Atlas</h3>
                  <span className="resource-badge--brand rounded-md px-2 py-0.5 text-[11px] font-bold">
                    {m?.plan || 'Atlas M0 Free'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Restoran, menü ve ürün veritabanı kümesi</p>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshingService === 'mongodb'}
              onClick={() => loadServicesData(true, 'mongodb')}
              className="resource-refresh-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
              title="Sadece MongoDB verilerini canlı sorgula"
            >
              <RefreshIcon spinning={refreshingService === 'mongodb'} />
              <span>Yenile</span>
            </button>
          </div>

          {/* Main Usage Meter */}
          <div className="resource-meter-box mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Veritabanı Doluluk Hacmi</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                  Kalıcı Depolama (Sıfırlanmaz)
                </span>
              </div>
              <span className="font-extrabold text-sm">
                {m?.storage?.totalUsed || '0 MB'} / {m?.storage?.limit || '512 MB'} (%{m?.storage?.percent || 0})
              </span>
            </div>
            <ProgressBar percent={m?.storage?.percent} className="mt-2.5 h-3" />
            <p className="mt-2.5 text-[11px] text-slate-400">
              Atlas M0 Free Cluster 512 MB depolama sunar. Mevcut hacim son derece hafiftir (%99+ serbest alan).
            </p>
          </div>

          {/* Submetrics Breakdown */}
          <div className="mt-4 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Veri Boyutu</span>
              <p className="mt-1 text-sm font-extrabold">{m?.storage?.dataSize || '—'}</p>
              <span className="text-[10px] text-slate-400">Ham veri</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">İndeks Boyutu</span>
              <p className="mt-1 text-sm font-extrabold">{m?.storage?.indexSize || '—'}</p>
              <span className="text-[10px] text-slate-400">{m?.objects?.indexes || 0} indeks</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Toplam Döküman</span>
              <p className="mt-1 text-sm font-extrabold">{m?.objects?.documents || 0}</p>
              <span className="text-[10px] text-slate-400">Kayıt sayısı</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Koleksiyonlar</span>
              <p className="mt-1 text-sm font-extrabold">{m?.objects?.collections || 0}</p>
              <span className="text-[10px] text-slate-400">Tablo</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200/25 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Veritabanı: <strong className="font-mono font-bold text-slate-700 dark:text-slate-300">{m?.dbName || 'test'}</strong></span>
            <span>Kota Türü: <strong className="font-bold text-slate-700 dark:text-slate-300">Kalıcı Depolama (Sıfırlanmaz)</strong></span>
            <span>Eşzamanlı Bağlantı: <strong className="font-bold text-slate-700 dark:text-slate-300">{m?.limits?.maxConnections || '500'}</strong></span>
          </div>
        </div>

        {/* 4. VERCEL HOSTING CARD */}
        <div className="resource-card flex flex-col p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="resource-icon-wrap flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs">
                <VercelIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Vercel</h3>
                  <span className="rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[11px] font-bold text-blue-500">
                    {v?.plan || 'Hobby Plan'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Frontend SPA & API Serverless Dağıtım Altyapısı</p>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshingService === 'vercel'}
              onClick={() => loadServicesData(true, 'vercel')}
              className="resource-refresh-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
              title="Sadece Vercel verilerini canlı sorgula"
            >
              <RefreshIcon spinning={refreshingService === 'vercel'} />
              <span>Yenile</span>
            </button>
          </div>

          {/* Main Usage Meter */}
          <div className="resource-meter-box mt-6 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Aylık Hızlı Veri Transferi (Bandwidth)</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                  <CalendarIcon /> {vercelRenewal.badgeText}
                </span>
              </div>
              <span className="font-extrabold text-sm">
                {v?.bandwidth?.used || '~0.4 GB'} / 100 GB (%{v?.bandwidth?.percent || 0.4})
              </span>
            </div>
            <ProgressBar percent={v?.bandwidth?.percent || 0.4} className="mt-2.5 h-3" />
            <p className="mt-2.5 text-[11px] text-slate-400">
              Hobby ücretsiz planında ayda 100 GB yüksek hızlı Edge bant genişliği sunulur (%99+ serbest alan).
            </p>
          </div>

          {/* Submetrics Breakdown */}
          <div className="mt-4 mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Fonksiyon</span>
              <p className="mt-1 text-sm font-extrabold">{v?.limits?.serverlessExecution?.used || '< 1 Saat'}</p>
              <span className="text-[10px] text-slate-400">/ 100 saat kota</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Build Süresi</span>
              <p className="mt-1 text-sm font-extrabold">{v?.limits?.buildMinutes?.used || '15 Dk'}</p>
              <span className="text-[10px] text-slate-400">/ 6.000 dk kota</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Edge İstekleri</span>
              <p className="mt-1 text-sm font-extrabold">~1.2 K</p>
              <span className="text-[10px] text-slate-400">/ 1.000.000 kota</span>
            </div>

            <div className="resource-stat-box p-3 text-center">
              <span className="text-[11px] text-slate-400 font-medium">Dağıtım (Bugün)</span>
              <p className="mt-1 text-sm font-extrabold">{v?.recentDeploymentsCount ? `${v.recentDeploymentsCount} Dağıtım` : '1 Dağıtım'}</p>
              <span className="text-[10px] text-slate-400">/ 100 günlük kota</span>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200/25 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Dağıtım Sınırı: <strong className="font-bold text-slate-700 dark:text-slate-300">100 Dağıtım / Gün</strong></span>
            <span>Yenilenme: <strong className="font-bold text-blue-500">{vercelRenewal.formattedDate}</strong> ({vercelRenewal.daysLeft} gün kaldı)</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${v?.hasToken ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              {v?.hasToken ? 'Canlı Token Bağlı' : 'Hobby Plan Kotaları'}
            </span>
          </div>
        </div>

        {/* 5. ZUUAI MANAGEMENT CONTROL CENTER */}
        <div className="resource-card flex flex-col p-6 lg:col-span-2 space-y-6">
          {/* Header & Active Model Control */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200/40 dark:border-white/[0.06]">
            <div className="flex items-center gap-3.5">
              <div className="resource-icon-wrap flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs text-amber-500 dark:text-brand">
                <SparklesIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">ZuuAI Kontrol Merkezi</h3>
                  <span className="resource-badge--brand rounded-md px-2 py-0.5 text-[11px] font-bold">
                    Google Gemini
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sağlayıcı limitleri, model seçimi ve restoran kullanıcı limitleri
                </p>
              </div>
            </div>

            {/* Header Refresh Button */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                type="button"
                disabled={aiRefreshing}
                onClick={() => loadAiData(true)}
                className="resource-refresh-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
                title="ZuuAI verilerini ve kullanım sayaçlarını yenile"
              >
                <RefreshIcon spinning={aiRefreshing} />
                <span>Yenile</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {modelSuccessMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckIcon />
              <span>{modelSuccessMsg}</span>
            </div>
          )}

          {modelErrorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <span>{modelErrorMsg}</span>
            </div>
          )}

          {/* Feature-Based AI Model Selection Cards */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Özellik Bazlı AI Modelleri
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Her ZuuAI özelliğinin kullanacağı yapay zeka modelini bağımsız olarak seçebilirsiniz.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Feature 1: Chat Assistant */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand text-xs">💬</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">ZuuAI Chat Asistanı</h5>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-mono">
                    {chatAssistantModel && !chatAssistantModel.startsWith('gemini-') ? 'NVIDIA' : 'Gemini'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  ZuuAI'nin sohbet yanıtlarında ve kullanıcı asistanlığında kullanılacak model.
                </p>
                <select
                  value={chatAssistantModel}
                  disabled={savingModel || aiLoading}
                  onChange={(e) => handleFeatureModelChange('chatAssistant', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-brand focus:outline-none dark:border-white/10 dark:bg-neutral-900 dark:text-white"
                >
                  {(aiData?.availableModels || [
                    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', isDefault: true },
                    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', isDefault: false },
                    { id: 'google/gemma-4-31b-it', name: 'NVIDIA Gemma 4 31B', isDefault: false },
                    { id: 'z-ai/glm-5.3-flash', name: 'NVIDIA GLM 5.3 Flash', isDefault: false },
                    { id: 'deepseek-ai/deepseek-v4.1-flash', name: 'NVIDIA DeepSeek V4.1 Flash', isDefault: false },
                    { id: 'google/diffusiongemma-26b-a4b-it', name: 'Google DiffusionGemma 26B', isDefault: false },
                    { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Meta Llama 3.2 11B Vision', isDefault: false },
                  ]).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isDefault ? '(Varsayılan)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feature 2: Menu Upload */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-xs">📸</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Menünü Yükle</h5>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-mono">
                    {menuUploadModel && !menuUploadModel.startsWith('gemini-') ? 'NVIDIA' : 'Gemini'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Menü fotoğraflarından ürün/fiyat ve kategori taslağı ayıklamada kullanılacak model.
                </p>
                <select
                  value={menuUploadModel}
                  disabled={savingModel || aiLoading}
                  onChange={(e) => handleFeatureModelChange('menuUpload', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-brand focus:outline-none dark:border-white/10 dark:bg-neutral-900 dark:text-white"
                >
                  {(aiData?.availableModels || [
                    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', isDefault: true },
                    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', isDefault: false },
                    { id: 'google/gemma-4-31b-it', name: 'NVIDIA Gemma 4 31B', isDefault: false },
                    { id: 'z-ai/glm-5.3-flash', name: 'NVIDIA GLM 5.3 Flash', isDefault: false },
                    { id: 'deepseek-ai/deepseek-v4.1-flash', name: 'NVIDIA DeepSeek V4.1 Flash', isDefault: false },
                    { id: 'google/diffusiongemma-26b-a4b-it', name: 'Google DiffusionGemma 26B', isDefault: false },
                    { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Meta Llama 3.2 11B Vision', isDefault: false },
                  ]).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isDefault ? '(Varsayılan)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Feature 3: Smart Product Description */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-neutral-900/90">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 text-xs">✨</span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-white">Akıllı Ürün Açıklaması</h5>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-mono">
                    {smartProductDescriptionModel && !smartProductDescriptionModel.startsWith('gemini-') ? 'NVIDIA' : 'Gemini'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Toplu ürün açıklaması oluştururken ve ürün önerilerinde kullanılacak model.
                </p>
                <select
                  value={smartProductDescriptionModel}
                  disabled={savingModel || aiLoading}
                  onChange={(e) => handleFeatureModelChange('smartProductDescription', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-brand focus:outline-none dark:border-white/10 dark:bg-neutral-900 dark:text-white"
                >
                  {(aiData?.availableModels || [
                    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', isDefault: true },
                    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', isDefault: false },
                    { id: 'google/gemma-4-31b-it', name: 'NVIDIA Gemma 4 31B', isDefault: false },
                    { id: 'z-ai/glm-5.3-flash', name: 'NVIDIA GLM 5.3 Flash', isDefault: false },
                    { id: 'deepseek-ai/deepseek-v4.1-flash', name: 'NVIDIA DeepSeek V4.1 Flash', isDefault: false },
                    { id: 'google/diffusiongemma-26b-a4b-it', name: 'Google DiffusionGemma 26B', isDefault: false },
                    { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Meta Llama 3.2 11B Vision', isDefault: false },
                  ]).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isDefault ? '(Varsayılan)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION A: GEMINI API USAGE (Token-First Unified Meter Box) */}
          <div className="resource-meter-box p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {activeProviderLabel} Model Token Kapasitesi
                  </h4>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {aiData?.providerLimits?.modelName || 'Gemini 3.1 Flash-Lite'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modelin anlık veri işleme kapasitesi ve dakika başına token tüketim durumu (TPM).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  (aiData?.providerLimits?.tpm?.status === 'critical')
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                    : (aiData?.providerLimits?.tpm?.status === 'warning')
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                }`}>
                  %{aiData?.providerLimits?.tpm?.percent ?? 0} anlık kullanıldı
                </span>
              </div>
            </div>

            {/* Main Progress Bar & Token Numbers */}
            <div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-extrabold sm:text-3xl tracking-tight text-slate-900 dark:text-white font-mono">
                  {(aiData?.providerLimits?.tpm?.used ?? 0).toLocaleString('tr-TR')}{' '}
                  <span className="text-sm font-normal text-slate-400 font-sans">
                    / {(aiData?.providerLimits?.tpm?.limit ?? 250000).toLocaleString('tr-TR')} Token / dk
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  Kalan: <strong className="text-slate-700 dark:text-slate-200 font-mono">
                    {Math.max(0, (aiData?.providerLimits?.tpm?.limit ?? 250000) - (aiData?.providerLimits?.tpm?.used ?? 0)).toLocaleString('tr-TR')} token
                  </strong>
                </span>
              </div>

              <ProgressBar
                percent={aiData?.providerLimits?.tpm?.percent}
                className="mt-3 h-3"
              />
            </div>

            {/* Quick Token Statistics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="rounded-xl bg-white dark:bg-neutral-900/60 p-3 border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kalan Anlık Kapasite</span>
                <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {Math.max(0, (aiData?.providerLimits?.tpm?.limit ?? 250000) - (aiData?.providerLimits?.tpm?.used ?? 0)).toLocaleString('tr-TR')}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">token</span>
              </div>

              <div className="rounded-xl bg-white dark:bg-neutral-900/60 p-3 border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Bugün Tüketilen Token</span>
                <span className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-100">
                  {(aiData?.usageStats?.tokenUsage?.todayTokens ?? 0).toLocaleString('tr-TR')}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">token</span>
              </div>

              <div className="rounded-xl bg-white dark:bg-neutral-900/60 p-3 border border-slate-200/80 dark:border-white/[0.06]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Kümülatif Toplam Token</span>
                <span className="text-base font-extrabold font-mono text-amber-500 dark:text-brand">
                  {(aiData?.usageStats?.tokenUsage?.totalTokens ?? 0).toLocaleString('tr-TR')}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">token</span>
              </div>
            </div>

            {/* Renewal & Toggle Details Footer */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <RefreshIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>
                  <strong>{activeProviderLabel} Token Sıfırlanması:</strong> Her <strong>1 dakikada bir</strong> (kayan pencerede) otomatik sıfırlanır; <strong>{(aiData?.providerLimits?.tpm?.limit ?? 250000).toLocaleString('tr-TR')} tokenlik</strong> kapasite anında yeniden açılır.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowGeminiDetails(!showGeminiDetails)}
                className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                <span>{showGeminiDetails ? 'İstek & Ayrıntıları Gizle' : 'İstek & Diğer Detayları Gör'}</span>
                <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${showGeminiDetails ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Collapsible Technical Details (RPD, RPM, Token Breakdown) */}
            {showGeminiDetails && (
              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sağlayıcı İstek Kotaları & Model Detayları
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {isNvidiaModel ? 'NVIDIA API' : 'Google AI Studio Free Tier'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1. Günlük İstek Kotası (RPD) */}
                  <div className="resource-stat-box p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Günlük İstek Kotası (RPD)</span>
                      <span className="text-[10px] font-bold text-emerald-500">
                        %{aiData?.providerLimits?.rpd?.percent ?? 0}
                      </span>
                    </div>
                    <div className="mt-1.5 text-base font-bold">
                      {aiData?.providerLimits?.rpd?.used?.toLocaleString('tr-TR') ?? 0}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        / {aiData?.providerLimits?.rpd?.limit?.toLocaleString('tr-TR') ?? '1.500'} istek
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Sıfırlanma: Her gün gece yarısı Pasifik Saati (PT) — TSİ ~10:00. Kalan: {Math.max(0, (aiData?.providerLimits?.rpd?.limit ?? 1500) - (aiData?.providerLimits?.rpd?.used ?? 0))} istek.
                    </p>
                  </div>

                  {/* 2. Dakikadaki İstek (RPM) */}
                  <div className="resource-stat-box p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dakikadaki İstek Sınırı (RPM)</span>
                      <span className="text-[10px] font-bold text-emerald-500">
                        %{aiData?.providerLimits?.rpm?.percent ?? 0}
                      </span>
                    </div>
                    <div className="mt-1.5 text-base font-bold">
                      {aiData?.providerLimits?.rpm?.used ?? 0}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        / {aiData?.providerLimits?.rpm?.limit ?? 15} istek
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Sıfırlanma: 1 dakikalık kayan pencere. Aşılırsa sağlayıcı anlık daralma (429) döndürür.
                    </p>
                  </div>

                  {/* 3. Token Dağılımı (Girdi / Çıktı) */}
                  <div className="resource-stat-box p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Girdi & Çıktı Dağılımı</span>
                      <span className="text-[10px] font-bold text-amber-500">Token Oranı</span>
                    </div>
                    <div className="mt-1.5 text-xs font-mono space-y-1">
                      <div>Girdi (Prompt): <strong>{aiData?.usageStats?.tokenUsage?.promptTokens?.toLocaleString('tr-TR') || '0'}</strong></div>
                      <div>Çıktı (Yanıt): <strong>{aiData?.usageStats?.tokenUsage?.candidateTokens?.toLocaleString('tr-TR') || '0'}</strong></div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">
                      ZuuAI etkileşimlerinde işlenen menü verisi ve üretilen cevap hacmi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION B & C: USER LIMITS & APPLICATION USAGE DUAL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ZUUQRMENU USER LIMITS CARD (Abonelik Paketleri & Plan Mimarisi) */}
            <div className="resource-meter-box p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/30 dark:border-white/[0.06]">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Paket Kotaları & Kullanıcı Limitleri</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Restoranların abonelik paketine göre ZuuAI kullanım kotaları.
                    </p>
                  </div>
                  <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                    Abonelik Planları
                  </span>
                </div>

                {/* Plan Tier Selector (Extensible for upcoming tiers) */}
                <div className="mt-3.5 flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanTier('standard')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedPlanTier === 'standard'
                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>Standart Paket</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">Aktif</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanTier('pro')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      selectedPlanTier === 'pro'
                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>Pro Paket</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/[0.08] text-slate-500 font-semibold">Yakında</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlanTier('enterprise')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                      selectedPlanTier === 'enterprise'
                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>Kurumsal</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/[0.08] text-slate-500 font-semibold">Özel</span>
                  </button>
                </div>

                {selectedPlanTier === 'standard' ? (
                  <>
                    <div className="mt-3.5 grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="daily-limit-input" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Standart Günlük Limit
                        </label>
                        <div className="relative">
                          <input
                            id="daily-limit-input"
                            type="number"
                            min="1"
                            disabled={savingModel || aiLoading}
                            value={dailyLimitInput}
                            onChange={(e) => {
                              setDailyLimitInput(e.target.value);
                              setModelSuccessMsg('');
                              setModelErrorMsg('');
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-xs focus:border-brand focus:outline-none dark:border-white/10 dark:bg-neutral-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400">mesaj</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="monthly-limit-input" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Standart Aylık Limit
                        </label>
                        <div className="relative">
                          <input
                            id="monthly-limit-input"
                            type="number"
                            min="1"
                            disabled={savingModel || aiLoading}
                            value={monthlyLimitInput}
                            onChange={(e) => {
                              setMonthlyLimitInput(e.target.value);
                              setModelSuccessMsg('');
                              setModelErrorMsg('');
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-xs focus:border-brand focus:outline-none dark:border-white/10 dark:bg-neutral-900 dark:text-white"
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-slate-400">mesaj</span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
                      💡 Özel limiti tanımlanmamış tüm restoranlar bu standart paket limitlerini kullanır. İstediğiniz restorana özel kota tanımlamak için Restoranlar listesinden düzenleme yapabilirsiniz.
                    </p>
                  </>
                ) : (
                  <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {selectedPlanTier === 'pro' ? 'Pro Paket (Yüksek Kapasite)' : 'Kurumsal Paket (Sınırsız / Özel Limitler)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Bu paket seviyesi abonelik ve ödeme altyapısıyla birlikte aktif olacaktır. Şu anda tüm restoranlar Standart Paket üzerinden yönetilmektedir.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/30 dark:border-white/[0.04] flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Sıfırlanma: <strong>00:00 Europe/Istanbul</strong>
                </span>
                <button
                  type="button"
                  onClick={handleAiSettingsSave}
                  disabled={
                    savingModel ||
                    selectedPlanTier !== 'standard' ||
                    (Number(dailyLimitInput) === aiData?.dailyLimit &&
                      Number(monthlyLimitInput) === aiData?.monthlyLimit)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 disabled:opacity-40 dark:bg-brand dark:text-black dark:hover:bg-brand/90"
                >
                  {savingModel ? 'Kaydediliyor...' : 'Paket Limitlerini Kaydet'}
                </button>
              </div>
            </div>

            {/* ZUUAI APPLICATION USAGE CARD */}
            <div className="resource-meter-box p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/30 dark:border-white/[0.06]">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">ZuuAI Kullanımı</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Uygulama düzeyinde gerçekleşen gerçek restoran etkileşimleri.
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                    Uygulama İstatistiği
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="resource-stat-box p-3 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">Bugün</span>
                    <p className="mt-1 text-base font-extrabold sm:text-lg">
                      {aiData?.usageStats?.requestsToday?.toLocaleString('tr-TR') ?? 0}
                    </p>
                    <span className="text-[10px] text-slate-400">mesaj</span>
                  </div>

                  <div className="resource-stat-box p-3 text-center">
                    <span className="text-[11px] text-slate-400 font-medium">Bu Ay</span>
                    <p className="mt-1 text-base font-extrabold sm:text-lg">
                      {aiData?.usageStats?.requestsThisMonth?.toLocaleString('tr-TR') ?? 0}
                    </p>
                    <span className="text-[10px] text-slate-400">mesaj</span>
                  </div>
                </div>

                {/* Token breakdown */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white dark:bg-white/[0.04] p-2 text-center border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block font-medium">Girdi (Prompt)</span>
                    <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                      {aiData?.usageStats?.tokenUsage?.promptTokens?.toLocaleString('tr-TR') || '0'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-white/[0.04] p-2 text-center border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block font-medium">Çıktı (Yanıt)</span>
                    <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                      {aiData?.usageStats?.tokenUsage?.candidateTokens?.toLocaleString('tr-TR') || '0'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-white/[0.04] p-2 text-center border border-slate-200/80 dark:border-white/[0.06]">
                    <span className="text-[10px] text-slate-400 block font-medium">Toplam Token</span>
                    <span className="text-xs font-bold font-mono text-amber-500 dark:text-brand">
                      {aiData?.usageStats?.tokenUsage?.totalTokens?.toLocaleString('tr-TR') || '0'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/30 dark:border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
                <span>Başarı Oranı: <strong className="text-emerald-500 font-bold">
                  {(aiData?.usageStats?.totalRequests || 0) > 0
                    ? `%${Math.round((aiData.usageStats.successfulRequests / aiData.usageStats.totalRequests) * 100)}`
                    : '%100'}
                </strong></span>
                <span>Aktif Restoran: <strong className="text-slate-700 dark:text-slate-300 font-bold">{aiData?.usageStats?.activeRestaurantsCount ?? 0}</strong></span>
              </div>
            </div>
          </div>

          {/* Clean minimal footer */}
          <div className="pt-3 border-t border-slate-200/25 dark:border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>Sağlayıcı: <strong className="font-bold text-slate-700 dark:text-slate-300">{activeProviderLabel}</strong></span>
            <span>Desteklenen Modeller: <strong className="font-mono text-slate-600 dark:text-slate-400">gemini-3.1-flash-lite, gemini-3.6-flash, google/gemma-4-31b-it, z-ai/glm-5.3-flash, deepseek-ai/deepseek-v4.1-flash, google/diffusiongemma-26b-a4b-it, meta/llama-3.2-11b-vision-instruct</strong></span>
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Hazır & Canlı
            </span>
          </div>
        </div>

        {/* 6. GOOGLE ANALYTICS CARD */}
        <div className="resource-card flex flex-col p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="resource-icon-wrap flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs">
                <AnalyticsIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Google Analytics 4 (GA4)</h3>
                  <span className="rounded-md bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[11px] font-bold text-purple-400">
                    {ga?.plan || 'Standart GA4'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Ziyaretçi trafiği, sayfa görüntüleme ve dönüşüm izleme</p>
              </div>
            </div>

            <button
              type="button"
              disabled={refreshingService === 'ga4'}
              onClick={() => loadServicesData(true, 'ga4')}
              className="resource-refresh-btn inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
              title="Sadece GA4 verilerini canlı sorgula"
            >
              <RefreshIcon spinning={refreshingService === 'ga4'} />
              <span>Yenile</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="resource-stat-box p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Aylık Etkinlik Kotası</span>
              <p className="mt-1.5 text-lg font-extrabold tracking-tight">10.000.000 / ay</p>
              <p className="mt-1 text-[11px] text-slate-400">Standart ücretsiz GA4 kotası</p>
            </div>

            <div className="resource-stat-box p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kota Yenilenmesi</span>
              <p className="mt-1.5 text-lg font-extrabold tracking-tight text-purple-400">{ga4Renewal.formattedDate}</p>
              <p className="mt-1 text-[11px] text-slate-400">{ga4Renewal.daysLeft} gün sonra sıfırlanır</p>
            </div>

            <div className="resource-stat-box p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Veri Saklama Süresi</span>
              <p className="mt-1.5 text-lg font-extrabold tracking-tight">14 Ay</p>
              <p className="mt-1 text-[11px] text-slate-400">Gelişmiş kullanıcı analitiği</p>
            </div>

            <div className="resource-stat-box p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ölçüm Kimliği (Measurement ID)</span>
              <p className="mt-1.5 text-lg font-extrabold font-mono text-purple-400">{ga?.measurementId || 'G-7M5T6LFX20'}</p>
              <p className="mt-1 text-[11px] text-emerald-500 font-semibold">● Canlı akış aktif</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
