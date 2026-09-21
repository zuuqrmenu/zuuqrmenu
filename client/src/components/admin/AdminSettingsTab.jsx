import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LANGUAGE_KEY = 'zuulab.dashboard.language';
const THEME_KEY = 'zuulab.dashboard.theme';
const NOTIF_NEW_REST_KEY = 'zuulab.admin.notif.new_restaurant';
const NOTIF_QUOTA_KEY = 'zuulab.admin.notif.quota_alert';

const themeOptions = [
  {
    id: 'system',
    label: 'Sistem',
    subLabel: 'Otomatik',
    description: 'Cihazınızın sistem tercihlerini (gündüz/gece) takip eder.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'light',
    label: 'Açık Tema',
    subLabel: 'Gündüz',
    description: 'Aydınlık, ferah ve yüksek kontrastlı yönetim arayüzü.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    id: 'dark',
    label: 'Koyu Tema',
    subLabel: 'Gece',
    description: 'Gözü yormayan modern koyu tema (#DEFF36 neon lime vurgulu).',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
];

const languageOptions = [
  {
    id: 'tr',
    label: 'Türkçe',
    badge: 'TR',
    description: 'Varsayılan sistem dili',
    status: 'Aktif',
  },
  {
    id: 'en',
    label: 'English',
    badge: 'EN',
    description: 'International language',
    status: 'Çok Yakında',
  },
];

const adminTabs = [
  {
    id: 'general',
    label: 'Görünüm & Dil',
    description: 'Açık/Koyu tema modu ve panel dili',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Yönetici Profili',
    description: 'Yönetici kimliği ve oturum güvenliği',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'preferences',
    label: 'Sistem Tercihleri',
    description: 'Bildirimler ve harici kota uyarıları',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    id: 'system',
    label: 'Platform & Sağlık',
    description: 'Sürüm bilgisi ve bulut servis durumu',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
];

export default function AdminSettingsTab() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [notice, setNotice] = useState('');

  // ─── Appearance & Language State ───────────────────────────
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'system');
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || 'tr');

  // ─── Preferences State ─────────────────────────────────────
  const [notifNewRestaurant, setNotifNewRestaurant] = useState(() => {
    return localStorage.getItem(NOTIF_NEW_REST_KEY) !== 'false';
  });
  const [notifQuotaAlert, setNotifQuotaAlert] = useState(() => {
    return localStorage.getItem(NOTIF_QUOTA_KEY) !== 'false';
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent('zuulab-dashboard-theme-change', { detail: theme }));
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(NOTIF_NEW_REST_KEY, notifNewRestaurant);
  }, [notifNewRestaurant]);

  useEffect(() => {
    localStorage.setItem(NOTIF_QUOTA_KEY, notifQuotaAlert);
  }, [notifQuotaAlert]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleClearCache = () => {
    const themeVal = localStorage.getItem(THEME_KEY);
    const langVal = localStorage.getItem(LANGUAGE_KEY);
    const tokenVal = localStorage.getItem('token');
    const userVal = localStorage.getItem('user');

    localStorage.clear();

    if (themeVal) localStorage.setItem(THEME_KEY, themeVal);
    if (langVal) localStorage.setItem(LANGUAGE_KEY, langVal);
    if (tokenVal) localStorage.setItem('token', tokenVal);
    if (userVal) localStorage.setItem('user', userVal);

    setNotice('Yerel tarayıcı önbelleği başarıyla temizlendi.');
  };

  return (
    <div className="settings-page-shell">
      {/* ─── Sayfa Başlığı ──────────────────────────────────────── */}
      <header className="settings-page-header">
        <div className="settings-page-header__left">
          <span className="settings-eyebrow">YÖNETİM PANELİ</span>
          <h2>Sistem Ayarları</h2>
          <p>Yönetim paneli tema tercihlerinizi, dilinizi, bildirim ayarlarınızı ve sistem sağlığını yönetin.</p>
        </div>
        <div className="settings-page-header__restaurant-tag">
          <span className="settings-page-header__restaurant-dot" />
          <span>Süper Yönetici</span>
        </div>
      </header>

      {/* ─── Ana Düzen: Sol Sekmeler + Sağ İçerik ──────────────── */}
      <div className="settings-layout">
        {/* Sol Dikey Sekme Navigasyonu */}
        <nav className="settings-tabs-nav" aria-label="Admin ayarlar sekmeleri">
          {adminTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`settings-nav-item ${isActive ? 'is-active' : ''}`}
                title={tab.label}
                aria-label={tab.label}
              >
                <div className="settings-nav-item__icon">{tab.icon}</div>
                <div className="settings-nav-item__text">
                  <strong>{tab.label}</strong>
                  <span>{tab.description}</span>
                </div>
                {isActive && <div className="settings-nav-item__indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Sağ Ana İçerik */}
        <main className="settings-main">
          {notice && (
            <div className="settings-notice" role="status">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{notice}</span>
            </div>
          )}

          {/* 1. GÖRÜNÜM & DİL SEKMESİ */}
          {activeTab === 'general' && (
            <div className="settings-tab-content">
              {/* Dashboard Teması */}
              <section className="settings-card">
                <div className="settings-card__header">
                  <div>
                    <span className="settings-eyebrow">Görünüm</span>
                    <h3 className="settings-card__title">Dashboard Teması</h3>
                    <p className="settings-card__desc">
                      Yönetim paneli renk modunu belirleyin. Seçiminiz anında uygulanır ve tüm sayfalarda hatırlanır.
                    </p>
                  </div>
                </div>

                <div className="settings-theme-grid">
                  {themeOptions.map((opt) => {
                    const isSelected = theme === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`settings-theme-card ${isSelected ? 'is-selected' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <div className="settings-theme-card__icon-wrap">
                          {opt.icon}
                          {isSelected && (
                            <span className="settings-theme-card__check" aria-hidden="true">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="settings-theme-card__content">
                          <div className="settings-theme-card__title-row">
                            <strong>{opt.label}</strong>
                            <span className="settings-theme-card__sub">{opt.subLabel}</span>
                          </div>
                          <p>{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Panel Dili */}
              <section className="settings-card">
                <div className="settings-card__header">
                  <div>
                    <span className="settings-eyebrow">Yerelleştirme</span>
                    <h3 className="settings-card__title">Panel Dili</h3>
                    <p className="settings-card__desc">
                      Yönetici panelinizde kullanılacak arayüz dilini seçin.
                    </p>
                  </div>
                </div>

                <div className="settings-lang-grid">
                  {languageOptions.map((opt) => {
                    const isSelected = language === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setLanguage(opt.id)}
                        className={`settings-lang-card ${isSelected ? 'is-selected' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <div className="settings-lang-card__badge">{opt.badge}</div>
                        <div className="settings-lang-card__content">
                          <strong>{opt.label}</strong>
                          <span>{opt.description}</span>
                        </div>
                        <span className={`settings-lang-card__status ${isSelected ? 'is-active' : ''}`}>
                          {opt.status}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* 2. YÖNETİCİ PROFİLİ SEKMESİ */}
          {activeTab === 'profile' && (
            <div className="settings-tab-content">
              <section className="settings-card">
                <div className="settings-card__header">
                  <div>
                    <span className="settings-eyebrow">Yönetici Hesabı</span>
                    <h3 className="settings-card__title">Profil ve Oturum Detayları</h3>
                    <p className="settings-card__desc">
                      Sistem yönetim yetkilerine sahip aktif kullanıcı oturumunuz.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Yönetici Adı</span>
                    <p className="mt-1.5 text-base font-extrabold">{user?.name || 'Sistem Yöneticisi'}</p>
                    <span className="mt-1 inline-block text-[11px] text-slate-400">@{user?.username || 'admin'}</span>
                  </div>

                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Giriş E-Postası</span>
                    <p className="mt-1.5 text-base font-extrabold font-mono">{user?.email || 'admin@zuuqrmenu.com'}</p>
                    <span className="mt-1 inline-block text-[11px] text-emerald-500 font-semibold">● Yetkili Sistem Sahibi</span>
                  </div>

                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Yetki Seviyesi</span>
                    <p className="mt-1.5 text-base font-extrabold text-[#DEFF36] dark:text-[#DEFF36]">Süper Yönetici (Root)</p>
                    <span className="mt-1 inline-block text-[11px] text-slate-400">Tüm restoranları & kotaları yönetebilir</span>
                  </div>

                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Oturum Süresi</span>
                    <p className="mt-1.5 text-base font-extrabold">24 Saat</p>
                    <span className="mt-1 inline-block text-[11px] text-slate-400">JWT güvenli çerez doğrulaması</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200/30 dark:border-slate-800/50 pt-4">
                  <span className="text-xs text-slate-400">Farklı bir cihazdan oturum açmak isterseniz çıkış yapabilirsiniz.</span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors"
                  >
                    Oturumu Kapat
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* 3. SİSTEM & BİLDİRİM TERCİHLERİ */}
          {activeTab === 'preferences' && (
            <div className="settings-tab-content">
              <section className="settings-card">
                <div className="settings-card__header">
                  <div>
                    <span className="settings-eyebrow">Tercihler</span>
                    <h3 className="settings-card__title">Bildirim ve Sistem Uyarıları</h3>
                    <p className="settings-card__desc">
                      Yönetici panelinizdeki anlık uyarı ve eşik limitlerini özelleştirin.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      <strong className="block text-sm font-bold">Yeni Restoran Kayıt Bildirimleri</strong>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        Yeni bir restoran sisteme kaydolduğunda veya onay beklediğinde panelde bildirim gösterilsin.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifNewRestaurant(!notifNewRestaurant)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifNewRestaurant ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={notifNewRestaurant}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          notifNewRestaurant ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/40 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                      <strong className="block text-sm font-bold">Kaynak Kotası Eşik Uyarısı (%85)</strong>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        Cloudinary, MongoDB veya Firebase kaynakları %85 doluluğa ulaştığında sarı uyarı verilsin.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifQuotaAlert(!notifQuotaAlert)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        notifQuotaAlert ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={notifQuotaAlert}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          notifQuotaAlert ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* 4. PLATFORM & SAĞLIK BİLGİSİ */}
          {activeTab === 'system' && (
            <div className="settings-tab-content">
              <section className="settings-card">
                <div className="settings-card__header">
                  <div>
                    <span className="settings-eyebrow">Platform Sağlığı</span>
                    <h3 className="settings-card__title">Sistem Durumu ve Çevre Bilgisi</h3>
                    <p className="settings-card__desc">
                      ZuuLab QR Menu altyapısına bağlı bulut servislerinin genel çalışma durumu.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Yazılım Sürümü</span>
                    <p className="mt-1.5 text-base font-extrabold">v1.4.2</p>
                    <span className="mt-1 inline-block text-[11px] text-emerald-500 font-semibold">● Production Sürüm</span>
                  </div>

                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Veritabanı (Atlas)</span>
                    <p className="mt-1.5 text-base font-extrabold text-emerald-500">Çevrimiçi</p>
                    <span className="mt-1 inline-block text-[11px] text-slate-400">Cluster M0 Bağlı</span>
                  </div>

                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Medya CDN</span>
                    <p className="mt-1.5 text-base font-extrabold text-emerald-500">Aktif</p>
                    <span className="mt-1 inline-block text-[11px] text-slate-400">Cloudinary API</span>
                  </div>

                  <div className="resource-stat-box p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kimlik Doğrulama</span>
                    <p className="mt-1.5 text-base font-extrabold text-emerald-500">Aktif</p>
                    <span className="mt-1 inline-block text-[11px] text-slate-400">Firebase Admin SDK</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/30 dark:border-slate-800/50 pt-4">
                  <div>
                    <strong className="block text-sm font-bold">Önbellek Temizleme</strong>
                    <span className="text-xs text-slate-400">Tarayıcınızdaki geçici panel verilerini ve arayüz durumunu sıfırlar.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="rounded-xl border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    Önbelleği Temizle
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
