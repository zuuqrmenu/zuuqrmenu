import { useEffect, useState } from 'react';
import AccountDialog from './AccountDialog';
import SettingsProfileTab from '../settings/SettingsProfileTab';
import SettingsGeneralTab from '../settings/SettingsGeneralTab';
import SettingsSecurityTab from '../settings/SettingsSecurityTab';
import { useAuth } from '../../context/AuthContext';

const TABS = [['profile', 'Profil'], ['general', 'Görünüm & dil'], ['security', 'Şifre & güvenlik']];

const AccountSettingsModal = ({ initialTab = 'profile', onClose }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [account, setAccount] = useState({ name: user?.name || '', username: user?.username || '', email: user?.email || '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3300);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const changeTab = (next) => { setTab(next); setNotice(''); setError(''); };

  return (
    <AccountDialog kicker="Hesap" title="Hesap ayarları" onClose={onClose} tabs={TABS} activeTab={tab} onTab={changeTab}>
      {/* Messages float over the content so showing one never pushes the form down. */}
      <div className="settings-main acc-toasts">
        {notice && <div className="settings-notice" role="status"><span>{notice}</span></div>}
        {error && <div className="settings-error" role="alert"><span>{error}</span></div>}
      </div>
      <div className="settings-main acc-settings">
        {tab === 'profile' && <SettingsProfileTab account={account} setAccount={setAccount} onNotice={setNotice} onError={setError} />}
        {tab === 'general' && <SettingsGeneralTab />}
        {tab === 'security' && (
          <SettingsSecurityTab
            email={account.email}
            onEmailChanged={(email) => setAccount((current) => ({ ...current, email }))}
            onNotice={setNotice}
            onError={setError}
          />
        )}
      </div>
    </AccountDialog>
  );
};

export default AccountSettingsModal;
