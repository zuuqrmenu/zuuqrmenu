import { useEffect, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import SettingsBrandTab from '../components/settings/SettingsBrandTab';
import SettingsProfileTab from '../components/settings/SettingsProfileTab';
import SettingsGeneralTab from '../components/settings/SettingsGeneralTab';
import SettingsSecurityTab from '../components/settings/SettingsSecurityTab';
import { useAuth } from '../context/AuthContext';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { restaurantProfileService } from '../services/restaurantProfileService';
import DashboardSkeleton from '../components/DashboardSkeleton';

const initialSettings = { description: '', primaryColor: '#1F2937', secondaryColor: '#FFFFFF', theme: 'MINIMAL', socialMedia: [], logo: null, coverImage: null, storeImage: null };
const initialProfile = { name: '', businessType: 'RESTAURANT', city: '', address: '', phone: '', email: '', status: 'ACTIVE' };

const tabs = [
  {
    id: 'brand',
    label: 'Marka',
    description: 'Logo, kapak, marka renkleri ve sosyal medya',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profil',
    description: 'Yönetici hesabı ve üyelik planı',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'general',
    label: 'Görünüm & Dil',
    description: 'Dashboard teması (Açık/Koyu) ve panel dili',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Şifre & Güvenlik',
    description: 'Giriş e-postası ve hesap şifresi yönetimi',
    icon: (
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

const RestaurantSettings = () => {
  const { user, restaurant } = useAuth();
  const [activeTab, setActiveTab] = useState('brand');
  const [settings, setSettings] = useState(initialSettings);
  const [profile, setProfile] = useState({ ...initialProfile, name: restaurant?.name || '' });
  const [account, setAccount] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([restaurantSettingsService.get(), restaurantProfileService.get()])
      .then(([settingsData, profileData]) => {
        if (!active) return;
        setSettings({
          ...initialSettings,
          ...(settingsData?.settings || {}),
          socialMedia: Array.isArray(settingsData?.settings?.socialMedia)
            ? settingsData.settings.socialMedia.filter((item) => item?.url?.trim())
            : [],
        });
        setProfile({ ...initialProfile, ...(profileData?.restaurant || {}) });
        setAccount({ name: user?.name || '', username: user?.username || '', email: user?.email || '' });
      })
      .catch((loadError) => active && setError(loadError.response?.data?.error || 'Ayarlar yüklenemedi.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3300);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <RestaurantLayout>
      <div className="settings-page-shell">
        {/* Sayfa Başlığı */}
        <header className="settings-page-header">
          <div className="settings-page-header__left">
            <span className="settings-eyebrow">Yönetim Paneli</span>
            <h2>Restoran Ayarları</h2>
            <p>Restoranınızın marka kimliğini, profilinizi, tema tercihlerini ve hesap güvenliğini yönetin.</p>
          </div>
          {profile?.name && (
            <div className="settings-page-header__restaurant-tag">
              <span className="settings-page-header__restaurant-dot" />
              <span>{profile.name}</span>
            </div>
          )}
        </header>

        {/* Ana Düzen: Sol Sekmeler + Sağ İçerik */}
        <div className="settings-layout">
          <nav className="settings-tabs-nav" aria-label="Ayarlar sekmeleri">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
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

          <main className="settings-main">
            {notice && (
              <div className="settings-notice" role="status">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{notice}</span>
              </div>
            )}

            {error && (
              <div className="settings-error" role="alert">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <DashboardSkeleton variant="panel" />
            ) : activeTab === 'brand' ? (
              <SettingsBrandTab
                settings={settings}
                setSettings={setSettings}
                profile={profile}
                setProfile={setProfile}
                onNotice={setNotice}
                onError={setError}
              />
            ) : activeTab === 'profile' ? (
              <SettingsProfileTab
                account={account}
                setAccount={setAccount}
                onNotice={setNotice}
                onError={setError}
              />
            ) : activeTab === 'general' ? (
              <SettingsGeneralTab />
            ) : (
              <SettingsSecurityTab
                email={account.email}
                onEmailChanged={(email) => setAccount((current) => ({ ...current, email }))}
                onNotice={setNotice}
                onError={setError}
              />
            )}
          </main>
        </div>
      </div>
    </RestaurantLayout>
  );
};

export default RestaurantSettings;
