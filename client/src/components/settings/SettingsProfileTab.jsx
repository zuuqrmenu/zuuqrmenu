import { useState } from 'react';
import { restaurantSettingsService } from '../../services/restaurantSettingsService';
import { authService } from '../../services/authService';
import { restaurantProfileService } from '../../services/restaurantProfileService';
import { useAuth } from '../../context/AuthContext';

const businessTypeOptions = [
  ['RESTAURANT', 'Restoran'],
  ['CAFE', 'Kafe'],
  ['BAR', 'Bar'],
  ['BAKERY', 'Fırın / Pastane'],
  ['FAST_FOOD', 'Fast Food'],
];

const socialPlatformOptions = [
  { value: 'instagram', label: 'Instagram', icon: '◎' },
  { value: 'facebook', label: 'Facebook', icon: 'f' },
  { value: 'tiktok', label: 'TikTok', icon: '♪' },
  { value: 'x', label: 'X', icon: 'X' },
  { value: 'youtube', label: 'YouTube', icon: '▶' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '✓' },
  { value: 'website', label: 'Website', icon: '↗' },
];

const getPlatformOption = (platform) => socialPlatformOptions.find((option) => option.value === platform) || socialPlatformOptions[0];

const getSocialValidationError = (entries = []) => {
  const seenPlatforms = new Set();
  for (const entry of entries) {
    if (!entry?.platform) return 'Her sosyal medya satırı için platform seçimi gerekli.';
    if (seenPlatforms.has(entry.platform)) return 'Aynı platformu iki kez ekleyemezsiniz.';
    seenPlatforms.add(entry.platform);
    if (!entry.url?.trim()) return 'Her sosyal medya satırı için URL gerekli.';
    try {
      const parsedUrl = new URL(entry.url.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return 'URL http veya https ile başlamalıdır.';
    } catch {
      return 'Geçerli bir URL girin.';
    }
  }
  return '';
};

const ImageField = ({ label, image, onUpload, onRemove, uploading }) => {
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };

  return (
    <div className="settings-image-field">
      <div className="settings-image-preview">{image ? <img src={image} alt={`${label} önizlemesi`} /> : <span>{label} ekle</span>}</div>
      <div className="settings-image-field__footer">
        <div><h3>{label}</h3><p>JPG, PNG veya WEBP · Maks. 5 MB</p></div>
        <div className="settings-image-field__actions">
          <label className="settings-secondary-button">{uploading ? 'Yükleniyor...' : 'Görsel Seç'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="sr-only" disabled={uploading} /></label>
          {image && <button type="button" onClick={onRemove} disabled={uploading} className="settings-danger-button settings-danger-button--small">Kaldır</button>}
        </div>
      </div>
    </div>
  );
};

const ColorField = ({ label, name, value, onChange }) => (
  <label className="settings-color-field"><span>{label}</span><span className="settings-color-field__control"><span className="settings-color-field__swatch" style={{ backgroundColor: value }}><input type="color" name={name} value={value} onChange={onChange} aria-label={`${label} seç`} /></span><input className="settings-color-field__value" name={name} value={value} onChange={onChange} maxLength="7" pattern="#[0-9A-Fa-f]{6}" aria-label={`${label} HEX değeri`} /></span></label>
);

const SettingsProfileTab = ({ settings, setSettings, profile, setProfile, account, setAccount, onNotice, onError }) => {
  const { checkAuth } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploading, setUploading] = useState('');
  const [editingSocialIndex, setEditingSocialIndex] = useState(null);

  const updateProfile = (event) => setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateAccount = (event) => setAccount((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateSetting = (event) => setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveAccount = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    onError('');
    try {
      const result = await authService.updateProfile({ name: account.name, username: account.username });
      setAccount((current) => ({ ...current, ...(result.user || {}) }));
      await checkAuth();
      onNotice('Hesap bilgileri kaydedildi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Hesap bilgileri kaydedilemedi.');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveBranding = async (event) => {
    event.preventDefault();
    const socialError = getSocialValidationError(settings.socialMedia || []);
    if (socialError) return onError(socialError);
    setSavingBranding(true);
    onError('');
    try {
      const [profileResult, brandingResult] = await Promise.all([
        restaurantProfileService.update({
          name: profile.name,
          businessType: profile.businessType,
          city: profile.city,
          address: profile.address,
          phone: profile.phone,
          email: profile.email,
        }),
        restaurantSettingsService.update({
          description: settings.description,
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          theme: settings.theme,
          socialMedia: (settings.socialMedia || []).filter((item) => item?.url?.trim()).map((item) => ({ platform: item.platform, url: item.url.trim() })),
        }),
      ]);
      setProfile((current) => ({ ...current, ...(profileResult.restaurant || {}) }));
      setSettings((current) => ({ ...current, ...(brandingResult.settings || {}) }));
      onNotice('Marka ayarları kaydedildi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Marka ayarları kaydedilemedi.');
    } finally {
      setSavingBranding(false);
    }
  };

  const upload = async (type, file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) return onError('Yalnızca JPG, PNG veya WEBP ve 5 MB altındaki görseller kabul edilir.');
    setUploading(type);
    onError('');
    try {
      const result = type === 'logo' ? await restaurantSettingsService.uploadLogo(file) : type === 'cover' ? await restaurantSettingsService.uploadCover(file) : await restaurantSettingsService.uploadStore(file);
      setSettings((current) => ({ ...current, ...(result.settings || {}) }));
      onNotice(`${type === 'logo' ? 'Logo' : type === 'cover' ? 'Kapak görseli' : 'Mağaza görseli'} güncellendi.`);
    } catch (error) {
      onError(error.response?.data?.error || 'Görsel yüklenemedi.');
    } finally {
      setUploading('');
    }
  };

  const remove = async (type) => {
    setUploading(type);
    onError('');
    try {
      const result = type === 'logo' ? await restaurantSettingsService.removeLogo() : type === 'cover' ? await restaurantSettingsService.removeCover() : await restaurantSettingsService.removeStore();
      setSettings((current) => ({ ...current, ...(result.settings || {}) }));
      onNotice('Görsel kaldırıldı.');
    } catch (error) {
      onError(error.response?.data?.error || 'Görsel kaldırılamadı.');
    } finally {
      setUploading('');
    }
  };

  const addSocialLink = () => {
    const used = new Set((settings.socialMedia || []).map((entry) => entry.platform).filter(Boolean));
    const platform = socialPlatformOptions.find((option) => !used.has(option.value))?.value || 'instagram';
    setSettings((current) => ({ ...current, socialMedia: [...(current.socialMedia || []), { platform, url: '' }] }));
    setEditingSocialIndex((settings.socialMedia || []).length);
  };

  const updateSocial = (index, field, value) => setSettings((current) => ({ ...current, socialMedia: (current.socialMedia || []).map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry) }));

  const saveSocial = async (index) => {
    const entries = settings.socialMedia || [];
    const duplicate = entries.some((item, entryIndex) => entryIndex !== index && item?.platform === entries[index]?.platform);
    const validationError = getSocialValidationError([entries[index]]);
    if (duplicate || validationError) return onError(duplicate ? 'Aynı platformu iki kez ekleyemezsiniz.' : validationError);
    try {
      const result = await restaurantSettingsService.update({ socialMedia: entries });
      setSettings((current) => ({ ...current, ...(result.settings || {}), socialMedia: result.settings?.socialMedia || entries }));
      setEditingSocialIndex(null);
      onNotice('Sosyal medya hesabı kaydedildi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Sosyal medya hesabı kaydedilemedi.');
    }
  };

  const removeSocial = async (index) => {
    const entries = (settings.socialMedia || []).filter((_, entryIndex) => entryIndex !== index);
    try {
      const result = await restaurantSettingsService.update({ socialMedia: entries });
      setSettings((current) => ({ ...current, ...(result.settings || {}), socialMedia: result.settings?.socialMedia || entries }));
      setEditingSocialIndex(null);
      onNotice('Sosyal medya hesabı silindi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Sosyal medya hesabı silinemedi.');
    }
  };

  return (
    <div className="settings-tab-content">
      <form onSubmit={saveBranding} className="settings-brand-section">
        <div className="settings-section-heading"><div><span className="settings-eyebrow">Profil</span><h3>Marka Kimliği</h3><p>Restoranınızın müşterilerinizle buluşan kimliğini tek bir akışta yönetin.</p></div><span className={`settings-status-pill settings-status-pill--${profile.status?.toLowerCase()}`}>{profile.status === 'ACTIVE' ? 'Aktif' : profile.status}</span></div>
        <div className="settings-image-grid">
          <ImageField label="Logo" image={settings.logo} uploading={uploading === 'logo'} onUpload={(file) => upload('logo', file)} onRemove={() => remove('logo')} />
          <ImageField label="Kapak Görseli" image={settings.coverImage} uploading={uploading === 'cover'} onUpload={(file) => upload('cover', file)} onRemove={() => remove('cover')} />
          <ImageField label="Mağaza Görselleri" image={settings.storeImage} uploading={uploading === 'store'} onUpload={(file) => upload('store', file)} onRemove={() => remove('store')} />
        </div>
        <div className="settings-subgroup"><div className="settings-subgroup__heading"><h4>Restoran bilgileri</h4><span>Marka Kimliği</span></div><div className="settings-form-grid"><label>Restoran Adı<input name="name" value={profile.name} onChange={updateProfile} required maxLength="120" className="field-input" /></label><label>İşletme Türü<select name="businessType" value={profile.businessType} onChange={updateProfile} className="field-input">{businessTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Şehir<input name="city" value={profile.city} onChange={updateProfile} className="field-input" /></label><label>Telefon<input name="phone" value={profile.phone} onChange={updateProfile} type="tel" className="field-input" /></label><label>Restoran E-posta Adresi<input name="email" value={profile.email} onChange={updateProfile} type="email" placeholder="info@restoran.com" className="field-input" /></label><label className="settings-form-grid__wide">Adres<textarea name="address" value={profile.address} onChange={updateProfile} rows="3" className="field-input resize-none" /></label></div></div>
        <div className="settings-subgroup"><div className="settings-subgroup__heading"><h4>Marka detayları</h4><span>Açıklama ve renkler</span></div><label className="settings-field-label">Açıklama<textarea name="description" value={settings.description || ''} onChange={updateSetting} maxLength="500" rows="4" className="field-input resize-none" /><small>{(settings.description || '').length}/500</small></label><div className="settings-form-grid settings-form-grid--colors"><ColorField label="Primary Color" name="primaryColor" value={settings.primaryColor || '#1F2937'} onChange={updateSetting} /><ColorField label="Secondary Color" name="secondaryColor" value={settings.secondaryColor || '#FFFFFF'} onChange={updateSetting} /></div></div>
        <div className="settings-form-actions"><button type="submit" disabled={savingBranding} className="settings-primary-button">{savingBranding ? 'Kaydediliyor...' : 'Marka Ayarlarını Kaydet'}</button></div>
      </form>

      <section className="settings-brand-section"><div className="settings-section-heading"><div><span className="settings-eyebrow">Profil</span><h3>Sosyal Medyalar</h3><p>Sosyal hesaplarınızı yalnızca bu alandan yönetin.</p></div><button type="button" onClick={addSocialLink} className="settings-primary-button settings-primary-button--compact">+ Hesap Ekle</button></div>{(settings.socialMedia || []).length === 0 ? <div className="settings-empty-state">Henüz sosyal medya hesabı eklenmedi.</div> : <div className="settings-social-list">{settings.socialMedia.map((item, index) => { const option = getPlatformOption(item.platform); const isEditing = editingSocialIndex === index; return <div className="settings-social-row" key={`${item.platform}-${index}`}>{isEditing ? <><label>Platform<select value={item.platform} onChange={(event) => updateSocial(index, 'platform', event.target.value)} className="field-input">{socialPlatformOptions.map((platform) => <option key={platform.value} value={platform.value}>{platform.label}</option>)}</select></label><label className="settings-social-row__url">URL<input type="url" value={item.url || ''} onChange={(event) => updateSocial(index, 'url', event.target.value)} className="field-input" /></label><button type="button" onClick={() => saveSocial(index)} className="settings-secondary-button">Kaydet</button><button type="button" onClick={() => removeSocial(index)} className="settings-danger-button settings-danger-button--small">Sil</button></> : <><span className="settings-social-row__icon">{option.icon}</span><div><strong>{option.label}</strong><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a></div><button type="button" onClick={() => setEditingSocialIndex(index)} className="settings-icon-button" aria-label={`${option.label} düzenle`}>Düzenle</button><button type="button" onClick={() => removeSocial(index)} className="settings-icon-button settings-icon-button--danger" aria-label={`${option.label} sil`}>Sil</button></>}</div>; })}</div>}</section>

      <form onSubmit={saveAccount} className="settings-brand-section settings-account-section"><div className="settings-section-heading"><div><span className="settings-eyebrow">Profil</span><h3>Hesap Bilgileri</h3><p>Restoran sahibinin profil ve hesap bilgileri.</p></div></div><div className="settings-form-grid"><label>Ad Soyad<input name="name" value={account.name} onChange={updateAccount} required className="field-input" /></label><label>Kullanıcı Adı<input name="username" value={account.username || ''} onChange={updateAccount} placeholder="ornek.kullanici" className="field-input" readOnly={Boolean(account.username)} /><small className="settings-field-hint">{account.username ? 'Menü adresiniz sabittir.' : 'Menü adresinizi oluşturun.'}</small></label><label className="settings-form-grid__wide">Kullanıcı E-posta Adresi<input value={account.email} readOnly className="field-input settings-readonly-field" /><small className="settings-field-hint">Hesap e-posta adresi Şifre ve Güvenlik bölümünden değiştirilir.</small></label></div><div className="settings-form-actions"><button type="submit" disabled={savingProfile} className="settings-primary-button">{savingProfile ? 'Kaydediliyor...' : 'Hesap Bilgilerini Kaydet'}</button></div></form>
    </div>
  );
};

export default SettingsProfileTab;
