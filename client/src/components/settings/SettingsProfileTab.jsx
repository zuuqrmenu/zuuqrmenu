import { useState } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { getPublicMenuAbsoluteUrl } from '../../utils/domainHelpers';

const SettingsProfileTab = ({ account, setAccount, onNotice, onError }) => {
  const { checkAuth, restaurant } = useAuth();
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
            <span className="settings-eyebrow">Yönetici Profili</span>
            <h3 className="settings-card__title">Hesap Bilgileri ve Menü Adresi</h3>
            <p className="settings-card__desc">
              Restoran sahibinin kişisel profil bilgileri ve sistem genelindeki erişim kimliği.
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
              <span>Kullanıcı Adı (Menü Bağlantısı)</span>
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
              Giriş e-posta adresinizi <strong>Şifre ve Güvenlik</strong> sekmesinden güvenli doğrulama ile güncelleyebilirsiniz.
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

      {/* 2. Üyelik ve Abonelik Bilgileri (Yakında) */}
      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Abonelik & Paket</span>
            <h3 className="settings-card__title">Üyelik Bilgileri</h3>
            <p className="settings-card__desc">
              Restoranınızın sistemdeki mevcut paket planı ve üyelik detayları.
            </p>
          </div>
          <span className="settings-membership-badge">
            <span className="settings-membership-badge__dot" />
            Yakında
          </span>
        </div>

        <div className="settings-membership-grid">
          {/* Plan Kartı */}
          <div className="settings-membership-card">
            <div className="settings-membership-card__icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="settings-membership-card__info">
              <span className="settings-membership-card__label">Mevcut Üyelik Planı</span>
              <strong className="settings-membership-card__title">zuuqrmenu Standart Restoran Paketi</strong>
              <p className="settings-membership-card__desc">
                Sınırsız kategori ve ürün yönetimi, QR menü oluşturma ve temel analitik özellikleri dahil.
              </p>
            </div>
            <span className="settings-status-badge settings-status-badge--active">
              ● Aktif Üyelik
            </span>
          </div>

          {/* Geçerlilik Süresi Kartı */}
          <div className="settings-membership-card">
            <div className="settings-membership-card__icon settings-membership-card__icon--calendar">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="settings-membership-card__info">
              <span className="settings-membership-card__label">Geçerlilik Süresi</span>
              <strong className="settings-membership-card__title">Aktif Dönem</strong>
              <p className="settings-membership-card__desc">
                Üyelik başlangıç tarihi: {restaurant?.createdAt ? new Date(restaurant.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Aktif'}
              </p>
            </div>
            <span className="settings-membership-card__tag">
              Süresiz Erişim
            </span>
          </div>
        </div>

        {/* Bilgilendirici İpucu */}
        <div className="settings-membership-notice">
          <div className="settings-membership-notice__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="settings-membership-notice__text">
            <strong>Gelişmiş Abonelik Yönetimi Çok Yakında!</strong>
            <p>
              Paket yükseltme, fatura geçmişi, ek şube yönetimi ve otomatik yenileme seçenekleri bu alana entegre edilecektir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsProfileTab;
