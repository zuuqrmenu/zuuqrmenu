import { useState } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getPublicMenuAbsoluteUrl } from '../../utils/domainHelpers';

const SettingsProfileTab = ({ account, setAccount, onNotice, onError }) => {
  const { checkAuth } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);

  const updateAccount = (event) => setAccount((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveAccount = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    onError('');
    try {
      const result = await authService.updateProfile({ name: account.name, username: account.username });
      setAccount((current) => ({ ...current, ...(result.user || {}) }));
      await checkAuth();
      onNotice('Hesap bilgileriniz başarıyla kaydedildi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Hesap bilgileri kaydedilemedi.');
    } finally {
      setSavingProfile(false);
    }
  };

  const publicMenuUrl = getPublicMenuAbsoluteUrl(account.username || 'ornek-menunuz');

  return (
    <div className="settings-tab-content">
      {/* 1. Yönetici Profil Bilgileri */}
      <form onSubmit={saveAccount} className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Yönetici profili</span>
            <h3 className="settings-card__title">Hesap Bilgileri ve Menü Adresi</h3>
            <p className="settings-card__desc">
              İşletme sahibinin kişisel profil bilgileri ve sistem genelindeki erişim kimliği.
            </p>
          </div>
        </div>

        <div className="settings-form-grid">
          <label className="settings-field-label">
            <span>Yönetici Adı Soyadı *</span>
            <input
              name="name"
              value={account.name}
              onChange={updateAccount}
              required
              placeholder="Ad Soyad"
              className="field-input"
            />
          </label>

          <label className="settings-field-label">
            <span className="settings-field-label__row">
              <span>Kullanıcı Adı</span>
              <span className="settings-readonly-badge">Değiştirilemez</span>
            </span>
            <div className="settings-readonly-input-wrap">
              <input
                name="username"
                value={account.username || ''}
                readOnly
                disabled
                placeholder="restoraniniz"
                className="field-input settings-readonly-field"
              />
              <span className="settings-readonly-lock-icon" title="Değiştirilemez" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
            </div>
            <small className="settings-field-hint">
              Menü linkiniz: <strong>{publicMenuUrl}</strong>
            </small>
          </label>

          <label className="settings-field-label settings-field-label--full">
            <span>Hesap Giriş E-postası</span>
            <input
              value={account.email}
              readOnly
              className="field-input settings-readonly-field"
            />
            <small className="settings-field-hint">
              Giriş e-posta adresinizi <strong>Şifre &amp; güvenlik</strong> sekmesinden güvenli doğrulama ile güncelleyebilirsiniz.
            </small>
          </label>
        </div>

        <div className="settings-form-footer">
          <button
            type="submit"
            disabled={savingProfile}
            className="settings-primary-button"
          >
            {savingProfile ? 'Kaydediliyor...' : 'Hesap Bilgilerini Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsProfileTab;
