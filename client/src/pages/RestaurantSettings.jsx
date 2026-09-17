import { useEffect, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import SettingsProfileTab from '../components/settings/SettingsProfileTab';
import SettingsGeneralTab from '../components/settings/SettingsGeneralTab';
import SettingsSecurityTab from '../components/settings/SettingsSecurityTab';
import { useAuth } from '../context/AuthContext';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { restaurantProfileService } from '../services/restaurantProfileService';
import DashboardSkeleton from '../components/DashboardSkeleton';

const initialSettings = { description: '', primaryColor: '#1F2937', secondaryColor: '#FFFFFF', theme: 'MINIMAL', socialMedia: [], logo: null, coverImage: null, storeImage: null };
const initialProfile = { name: '', businessType: 'RESTAURANT', city: '', address: '', phone: '', email: '', status: 'ACTIVE' };

const RestaurantSettings = () => {
  const { user, restaurant, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
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
        setSettings({ ...initialSettings, ...(settingsData?.settings || {}), socialMedia: Array.isArray(settingsData?.settings?.socialMedia) ? settingsData.settings.socialMedia : [] });
        setProfile({ ...initialProfile, ...(profileData?.restaurant || {}) });
        setAccount({ name: user?.name || '', username: user?.username || '', email: user?.email || '' });
      })
      .catch((loadError) => active && setError(loadError.response?.data?.error || 'Ayarlar yüklenemedi.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3300);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const tabs = [
    { id: 'profile', label: 'Profil', description: 'Marka ve hesap bilgileri' },
    { id: 'general', label: 'Genel', description: 'Dil ve görünüm' },
    { id: 'security', label: 'Şifre ve Güvenlik', description: 'E-posta ve şifre' },
  ];

  return (
    <RestaurantLayout>
      <div className="settings-page-shell mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        <header className="settings-page-header">
          <div>
            <p className="text-sm font-medium text-emerald-600">Ayarlar</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Restoran Ayarlarınız</h2>
            <p className="mt-1 text-sm text-slate-500">Restoranınızın kimliğini, tercihlerini ve hesabını tek bir yerden yönetin.</p>
          </div>
        </header>
        <div className="settings-layout">
          <nav className="settings-tabs" aria-label="Ayarlar bölümleri">{tabs.map((tab) => <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)} className={`settings-tab ${activeTab === tab.id ? 'is-active' : ''}`}><strong>{tab.label}</strong><span>{tab.description}</span></button>)}</nav>
          <main className="settings-main">
            {notice && <div className="settings-notice" role="status">{notice}</div>}
            {error && <div className="settings-error" role="alert">{error}</div>}
            {loading ? <DashboardSkeleton variant="panel" /> : activeTab === 'profile' ? <SettingsProfileTab settings={settings} setSettings={setSettings} profile={profile} setProfile={setProfile} account={account} setAccount={setAccount} onNotice={setNotice} onError={setError} /> : activeTab === 'general' ? <SettingsGeneralTab /> : <SettingsSecurityTab email={account.email} onEmailChanged={(email) => setAccount((current) => ({ ...current, email }))} onNotice={setNotice} onError={setError} />}
          </main>
        </div>
        <section className="settings-logout-bar"><div><span className="settings-eyebrow">Oturum</span><strong>Çıkış Yap</strong><p>Bu cihazdaki restoran paneli oturumunu kapatın.</p></div><button type="button" onClick={logout} className="settings-danger-button">Çıkış Yap</button></section>
      </div>
    </RestaurantLayout>
  );
};

export default RestaurantSettings;
