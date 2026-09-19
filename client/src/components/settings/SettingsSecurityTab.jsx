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
      setModalError('E-posta veya şifre hatalı.');
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
      <section className="settings-brand-section">
        <div className="settings-section-heading"><div><span className="settings-eyebrow">Güvenlik</span><h3>Şifre ve Güvenlik</h3><p>Hesap e-posta adresinizi ve şifrenizi güvenli bir doğrulama adımıyla yönetin.</p></div></div>
        <div className="settings-security-list">
          <div className="settings-security-row"><div><span>Hesap E-posta Adresi</span><strong>{maskEmail(email)}</strong><small>Giriş yapmak için kullanılır.</small></div><button type="button" onClick={() => openModal('email')} className="settings-secondary-button">Düzenle</button></div>
          <div className="settings-security-row"><div><span>Şifre</span><strong aria-label="Şifre gizli">••••••••</strong><small>Şifrenizi asla başka biriyle paylaşmayın.</small></div><button type="button" onClick={() => openModal('password')} className="settings-secondary-button">Düzenle</button></div>
        </div>
      </section>

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
                <span className="settings-eyebrow">Güvenlik doğrulaması</span>
                <h3 id="settings-modal-title">{modal === 'email' ? 'E-posta adresini düzenle' : 'Şifreyi düzenle'}</h3>
              </div>
              <button type="button" onClick={() => closeModal()} className="settings-modal__close" aria-label="Kapat">×</button>
            </div>
            {step === 1 ? (
              <form onSubmit={verify} className="settings-modal__form">
                <p>Devam etmek için mevcut hesap bilgilerinizi doğrulayın.</p>
                <label>Mevcut E-posta<input name="currentEmail" type="email" value={form.currentEmail} onChange={update} required className="field-input" /></label>
                <label>Mevcut Şifre<input name="currentPassword" type="password" value={form.currentPassword} onChange={update} required className="field-input" /></label>
                {modalError && <div className="settings-modal__error">{modalError}</div>}
                <button type="submit" disabled={saving} className="settings-primary-button">{saving ? 'Doğrulanıyor...' : 'Devam Et'}</button>
              </form>
            ) : modal === 'email' ? (
              <form onSubmit={updateEmail} className="settings-modal__form">
                <p>Doğrulama başarılı. Yeni hesap e-posta adresinizi girin.</p>
                <label>Yeni E-posta<input name="newEmail" type="email" value={form.newEmail} onChange={update} required className="field-input" autoFocus /></label>
                {modalError && <div className="settings-modal__error">{modalError}</div>}
                <button type="submit" disabled={saving} className="settings-primary-button">{saving ? 'Güncelleniyor...' : 'E-posta Adresini Güncelle'}</button>
              </form>
            ) : (
              <form onSubmit={updatePassword} className="settings-modal__form">
                <p>Doğrulama başarılı. Yeni şifrenizi belirleyin.</p>
                <label>Yeni Şifre<input name="newPassword" type="password" value={form.newPassword} onChange={update} required minLength="8" className="field-input" autoFocus /></label>
                <label>Yeni Şifre Tekrar<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required minLength="8" className="field-input" /></label>
                <small className="settings-field-hint">En az 8 karakter, bir harf ve bir rakam.</small>
                {modalError && <div className="settings-modal__error">{modalError}</div>}
                <button type="submit" disabled={saving} className="settings-primary-button">{saving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default SettingsSecurityTab;
