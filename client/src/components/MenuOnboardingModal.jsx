import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { normalizeUsername } from '../utils/username';
import { getPublicMenuAbsoluteUrl } from '../utils/domainHelpers';
import './CategorySuggester.css';

const MenuOnboardingModal = ({ restaurantName, onCreate }) => {
  const [username, setUsername] = useState(() => normalizeUsername(restaurantName));
  const [siteToast, setSiteToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSiteToast({ message, type, id: Date.now() });
    toastTimeoutRef.current = setTimeout(() => {
      setSiteToast(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const previewUrl = getPublicMenuAbsoluteUrl(username || 'kullanici-adi');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = normalizeUsername(username);
    if (!/^[a-z0-9-]{3,40}$/.test(normalized)) {
      showToast('Kullanıcı adı 3-40 karakter olmalı ve yalnızca harf, rakam veya tire içermelidir.', 'error');
      return;
    }
    setUsername(normalized);
    setSaving(true);
    const result = await onCreate(normalized);
    if (!result.success) showToast(result.error, 'error');
    setSaving(false);
  };

  return (
    <>
      {siteToast && typeof document !== 'undefined' && createPortal(
        <div
          key={siteToast.id}
          className={`site-global-toast site-global-toast--${siteToast.type}`}
          role="alert"
        >
          <span>{siteToast.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{siteToast.message}</span>
        </div>,
        document.body
      )}
      <div className="menu-onboarding-backdrop" role="presentation">
        <section className="menu-onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="menu-onboarding-title">
          <p className="settings-eyebrow">İlk adım</p>
          <h2 id="menu-onboarding-title">Menünüzü oluşturalım</h2>
          <p className="menu-onboarding-restaurant">{restaurantName}</p>
          <p className="menu-onboarding-description">Menünüzü yayınlamak için önce menü adresinizi oluşturalım.</p>
          <form onSubmit={handleSubmit}>
            <label className="menu-onboarding-label" htmlFor="menu-username">Kullanıcı adı</label>
            <input id="menu-username" className="field-input menu-onboarding-input" value={username} onChange={(event) => setUsername(normalizeUsername(event.target.value))} autoFocus autoComplete="off" />
            <p className="menu-onboarding-preview">{previewUrl}</p>
            <p className="menu-onboarding-help">Menünüzü oluşturduktan sonra marka bilgileriniz ve detaylı özelleştirmeler için Ayarlar → Profil bölümünü ziyaret edebilirsiniz.</p>
            <button type="submit" className="menu-onboarding-submit" disabled={saving}>{saving ? 'Menü oluşturuluyor...' : 'Menüyü Oluştur'}</button>
          </form>
        </section>
      </div>
    </>
  );
};

export default MenuOnboardingModal;

