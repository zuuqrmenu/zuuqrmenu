import { useEffect, useState } from 'react';

const LANGUAGE_KEY = 'zuulab.dashboard.language';
const THEME_KEY = 'zuulab.dashboard.theme';

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
      <section className="settings-brand-section settings-preference-section">
        <div className="settings-section-heading"><div><span className="settings-eyebrow">Genel</span><h3>Genel</h3><p>Dashboard deneyiminizin temel tercihlerini yönetin.</p></div></div>
        <div className="settings-preference-row"><div><strong>Dil</strong><p>Dashboard arayüzü için tercih edilen dili seçin. Çeviri altyapısı bu tercihi ileride kullanacaktır.</p></div><select value={language} onChange={(event) => setLanguage(event.target.value)} className="field-input settings-preference-select" aria-label="Dashboard dili"><option value="tr">Türkçe</option><option value="en">English</option></select></div>
        <div className="settings-preference-row"><div><strong>Görünüm</strong><p>Bu tercih yalnızca dashboard ve uygulama arayüzünü etkiler; public menü temasını değiştirmez.</p></div><select value={theme} onChange={(event) => setTheme(event.target.value)} className="field-input settings-preference-select" aria-label="Dashboard görünümü"><option value="system">Sistem</option><option value="light">Açık</option><option value="dark">Koyu</option></select></div>
      </section>
    </div>
  );
};

export { LANGUAGE_KEY, THEME_KEY };
export default SettingsGeneralTab;
