import { useState } from 'react';
import { normalizeUsername } from '../utils/username';
import { getPublicMenuAbsoluteUrl } from '../utils/domainHelpers';

const MenuOnboardingModal = ({ restaurantName, onCreate }) => {
  const [username, setUsername] = useState(() => normalizeUsername(restaurantName));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const previewUrl = getPublicMenuAbsoluteUrl(username || 'kullanici-adi');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalized = normalizeUsername(username);
    if (!/^[a-z0-9-]{3,40}$/.test(normalized)) {
      setError('Kullanıcı adı 3-40 karakter olmalı ve yalnızca harf, rakam veya tire içermelidir.');
      return;
    }
    setUsername(normalized);
    setError('');
    setSaving(true);
    const result = await onCreate(normalized);
    if (!result.success) setError(result.error);
    setSaving(false);
  };

  return (
    <div className="menu-onboarding-backdrop" role="presentation">
      <section className="menu-onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="menu-onboarding-title">
        <p className="settings-eyebrow">İlk adım</p>
        <h2 id="menu-onboarding-title">Menünüzü oluşturalım</h2>
        <p className="menu-onboarding-restaurant">{restaurantName}</p>
        <p className="menu-onboarding-description">Menünüzü yayınlamak için önce menü adresinizi oluşturalım.</p>
        <form onSubmit={handleSubmit}>
          <label className="menu-onboarding-label" htmlFor="menu-username">Kullanıcı adı</label>
          <input id="menu-username" className="field-input menu-onboarding-input" value={username} onChange={(event) => setUsername(normalizeUsername(event.target.value))} autoFocus autoComplete="off" aria-invalid={Boolean(error)} />
          <p className="menu-onboarding-preview">{previewUrl}</p>
          {error && <p className="menu-onboarding-error" role="alert">{error}</p>}
          <p className="menu-onboarding-help">Menünüzü oluşturduktan sonra marka bilgileriniz ve detaylı özelleştirmeler için Ayarlar → Profil bölümünü ziyaret edebilirsiniz.</p>
          <button type="submit" className="menu-onboarding-submit" disabled={saving}>{saving ? 'Menü oluşturuluyor...' : 'Menüyü Oluştur'}</button>
        </form>
      </section>
    </div>
  );
};

export default MenuOnboardingModal;
