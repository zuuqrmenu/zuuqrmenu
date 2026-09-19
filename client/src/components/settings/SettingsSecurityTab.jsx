import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const maskEmail = (email) => {
  const [local, domain] = (email || '').split('@');
  if (!local || !domain) return email || '';
  return `${local.slice(0, 1)}${'•'.repeat(Math.max(2, local.length - 1))}@${domain}`;
};

const SettingsSecurityTab = ({ email, onEmailChanged, onNotice }) => {
  const { checkAuth } = useAuth();
  const [modal, setModal] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ currentEmail: email, currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const openModal = (type) => {
    setIsClosing(false);
    setModal(type);
    setStep(1);
    setForm({ currentEmail: email, currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
    setModalError('');
  };

  const closeModal = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setModal(null);
      setStep(1);
      setModalError('');
      setIsClosing(false);
      if (typeof callback === 'function') callback();
    }, 200);
  };

  useEffect(() => {
    if (!modal) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, isClosing]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const verify = async (event) => {
    event.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      await authService.reauthenticate({ currentEmail: form.currentEmail, currentPassword: form.currentPassword });
      setStep(2);
    } catch {
      setModalError('Mevcut e-posta veya şifre hatalı.');
    } finally {
      setSaving(false);
    }
  };

  const updateEmail = async (event) => {
    event.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const result = await authService.updateEmail({ currentEmail: form.currentEmail, currentPassword: form.currentPassword, newEmail: form.newEmail });
      onEmailChanged(result.user?.email || form.newEmail.trim().toLowerCase());
      await checkAuth();
      closeModal();
      onNotice('E-posta adresiniz başarıyla güncellendi.');
    } catch (error) {
      setModalError(error.response?.data?.error || 'E-posta adresi güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setModalError('Yeni şifreler eşleşmiyor.');
    if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(form.newPassword)) return setModalError('Şifre en az 8 karakter olmalı ve en az bir harf ile bir rakam içermelidir.');
    setSaving(true);
    setModalError('');
    try {
      await authService.changePassword({ currentEmail: form.currentEmail, currentPassword: form.currentPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      closeModal();
      onNotice('Şifreniz başarıyla güncellendi.');
    } catch (error) {
      setModalError(error.response?.data?.error || 'Şifre güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-tab-content">
      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Güvenlik</span>
            <h3 className="settings-card__title">Şifre ve Giriş Güvenliği</h3>
            <p className="settings-card__desc">
              Hesabınızın giriş bilgilerini yönetin. Güvenliğiniz için değişiklik yapmadan önce mevcut şifrenizle doğrulama istenir.
            </p>
          </div>
        </div>

        <div className="settings-security-grid">
          {/* E-posta Kartı */}
          <div className="settings-security-card">
            <div className="settings-security-card__left">
              <div className="settings-security-card__icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div className="settings-security-card__info">
                <span className="settings-security-card__label">Giriş E-postası</span>
                <strong className="settings-security-card__value">{maskEmail(email)}</strong>
                <span className="settings-security-card__hint">Panele giriş yapmak için kullanılan ana adres</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openModal('email')}
              className="settings-action-btn"
            >
              E-postayı Değiştir
            </button>
          </div>

          {/* Şifre Kartı */}
          <div className="settings-security-card">
            <div className="settings-security-card__left">
              <div className="settings-security-card__icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div className="settings-security-card__info">
                <span className="settings-security-card__label">Hesap Şifresi</span>
                <strong className="settings-security-card__value settings-security-card__value--dots">••••••••••••</strong>
                <span className="settings-security-card__hint">Son derece güvenli bir şifre kullanmanız önerilir</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openModal('password')}
              className="settings-action-btn"
            >
              Şifreyi Değiştir
            </button>
          </div>
        </div>
      </section>

      {/* Güvenlik İpuçları Kartı */}
      <div className="settings-security-tips">
        <div className="settings-security-tips__icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div className="settings-security-tips__content">
          <h4>Hesap Güvenliği Tavsiyeleri</h4>
          <p>
            Hesap güvenliğiniz için şifrenizi başka platformlarda kullanmadığınız benzersiz bir kombinasyon olarak belirleyin ve kimseyle paylaşmayın.
          </p>
        </div>
      </div>

      {modal && (
        <div
          className={`settings-modal-backdrop ${isClosing ? 'is-closing' : ''}`}
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
        >
          <section
            className={`settings-modal ${isClosing ? 'is-closing' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
          >
            <div className="settings-modal__header">
              <div>
                <span className="settings-eyebrow">Güvenlik Doğrulaması</span>
                <h3 id="settings-modal-title">{modal === 'email' ? 'E-posta Adresini Güncelle' : 'Hesap Şifresini Güncelle'}</h3>
              </div>
              <button type="button" onClick={() => closeModal()} className="settings-modal__close" aria-label="Kapat">×</button>
            </div>

            {/* İlerleme Adımları */}
            <div className="settings-modal__steps">
              <div className={`settings-modal__step-item ${step === 1 ? 'is-active' : 'is-completed'}`}>
                <span className="settings-modal__step-num">1</span>
                <span>Kimlik Doğrulama</span>
              </div>
              <span className="settings-modal__step-divider">→</span>
              <div className={`settings-modal__step-item ${step === 2 ? 'is-active' : ''}`}>
                <span className="settings-modal__step-num">2</span>
                <span>{modal === 'email' ? 'Yeni E-posta' : 'Yeni Şifre'}</span>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={verify} className="settings-modal__form">
                <p className="settings-modal__form-desc">
                  İşleme devam etmeden önce lütfen mevcut hesap bilgilerinizi doğrulayın.
                </p>
                <div className="settings-modal__field-group">
                  <label className="settings-field-label">
                    <span>Mevcut E-posta</span>
                    <input name="currentEmail" type="email" value={form.currentEmail} onChange={update} required className="field-input" />
                  </label>
                  <label className="settings-field-label">
                    <span>Mevcut Şifre</span>
                    <input name="currentPassword" type="password" value={form.currentPassword} onChange={update} required className="field-input" autoFocus />
                  </label>
                </div>
                {modalError && <div className="settings-modal__error">{modalError}</div>}
                <div className="settings-modal__actions">
                  <button type="button" onClick={() => closeModal()} className="settings-modal__cancel-btn">Vazgeç</button>
                  <button type="submit" disabled={saving} className="settings-primary-button">
                    {saving ? 'Doğrulanıyor...' : 'Doğrula ve İlerle'}
                  </button>
                </div>
              </form>
            ) : modal === 'email' ? (
              <form onSubmit={updateEmail} className="settings-modal__form">
                <p className="settings-modal__form-desc">
                  Doğrulama başarılı. Yeni e-posta adresinizi girin.
                </p>
                <div className="settings-modal__field-group">
                  <label className="settings-field-label">
                    <span>Yeni E-posta Adresi</span>
                    <input name="newEmail" type="email" value={form.newEmail} onChange={update} required className="field-input" autoFocus />
                  </label>
                </div>
                {modalError && <div className="settings-modal__error">{modalError}</div>}
                <div className="settings-modal__actions">
                  <button type="button" onClick={() => closeModal()} className="settings-modal__cancel-btn">Vazgeç</button>
                  <button type="submit" disabled={saving} className="settings-primary-button">
                    {saving ? 'Kaydediliyor...' : 'E-postayı Güncelle'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={updatePassword} className="settings-modal__form">
                <p className="settings-modal__form-desc">
                  Doğrulama başarılı. Yeni güçlü şifrenizi belirleyin.
                </p>
                <div className="settings-modal__field-group">
                  <label className="settings-field-label">
                    <span>Yeni Şifre</span>
                    <input name="newPassword" type="password" value={form.newPassword} onChange={update} required className="field-input" autoFocus />
                    <small className="settings-field-hint">En az 8 karakter, harf ve rakam içermelidir.</small>
                  </label>
                  <label className="settings-field-label">
                    <span>Yeni Şifre (Tekrar)</span>
                    <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required className="field-input" />
                  </label>
                </div>
                {modalError && <div className="settings-modal__error">{modalError}</div>}
                <div className="settings-modal__actions">
                  <button type="button" onClick={() => closeModal()} className="settings-modal__cancel-btn">Vazgeç</button>
                  <button type="submit" disabled={saving} className="settings-primary-button">
                    {saving ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default SettingsSecurityTab;
