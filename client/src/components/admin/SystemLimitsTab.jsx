import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import DashboardSkeleton from '../DashboardSkeleton';
import '../../styles/resource-control.css';

/* ─── Helpers ───────────────────────────────────────────────── */
const nf = (n) => Number(n || 0).toLocaleString('tr-TR');

const formatTimeAgo = (isoString) => {
  if (!isoString) return 'Bilinmiyor';
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 10) return 'az önce';
  if (diff < 60) return `${diff} sn önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
};

/** 0-70 normal, 70-90 warning, 90+ critical. */
const levelFor = (percent) => {
  const p = Number(percent) || 0;
  if (p >= 90) return 'critical';
  if (p >= 70) return 'warning';
  return 'ok';
};
const LEVEL_LABEL = { ok: 'Sağlıklı', warning: 'Dikkat', critical: 'Kritik' };

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




const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

/* ─── Building blocks ───────────────────────────────────────── */
const Meter = ({ percent = 0, level }) => {
  const clamped = Math.min(Math.max(Number(percent) || 0, 0), 100);
  const lv = level || levelFor(clamped);
  return (
    <div className={`rc-meter rc-meter--${lv}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamped)}>
      <span style={{ width: `${clamped > 0 ? Math.max(clamped, 2.5) : 0}%` }} />
    </div>
  );
};

const Chip = ({ tone = 'neutral', children }) => <span className={`rc-chip rc-chip--${tone}`}>{children}</span>;

const Fact = ({ label, value, hint }) => (
  <div className="rc-fact">
    <dt>{label}</dt>
    <dd>{value}{hint && <small>{hint}</small>}</dd>
  </div>
);

const RenewalRow = ({ renewal }) => {
  if (!renewal) return null;
  const rolling = renewal.cycle === 'rolling' || renewal.cycle === 'continuous';
  return (
    <div className="rc-renewal">
      <span className="rc-renewal__icon"><CalendarIcon /></span>
      <div>
        <p className="rc-renewal__title">
          {rolling ? 'Yenilenme' : 'Sıfırlanma'}
          {renewal.approximate && <Chip tone="warn">Tahmini</Chip>}
        </p>
        {rolling ? (
          <p className="rc-renewal__text">{renewal.description}</p>
        ) : (
          <p className="rc-renewal__text"><strong>{renewal.resetDate}</strong> · {renewal.daysLeft} gün kaldı</p>
        )}
        {renewal.approximate && !rolling && <p className="rc-renewal__note">Sağlayıcı hesabınızın fatura gününe göre değişir; ortam değişkeniyle kesinleştirilebilir.</p>}
      </div>
    </div>
  );
};

/** One card per external service. `meter` is omitted for services we cannot measure. */
const ResourceCard = ({ icon, name, subtitle, plan, status, meter, facts = [], planLimits, renewal, notice, links, source, onRefresh, refreshing, children }) => (
  <article className="rc-card">
    <header className="rc-card__head">
      <span className="rc-card__icon">{icon}</span>
      <div className="rc-card__title">
        <h3>{name}</h3>
        <p>{subtitle}</p>
      </div>
      <Chip tone={status.tone}>{status.label}</Chip>
    </header>

    <div className="rc-card__badges">
      {plan && <Chip tone="plan">{plan}</Chip>}
      {source && <Chip tone={source.tone}>{source.label}</Chip>}
    </div>

    {meter && (
      <section className="rc-usage" aria-label={`${name} kullanım`}>
        <div className="rc-usage__top">
          <p className="rc-usage__value">
            <strong>{meter.used}</strong>
            <span>/ {meter.limit}</span>
          </p>
          <p className={`rc-usage__pct rc-usage__pct--${meter.level}`}>%{meter.percent}</p>
        </div>
        <Meter percent={meter.percent} level={meter.level} />
        <p className="rc-usage__caption">{meter.caption}</p>
      </section>
    )}

    {notice && <p className="rc-notice">{notice}</p>}

    {planLimits?.length > 0 && (
      <section className="rc-limits" aria-label={`${name} plan sınırları`}>
        <p className="rc-limits__title">Plan sınırları</p>
        <ul>
          {planLimits.map((l) => <li key={l.key}><span>{l.label}</span><b>{l.limit}</b></li>)}
        </ul>
      </section>
    )}

    <RenewalRow renewal={renewal} />

    {facts.length > 0 && <dl className="rc-facts">{facts.map((f) => <Fact key={f.label} {...f} />)}</dl>}
    {children}

    <footer className="rc-card__foot">
      {links?.console && <a className="rc-btn rc-btn--solid" href={links.console} target="_blank" rel="noopener noreferrer">Paneli aç <ExternalIcon /></a>}
      {links?.usage && links.usage !== links.console && <a className="rc-btn" href={links.usage} target="_blank" rel="noopener noreferrer">Kullanımı gör <ExternalIcon /></a>}
      {onRefresh && (
        <button type="button" className="rc-btn rc-btn--icon" onClick={onRefresh} disabled={refreshing} aria-label={`${name} verisini yenile`} title="Bu kaynağı yenile">
          <RefreshIcon spinning={refreshing} />
        </button>
      )}
    </footer>
  </article>
);

const SOURCE = {
  live: { tone: 'live', label: 'Canlı ölçüm' },
  none: { tone: 'muted', label: 'Ölçülmüyor' },
  app: { tone: 'live', label: 'Uygulama kayıtları' },
};

const statusOf = (svc, percent) => {
  if (!svc) return { tone: 'muted', label: 'Yükleniyor' };
  if (svc.status === 'NOT_CONFIGURED') return { tone: 'muted', label: 'Bağlı değil' };
  if (svc.status === 'READY_TO_CONNECT') return { tone: 'muted', label: 'Bağlantı bekliyor' };
  if (svc.status === 'ERROR' || svc.status === 'DISCONNECTED') return { tone: 'critical', label: 'Hata' };
  if (svc.status === 'WARNING') return { tone: 'warning', label: 'Uyarı' };
  if (percent === undefined || percent === null) return { tone: 'ok', label: 'Bağlı' };
  const lv = levelFor(percent);
  return { tone: lv, label: LEVEL_LABEL[lv] };
};

/* ─── Page ──────────────────────────────────────────────────── */
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


  const [aiTab, setAiTab] = useState('usage');

  const loadServicesData = async (forceRefresh = false, targetService = '') => {
    if (targetService) setRefreshingService(targetService);
    else if (forceRefresh) setFullRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const res = await adminService.getExternalServicesUsage({ refresh: forceRefresh, service: targetService });
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

  /* meters derived from the real payload */
  const cloudinaryMeter = c?.credits && {
    used: nf(c.credits.used), limit: `${nf(c.credits.limit)} kredi`, percent: c.credits.percent, level: levelFor(c.credits.percent),
    caption: `${nf(Math.max(0, c.credits.limit - c.credits.used))} kredi kaldı · 1 kredi ≈ 1 GB depolama ya da 1 GB bant genişliği ya da 1.000 dönüşüm`,
  };
  const firebaseMeter = f?.users && {
    used: nf(f.users.activeLast30), limit: `${nf(f.users.limit)} aktif kullanıcı`, percent: f.users.percent, level: levelFor(f.users.percent),
    caption: 'Son 30 günde oturum açan kullanıcı sayısı (aylık aktif kullanıcıya yakın bir tahmindir)',
  };
  const mongoMeter = m?.storage && {
    used: m.storage.totalUsed, limit: m.storage.limit, percent: m.storage.percent, level: levelFor(m.storage.percent),
    caption: `${m.storage.dataSize} veri + ${m.storage.indexSize} indeks · kalıcı kapasite, aylık sıfırlanmaz`,
  };

  /* overall health summary */
  const tracked = [
    { name: 'Cloudinary', svc: c, percent: c?.credits?.percent },
    { name: 'Firebase', svc: f, percent: f?.users?.percent },
    { name: 'MongoDB Atlas', svc: m, percent: m?.storage?.percent },
    { name: 'Vercel', svc: v },
    { name: 'Google Analytics', svc: ga },
  ].filter((t) => t.svc);
  const measured = tracked.filter((t) => t.percent !== undefined);
  const attention = measured.filter((t) => levelFor(t.percent) !== 'ok');
  const issues = tracked.filter((t) => ['ERROR', 'DISCONNECTED', 'WARNING'].includes(t.svc.status));
  const highest = measured.reduce((best, t) => (!best || t.percent > best.percent ? t : best), null);
  const overall = issues.length || attention.some((t) => levelFor(t.percent) === 'critical') ? 'critical' : attention.length ? 'warning' : 'ok';

  const busy = fullRefreshing || aiRefreshing;
  const refreshAll = () => { loadServicesData(true); loadAiData(true); };
  const refreshOne = (key) => () => loadServicesData(true, key);

  const tpm = aiData?.providerLimits?.tpm;
  const rpd = aiData?.providerLimits?.rpd;
  const rpm = aiData?.providerLimits?.rpm;
  const tokens = aiData?.usageStats?.tokenUsage;
  const modelOptions = aiData?.availableModels || [
    { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite', isDefault: true },
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', isDefault: false },
    { id: 'google/gemma-4-31b-it', name: 'NVIDIA Gemma 4 31B', isDefault: false },
    { id: 'z-ai/glm-5.3-flash', name: 'NVIDIA GLM 5.3 Flash', isDefault: false },
    { id: 'deepseek-ai/deepseek-v4.1-flash', name: 'NVIDIA DeepSeek V4.1 Flash', isDefault: false },
    { id: 'google/diffusiongemma-26b-a4b-it', name: 'Google DiffusionGemma 26B', isDefault: false },
    { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Meta Llama 3.2 11B Vision', isDefault: false },
  ];
  const aiFeatures = [
    { key: 'chatAssistant', title: 'ZuuAI sohbet asistanı', desc: 'Sohbet yanıtlarında ve kullanıcı asistanlığında kullanılır.', value: chatAssistantModel },
    { key: 'menuUpload', title: 'Menünü yükle', desc: 'Menü fotoğraflarından ürün, fiyat ve kategori ayıklar.', value: menuUploadModel },
    { key: 'smartProductDescription', title: 'Akıllı ürün açıklaması', desc: 'Ürün açıklaması ve öneri üretiminde kullanılır.', value: smartProductDescriptionModel },
  ];

  return (
    <div className="rc-page">
      {/* ─── Header ─── */}
      <section className="overview-modern-header rc-head">
        <div className="overview-modern-header__identity">
          <div>
            <div className="overview-modern-header__eyebrow-row">
              <p className="overview-eyebrow">Yönetim paneli</p>
            </div>
            <h2>Kaynak kontrol</h2>
            <p>Bağlı dış servislerin kullanımı, kalan hakları ve yenilenme tarihleri tek yerde.</p>
          </div>
        </div>
        <div className="overview-modern-header__actions rc-head__actions">
          {data?.lastUpdated && (
            <span className="rc-head__stamp">
              {data.cached ? 'Önbellekten' : 'Canlı'} · {formatTimeAgo(data.lastUpdated)}
            </span>
          )}
          <button type="button" className="rc-btn rc-btn--solid" disabled={busy || loading} onClick={refreshAll}>
            <RefreshIcon spinning={busy} />
            {busy ? 'Yenileniyor…' : 'Tümünü yenile'}
          </button>
        </div>
      </section>

      {error && <div className="rc-alert" role="alert"><strong>Veri alınamadı.</strong> {error}</div>}

      {loading ? <DashboardSkeleton variant="resources" /> : (
      <>
      {/* ─── Overview strip ─── */}
      <section className={`rc-overview rc-overview--${overall}`} aria-label="Genel durum">
        <div className="rc-overview__state">
          <span className="rc-overview__dot" aria-hidden="true" />
          <div>
            <h3>
              {loading ? 'Kaynaklar kontrol ediliyor…'
                : overall === 'ok' ? 'Tüm kaynaklar sağlıklı'
                : overall === 'warning' ? `${attention.length} kaynak dikkat istiyor`
                : 'İlgilenmeniz gereken kaynak var'}
            </h3>
            <p>
              {loading ? 'Sağlayıcılara bağlanılıyor.'
                : highest ? `En yüksek kullanım: ${highest.name} (%${highest.percent}). ${measured.length} kaynak canlı ölçülüyor, ${tracked.length - measured.length} kaynağın kullanımı ilgili panelden izlenir.`
                : 'Canlı ölçülen kaynak yok.'}
            </p>
          </div>
        </div>
        <ul className="rc-overview__list">
          {tracked.map((t) => {
            const st = statusOf(t.svc, t.percent);
            return <li key={t.name}><span>{t.name}</span><Chip tone={st.tone}>{t.percent !== undefined ? `%${t.percent}` : st.label}</Chip></li>;
          })}
        </ul>
      </section>

      {/* ─── Service cards ─── */}
      <div className="rc-grid">
        <ResourceCard
          icon={<CloudinaryIcon />}
          name="Cloudinary"
          subtitle="Menü ve ürün görselleri"
          plan={c?.plan}
          status={statusOf(c, c?.credits?.percent)}
          source={SOURCE.live}
          meter={cloudinaryMeter}
          notice={c && !cloudinaryMeter ? c.message : null}
          renewal={c?.renewal}
          facts={c?.storage ? [
            { label: 'Depolama', value: c.storage.formatted, hint: `${nf(c.storage.credits)} kredi` },
            { label: 'Bant genişliği', value: c.bandwidth.formatted, hint: `${nf(c.bandwidth.credits)} kredi` },
            { label: 'Dönüşüm', value: nf(c.transformations.count), hint: `${nf(c.transformations.credits)} kredi` },
            { label: 'Toplam medya', value: nf(c.objects.resources), hint: `${nf(c.objects.derived)} türetilmiş` },
            { label: 'API istek hakkı', value: `${nf(c.rateLimit?.remaining)} / ${nf(c.rateLimit?.allowed)}` },
            { label: 'En büyük görsel', value: c.limits?.maxImageSize },
          ] : []}
          links={c?.links}
          onRefresh={refreshOne('cloudinary')}
          refreshing={refreshingService === 'cloudinary'}
        />

        <ResourceCard
          icon={<FirebaseIcon />}
          name="Firebase Authentication"
          subtitle="Giriş ve oturum altyapısı"
          plan={f?.plan}
          status={statusOf(f, f?.users?.percent)}
          source={SOURCE.live}
          meter={firebaseMeter}
          notice={f && !firebaseMeter ? f.message : null}
          renewal={f?.renewal}
          facts={f?.users ? [
            { label: 'Kayıtlı hesap', value: `${nf(f.users.total)}${f.users.truncated ? '+' : ''}`, hint: f.users.truncated ? 'ilk 20.000 sayıldı' : undefined },
            { label: 'Veritabanı eşleşmesi', value: `${nf(f.users.linkedWithDb)} / ${nf(f.users.totalDbUsers)}` },
            { label: 'Google ile giriş', value: nf(f.users.providers?.google) },
            { label: 'E-posta / şifre', value: nf(f.users.providers?.password) },
            { label: 'Proje', value: f.projectId || '—' },
            { label: 'SMS doğrulama', value: f.limits?.phoneAuthLimit || '—' },
          ] : []}
          links={f?.links}
          onRefresh={refreshOne('firebase')}
          refreshing={refreshingService === 'firebase'}
        />

        <ResourceCard
          icon={<DatabaseIcon />}
          name="MongoDB Atlas"
          subtitle="Ana veritabanı"
          plan={m?.plan}
          status={statusOf(m, m?.storage?.percent)}
          source={SOURCE.live}
          meter={mongoMeter}
          notice={m && !mongoMeter ? m.message : null}
          renewal={m?.renewal}
          facts={m?.objects ? [
            { label: 'Veri boyutu', value: m.storage.dataSize },
            { label: 'İndeks boyutu', value: m.storage.indexSize },
            { label: 'Doküman', value: nf(m.objects.documents), hint: `ort. ${m.objects.avgObjectSize}` },
            { label: 'Koleksiyon', value: nf(m.objects.collections), hint: `${nf(m.objects.indexes)} indeks` },
            { label: 'Veritabanı', value: m.dbName || '—' },
            { label: 'Eşzamanlı bağlantı', value: m.limits?.maxConnections?.replace(' bağlantı', '') || '—' },
          ] : []}
          links={m?.links}
          onRefresh={refreshOne('mongodb')}
          refreshing={refreshingService === 'mongodb'}
        />

        <ResourceCard
          icon={<VercelIcon />}
          name="Vercel"
          subtitle="Site ve API barındırma"
          plan={v?.plan}
          status={statusOf(v)}
          source={SOURCE.none}
          notice={v?.message}
          planLimits={v?.planLimits}
          renewal={v?.renewal}
          facts={v?.latestDeployment ? [
            { label: 'Son dağıtım', value: v.latestDeployment.state || '—', hint: formatTimeAgo(new Date(v.latestDeployment.created).toISOString()) },
            { label: 'Yapan', value: v.latestDeployment.creator },
          ] : []}
          links={v?.links}
          onRefresh={refreshOne('vercel')}
          refreshing={refreshingService === 'vercel'}
        />

        <ResourceCard
          icon={<AnalyticsIcon />}
          name="Google Analytics 4"
          subtitle="Ziyaretçi ve etkinlik analizi"
          plan={ga?.plan}
          status={statusOf(ga)}
          source={SOURCE.none}
          notice={ga?.configured ? 'Etkinlik kullanımı bu sayfadan ölçülmez; GA4 panelinde Raporlar bölümünden izlenir.' : 'Ölçüm kimliği tanımlı değil.'}
          planLimits={ga?.planLimits}
          renewal={ga?.renewal}
          facts={ga?.measurementId ? [{ label: 'Ölçüm kimliği', value: ga.measurementId }] : []}
          links={ga?.links}
          onRefresh={refreshOne('ga4')}
          refreshing={refreshingService === 'ga4'}
        />

        <article className="rc-card rc-help">
          <header className="rc-card__head">
            <span className="rc-card__icon"><CheckIcon /></span>
            <div className="rc-card__title">
              <h3>Bu sayfa nasıl okunur?</h3>
              <p>Renkler ve etiketlerin anlamı</p>
            </div>
          </header>
          <ul className="rc-help__list">
            <li><span className="rc-help__swatch rc-help__swatch--ok" /><div><b>%0–70 · Sağlıklı</b><p>Kota rahat; işlem gerekmez.</p></div></li>
            <li><span className="rc-help__swatch rc-help__swatch--warn" /><div><b>%70–90 · Dikkat</b><p>Yenilenme tarihine kadar yetip yetmeyeceğini kontrol edin.</p></div></li>
            <li><span className="rc-help__swatch rc-help__swatch--bad" /><div><b>%90 üzeri · Kritik</b><p>Kota dolmak üzere; planı yükseltmeyi ya da kullanımı azaltmayı düşünün.</p></div></li>
          </ul>
          <dl className="rc-help__defs">
            <div><dt>Canlı ölçüm</dt><dd>Veri doğrudan sağlayıcıdan alınır (15 dakikada bir önbelleğe yazılır).</dd></div>
            <div><dt>Ölçülmüyor</dt><dd>Sağlayıcı kullanım verisi vermiyor; bu sayfada yalnızca plan sınırları vardır. Kullanım için Paneli aç düğmesini kullanın.</dd></div>
            <div><dt>Tahmini</dt><dd>Yenilenme günü bilinmiyor, ayın 1'i varsayıldı. Kesin tarih için sunucuda CLOUDINARY_BILLING_DAY / VERCEL_BILLING_DAY tanımlayın.</dd></div>
          </dl>
        </article>

        {/* ─── ZuuAI ─── */}
        <article className="rc-card rc-card--wide rc-ai">
          <header className="rc-card__head">
            <span className="rc-card__icon"><SparklesIcon /></span>
            <div className="rc-card__title">
              <h3>ZuuAI</h3>
              <p>Yapay zekâ modelleri, token harcaması ve restoran limitleri</p>
            </div>
            <button type="button" className="rc-btn rc-btn--icon" onClick={() => loadAiData(true)} disabled={aiRefreshing} aria-label="ZuuAI verisini yenile" title="Yenile">
              <RefreshIcon spinning={aiRefreshing} />
            </button>
          </header>

          <div className="rc-card__badges">
            <Chip tone="plan">{activeProviderLabel}</Chip>
            <Chip tone="live">Uygulama kayıtları</Chip>
          </div>

          <div className="rc-tabs" role="tablist" aria-label="ZuuAI bölümleri">
            {[['usage', 'Kullanım'], ['models', 'Modeller'], ['limits', 'Restoran limitleri']].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={aiTab === id} className={aiTab === id ? 'is-active' : ''} onClick={() => setAiTab(id)}>{label}</button>
            ))}
          </div>

          {modelSuccessMsg && <p className="rc-toast rc-toast--ok" role="status"><CheckIcon /> {modelSuccessMsg}</p>}
          {modelErrorMsg && <p className="rc-toast rc-toast--bad" role="alert">{modelErrorMsg}</p>}

          {aiTab === 'usage' && (
            <div className="rc-ai__body">
              <section className="rc-usage">
                <div className="rc-usage__top">
                  <p className="rc-usage__value"><strong>{nf(tpm?.used)}</strong><span>/ {nf(tpm?.limit ?? 250000)} token / dk</span></p>
                  <p className={`rc-usage__pct rc-usage__pct--${levelFor(tpm?.percent)}`}>%{tpm?.percent ?? 0}</p>
                </div>
                <Meter percent={tpm?.percent} />
                <p className="rc-usage__caption">Son bir dakikada ZuuAI üzerinden harcanan token. Kayan pencere olduğu için dakika dolunca kapasite kendiliğinden açılır. Sınır, {aiData?.providerLimits?.modelName || 'seçili model'} için sağlayıcının yayımlanmış referans değeridir.</p>
              </section>

              <dl className="rc-facts rc-facts--4">
                <Fact label="Bugün" value={`${nf(aiData?.usageStats?.requestsToday)} mesaj`} />
                <Fact label="Bu ay" value={`${nf(aiData?.usageStats?.requestsThisMonth)} mesaj`} />
                <Fact label="Bugün harcanan token" value={nf(tokens?.todayTokens)} />
                <Fact label="Toplam token" value={nf(tokens?.totalTokens)} hint={`${nf(tokens?.promptTokens)} girdi · ${nf(tokens?.candidateTokens)} çıktı`} />
                <Fact label="Günlük istek (RPD)" value={`${nf(rpd?.used)} / ${nf(rpd?.limit ?? 1500)}`} hint={`%${rpd?.percent ?? 0}`} />
                <Fact label="Dakikalık istek (RPM)" value={`${nf(rpm?.used)} / ${nf(rpm?.limit ?? 15)}`} hint={`%${rpm?.percent ?? 0}`} />
                <Fact label="Başarı oranı" value={(aiData?.usageStats?.totalRequests || 0) > 0 ? `%${Math.round((aiData.usageStats.successfulRequests / aiData.usageStats.totalRequests) * 100)}` : '—'} />
                <Fact label="Aktif restoran" value={nf(aiData?.usageStats?.activeRestaurantsCount)} />
              </dl>
              <p className="rc-hint">Günlük istek sınırı sağlayıcıda Pasifik Saati gece yarısı (yaklaşık 10:00 TSİ) sıfırlanır. Restoran mesaj limitleri ise 00:00 (İstanbul) saatinde sıfırlanır.</p>
            </div>
          )}

          {aiTab === 'models' && (
            <div className="rc-ai__body">
              <p className="rc-hint">Her özellik için kullanılacak modeli ayrı seçebilirsiniz. Seçim anında kaydedilir.</p>
              <div className="rc-models">
                {aiFeatures.map((ft) => (
                  <div className="rc-model" key={ft.key}>
                    <div>
                      <h4>{ft.title}</h4>
                      <p>{ft.desc}</p>
                    </div>
                    <label>
                      <span className="rc-sr">{ft.title} modeli</span>
                      <select value={ft.value} disabled={savingModel || aiLoading} onChange={(e) => handleFeatureModelChange(ft.key, e.target.value)}>
                        {modelOptions.map((o) => <option key={o.id} value={o.id}>{o.name}{o.isDefault ? ' (varsayılan)' : ''}</option>)}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
              <p className="rc-hint">Sağlayıcı: <strong>{activeProviderLabel}</strong> {isNvidiaModel && '· NVIDIA modelleri için ek anahtar gerekir.'}</p>
              <div className="rc-card__foot">
                <a className="rc-btn rc-btn--solid" href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio <ExternalIcon /></a>
                <a className="rc-btn" href="https://build.nvidia.com/" target="_blank" rel="noopener noreferrer">NVIDIA API <ExternalIcon /></a>
              </div>
            </div>
          )}

          {aiTab === 'limits' && (
            <div className="rc-ai__body">
              <p className="rc-hint">Özel limiti olmayan tüm restoranlar bu standart paket limitlerini kullanır. Tek bir restorana özel kota vermek için Restoranlar listesinde düzenleyin.</p>
              <div className="rc-limit-form">
                <label>
                  <span>Günlük mesaj limiti</span>
                  <input type="number" min="1" disabled={savingModel || aiLoading} value={dailyLimitInput} onChange={(e) => { setDailyLimitInput(e.target.value); setModelSuccessMsg(''); setModelErrorMsg(''); }} />
                </label>
                <label>
                  <span>Aylık mesaj limiti</span>
                  <input type="number" min="1" disabled={savingModel || aiLoading} value={monthlyLimitInput} onChange={(e) => { setMonthlyLimitInput(e.target.value); setModelSuccessMsg(''); setModelErrorMsg(''); }} />
                </label>
                <button
                  type="button"
                  className="rc-btn rc-btn--solid"
                  onClick={handleAiSettingsSave}
                  disabled={savingModel || (Number(dailyLimitInput) === aiData?.dailyLimit && Number(monthlyLimitInput) === aiData?.monthlyLimit)}
                >
                  {savingModel ? 'Kaydediliyor…' : 'Limitleri kaydet'}
                </button>
              </div>
              <p className="rc-hint">Pro ve Kurumsal paket limitleri, abonelik altyapısı devreye girdiğinde buradan yönetilecek.</p>
            </div>
          )}
        </article>
      </div>
      </>
      )}
    </div>
  );
}
