import { useEffect, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import SettingsBrandTab from '../components/settings/SettingsBrandTab';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { restaurantProfileService } from '../services/restaurantProfileService';
import { useAuth } from '../context/AuthContext';
import DashboardSkeleton from '../components/DashboardSkeleton';

const initialSettings = { description: '', primaryColor: '#1F2937', secondaryColor: '#FFFFFF', theme: 'MINIMAL', socialMedia: [], logo: null, coverImage: null, storeImage: null };
const initialProfile = { name: '', businessType: 'RESTAURANT', city: '', address: '', phone: '', email: '', status: 'ACTIVE' };

// Profile, appearance/language and security now live in the account dialog (sidebar profile menu);
// this page is only about the business itself: brand, details and social links.
const RestaurantSettings = () => {
  const { restaurant } = useAuth();
  const [settings, setSettings] = useState(initialSettings);
  const [profile, setProfile] = useState({ ...initialProfile, name: restaurant?.name || '' });
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
      })
      .catch((loadError) => active && setError(loadError.response?.data?.error || 'Ayarlar yüklenemedi.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

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
        <header className="settings-page-header">
          <div className="settings-page-header__left">
            <span className="settings-eyebrow">Yönetim paneli</span>
            <h2>Firma Ayarları</h2>
            <p>İşletmenizin marka kimliğini, iletişim bilgilerini ve sosyal bağlantılarını yönetin.</p>
          </div>
          {profile?.name && (
            <div className="settings-page-header__restaurant-tag">
              <span className="settings-page-header__restaurant-dot" />
              <span>{profile.name}</span>
            </div>
          )}
        </header>

        <div className="settings-layout settings-layout--single">
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
              <DashboardSkeleton variant="settings" />
            ) : (
              <SettingsBrandTab
                settings={settings}
                setSettings={setSettings}
                profile={profile}
                setProfile={setProfile}
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
