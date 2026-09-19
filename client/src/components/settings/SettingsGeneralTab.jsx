import { useEffect, useState } from 'react';

const LANGUAGE_KEY = 'zuulab.dashboard.language';
const THEME_KEY = 'zuulab.dashboard.theme';

const themeOptions = [
  {
    id: 'system',
    label: 'Sistem',
    subLabel: 'Otomatik',
    description: 'Cihazınızın sistem tercihlerini takip eder.',
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
    description: 'Aydınlık, ferah ve yüksek kontrastlı görünüm.',
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
    description: 'Gözü yormayan şık ve modern koyu arayüz.',
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
    disabled: false,
  },
];

const SettingsGeneralTab = () => {
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || 'tr');
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'system');

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent('zuulab-dashboard-theme-change', { detail: theme }));
  }, [theme]);

  return (
    <div className="settings-tab-content">
      {/* Görünüm / Tema Bölümü */}
      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Görünüm</span>
            <h3 className="settings-card__title">Dashboard Teması</h3>
            <p className="settings-card__desc">
              Panel arayüzünün renk modunu seçin. Bu ayar yalnızca yönetim panelinizi etkiler, halka açık menünüzün temasını değiştirmez.
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

      {/* Dil Tercihleri Bölümü */}
      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Yerelleştirme</span>
            <h3 className="settings-card__title">Panel Dili</h3>
            <p className="settings-card__desc">
              Yönetim panelinizde görüntülenen metinler için tercih ettiğiniz dili belirleyin.
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
  );
};

export { LANGUAGE_KEY, THEME_KEY };
export default SettingsGeneralTab;
