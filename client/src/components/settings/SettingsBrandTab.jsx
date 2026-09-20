import { useState } from 'react';
import { restaurantSettingsService } from '../../services/restaurantSettingsService';
import { restaurantProfileService } from '../../services/restaurantProfileService';
import { compressImageToWebp } from '../../utils/imageOptimizer';

const businessTypeOptions = [
  ['RESTAURANT', 'Restoran'],
  ['CAFE', 'Kafe'],
  ['BAR', 'Bar'],
  ['BAKERY', 'Fırın / Pastane'],
  ['FAST_FOOD', 'Fast Food'],
];

const socialPlatformOptions = [
  {
    value: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    value: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    color: '#00F2FE',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.72 1.17-.06 2.22-.72 2.74-1.75.25-.47.36-.99.36-1.52.02-3.78.01-7.56.01-11.34z" />
      </svg>
    ),
  },
  {
    value: 'x',
    label: 'X (Twitter)',
    color: '#E7E9EA',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    value: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
    ),
  },
  {
    value: 'website',
    label: 'Website',
    color: '#10B981',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const palettePresets = ['#DEFF36', '#10B981', '#3B82F6', '#6366F1', '#EC4899', '#F59E0B', '#EF4444', '#0F172A', '#FFFFFF'];

const getPlatformOption = (platform) => socialPlatformOptions.find((opt) => opt.value === platform) || socialPlatformOptions[0];

const getSocialValidationError = (entries = []) => {
  const validEntries = entries.filter((item) => item?.url?.trim());
  const seenPlatforms = new Set();
  for (const entry of validEntries) {
    if (!entry?.platform) return 'Her sosyal medya satırı için platform seçimi gereklidir.';
    if (seenPlatforms.has(entry.platform)) return 'Aynı platformu birden fazla kez ekleyemezsiniz.';
    seenPlatforms.add(entry.platform);
    try {
      const parsedUrl = new URL(entry.url.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) return 'URL http:// veya https:// ile başlamalıdır.';
    } catch {
      return 'Lütfen geçerli bir internet adresi (URL) girin.';
    }
  }
  return '';
};

const ImageUploadCard = ({ label, ratioHint, image, onUpload, onRemove, uploading, aspect = 'square' }) => {
  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
    event.target.value = '';
  };

  return (
    <div className={`settings-upload-card settings-upload-card--${aspect}`}>
      <div className="settings-upload-card__preview">
        {image ? (
          <>
            <img src={image} alt={`${label} önizleme`} />
            <div className="settings-upload-card__overlay">
              <label className="settings-upload-card__action-btn">
                <span>Değiştir</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="sr-only" disabled={uploading} />
              </label>
              <button type="button" onClick={onRemove} disabled={uploading} className="settings-upload-card__action-btn settings-upload-card__action-btn--danger">
                Kaldır
              </button>
            </div>
          </>
        ) : (
          <label className="settings-upload-card__empty">
            <div className="settings-upload-card__empty-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span className="settings-upload-card__empty-title">{uploading ? 'Yükleniyor...' : `${label} Ekle`}</span>
            <span className="settings-upload-card__empty-hint">{ratioHint}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="sr-only" disabled={uploading} />
          </label>
        )}
      </div>
      <div className="settings-upload-card__info">
        <div className="settings-upload-card__title-wrap">
          <h4>{label}</h4>
          <span className="settings-upload-card__badge">{aspect === 'cover' ? '16:9 Banner' : aspect === 'store' ? '4:3 Vitrin' : '1:1 Kare'}</span>
        </div>
        <p className="settings-upload-card__hint">JPG, PNG veya WEBP · Maksimum 5 MB</p>
      </div>
    </div>
  );
};

const ColorPickerBox = ({ label, name, value, onChange }) => {
  return (
    <div className="settings-color-box">
      <div className="settings-color-box__header">
        <span className="settings-color-box__label">{label}</span>
        <span className="settings-color-box__value">{value}</span>
      </div>
      <div className="settings-color-box__control">
        <div className="settings-color-box__swatch" style={{ backgroundColor: value }}>
          <input
            type="color"
            name={name}
            value={value}
            onChange={onChange}
            aria-label={`${label} seç`}
          />
        </div>
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          maxLength="7"
          className="field-input settings-color-box__input"
          aria-label={`${label} hex değeri`}
        />
      </div>
      <div className="settings-color-box__presets">
        {palettePresets.map((preset) => (
          <button
            type="button"
            key={preset}
            onClick={() => onChange({ target: { name, value: preset } })}
            className={`settings-color-box__preset-dot ${value?.toUpperCase() === preset ? 'is-selected' : ''}`}
            style={{ backgroundColor: preset }}
            title={preset}
            aria-label={`${preset} rengini seç`}
          />
        ))}
      </div>
    </div>
  );
};

const SettingsBrandTab = ({ settings, setSettings, profile, setProfile, onNotice, onError }) => {
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploading, setUploading] = useState('');
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: 'instagram', url: '' });
  const [editingSocialIndex, setEditingSocialIndex] = useState(null);
  const [editingSocialData, setEditingSocialData] = useState({ platform: 'instagram', url: '' });
  const [savingSocial, setSavingSocial] = useState(false);

  // Sadece geçerli URL'ye sahip sosyal medya kayıtları listelenir
  const socialList = (settings.socialMedia || []).filter((item) => Boolean(item?.url?.trim()));

  const updateProfile = (event) => setProfile((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateSetting = (event) => setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveBranding = async (event) => {
    event.preventDefault();
    const socialError = getSocialValidationError(socialList);
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
          socialMedia: socialList.map((item) => ({ platform: item.platform, url: item.url.trim() })),
        }),
      ]);
      setProfile((current) => ({ ...current, ...(profileResult.restaurant || {}) }));
      setSettings((current) => ({
        ...current,
        ...(brandingResult.settings || {}),
        socialMedia: brandingResult.settings?.socialMedia || socialList,
      }));
      onNotice('Marka ve restoran ayarları başarıyla kaydedildi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Marka ayarları kaydedilemedi.');
    } finally {
      setSavingBranding(false);
    }
  };

  const upload = async (type, file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
      return onError('Yalnızca JPG, PNG veya WEBP ve 15 MB altındaki görseller kabul edilir.');
    }
    setUploading(type);
    onError('');
    try {
      let fileToUpload = file;
      try {
        const { file: webpFile } = await compressImageToWebp(file, {
          maxDimension: type === 'logo' ? 800 : 1600,
          quality: 0.82,
        });
        fileToUpload = webpFile;
      } catch (compErr) {
        console.warn('WebP compression failed for branding, using original:', compErr);
      }

      const result = type === 'logo'
        ? await restaurantSettingsService.uploadLogo(fileToUpload)
        : type === 'cover'
        ? await restaurantSettingsService.uploadCover(fileToUpload)
        : await restaurantSettingsService.uploadStore(fileToUpload);
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
      const result = type === 'logo'
        ? await restaurantSettingsService.removeLogo()
        : type === 'cover'
        ? await restaurantSettingsService.removeCover()
        : await restaurantSettingsService.removeStore();
      setSettings((current) => ({ ...current, ...(result.settings || {}) }));
      onNotice('Görsel kaldırıldı.');
    } catch (error) {
      onError(error.response?.data?.error || 'Görsel kaldırılamadı.');
    } finally {
      setUploading('');
    }
  };

  const startAddingSocial = () => {
    const used = new Set(socialList.map((entry) => entry.platform).filter(Boolean));
    const nextPlatform = socialPlatformOptions.find((option) => !used.has(option.value))?.value || 'instagram';
    setNewSocial({ platform: nextPlatform, url: '' });
    setIsAddingSocial(true);
    setEditingSocialIndex(null);
    onError('');
  };

  const cancelAddingSocial = () => {
    setIsAddingSocial(false);
    setNewSocial({ platform: 'instagram', url: '' });
    onError('');
  };

  const saveNewSocial = async () => {
    const url = newSocial.url?.trim() || '';
    if (!url) {
      return onError('Lütfen sosyal medya hesap URL adresini girin.');
    }
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return onError('URL http:// veya https:// ile başlamalıdır.');
      }
    } catch {
      return onError('Lütfen geçerli bir internet adresi (URL) girin (Örn: https://instagram.com/restoraniniz).');
    }

    if (socialList.some((item) => item.platform === newSocial.platform)) {
      return onError('Bu sosyal medya platformu zaten eklenmiş.');
    }

    setSavingSocial(true);
    onError('');
    try {
      const updatedList = [...socialList, { platform: newSocial.platform, url }];
      const result = await restaurantSettingsService.update({ socialMedia: updatedList });
      setSettings((current) => ({
        ...current,
        ...(result.settings || {}),
        socialMedia: result.settings?.socialMedia || updatedList,
      }));
      setIsAddingSocial(false);
      setNewSocial({ platform: 'instagram', url: '' });
      onNotice('Sosyal medya hesabı başarıyla eklendi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Sosyal medya hesabı eklenemedi.');
    } finally {
      setSavingSocial(false);
    }
  };

  const startEditingSocial = (index) => {
    const item = socialList[index];
    if (!item) return;
    setIsAddingSocial(false);
    setEditingSocialIndex(index);
    setEditingSocialData({ platform: item.platform, url: item.url || '' });
    onError('');
  };

  const cancelEditingSocial = () => {
    setEditingSocialIndex(null);
    onError('');
  };

  const saveEditingSocial = async (index) => {
    const url = editingSocialData.url?.trim() || '';
    if (!url) {
      return onError('Lütfen sosyal medya hesap URL adresini girin.');
    }
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return onError('URL http:// veya https:// ile başlamalıdır.');
      }
    } catch {
      return onError('Lütfen geçerli bir internet adresi (URL) girin (Örn: https://instagram.com/restoraniniz).');
    }

    const duplicate = socialList.some((item, i) => i !== index && item.platform === editingSocialData.platform);
    if (duplicate) {
      return onError('Bu platform zaten başka bir hesapta kullanılıyor.');
    }

    setSavingSocial(true);
    onError('');
    try {
      const updatedList = socialList.map((item, i) =>
        i === index ? { platform: editingSocialData.platform, url } : item
      );
      const result = await restaurantSettingsService.update({ socialMedia: updatedList });
      setSettings((current) => ({
        ...current,
        ...(result.settings || {}),
        socialMedia: result.settings?.socialMedia || updatedList,
      }));
      setEditingSocialIndex(null);
      onNotice('Sosyal medya hesabı güncellendi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Sosyal medya hesabı kaydedilemedi.');
    } finally {
      setSavingSocial(false);
    }
  };

  const removeSocial = async (index) => {
    const updatedList = socialList.filter((_, i) => i !== index);
    setSavingSocial(true);
    onError('');
    try {
      const result = await restaurantSettingsService.update({ socialMedia: updatedList });
      setSettings((current) => ({
        ...current,
        ...(result.settings || {}),
        socialMedia: result.settings?.socialMedia || updatedList,
      }));
      setEditingSocialIndex(null);
      setIsAddingSocial(false);
      onNotice('Sosyal medya hesabı silindi.');
    } catch (error) {
      onError(error.response?.data?.error || 'Sosyal medya hesabı silinemedi.');
    } finally {
      setSavingSocial(false);
    }
  };

  return (
    <div className="settings-tab-content">
      {/* 1. Marka ve Restoran Bilgileri Formu */}
      <form onSubmit={saveBranding} className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Marka Kimliği</span>
            <h3 className="settings-card__title">Restoran ve Marka Bilgileri</h3>
            <p className="settings-card__desc">
              Menünüzde ve QR sayfalarınızda müşterilerinize gösterilen marka kimliğini yönetin.
            </p>
          </div>
          <span className={`settings-status-badge settings-status-badge--${profile.status?.toLowerCase()}`}>
            ● {profile.status === 'ACTIVE' ? 'İşletme Aktif' : profile.status}
          </span>
        </div>

        {/* Görsel Yükleme Alanları */}
        <div className="settings-uploads-section">
          <h4 className="settings-section-subhead">Marka Görselleri</h4>
          <div className="settings-uploads-grid">
            <ImageUploadCard
              label="Logo"
              ratioHint="1:1 Kare Tavsiye Edilir"
              aspect="logo"
              image={settings.logo}
              uploading={uploading === 'logo'}
              onUpload={(file) => upload('logo', file)}
              onRemove={() => remove('logo')}
            />
            <ImageUploadCard
              label="Kapak Görseli"
              ratioHint="16:9 Geniş Banner"
              aspect="cover"
              image={settings.coverImage}
              uploading={uploading === 'cover'}
              onUpload={(file) => upload('cover', file)}
              onRemove={() => remove('cover')}
            />
            <ImageUploadCard
              label="Mağaza Vitrin Görseli"
              ratioHint="4:3 Vitrin / Mekan"
              aspect="store"
              image={settings.storeImage}
              uploading={uploading === 'store'}
              onUpload={(file) => upload('store', file)}
              onRemove={() => remove('store')}
            />
          </div>
        </div>

        {/* Temel Bilgiler Formu */}
        <div className="settings-form-section">
          <h4 className="settings-section-subhead">İşletme Bilgileri</h4>
          <div className="settings-form-grid">
            <label className="settings-field-label">
              <span>Restoran Adı *</span>
              <input
                name="name"
                value={profile.name}
                onChange={updateProfile}
                required
                maxLength="120"
                placeholder="Örn: Lezzet Durağı"
                className="field-input"
              />
            </label>

            <label className="settings-field-label">
              <span>İşletme Türü</span>
              <select
                name="businessType"
                value={profile.businessType}
                onChange={updateProfile}
                className="field-input"
              >
                {businessTypeOptions.map(([val, text]) => (
                  <option key={val} value={val}>{text}</option>
                ))}
              </select>
            </label>

            <label className="settings-field-label">
              <span>Şehir</span>
              <input
                name="city"
                value={profile.city || ''}
                onChange={updateProfile}
                placeholder="Örn: İstanbul"
                className="field-input"
              />
            </label>

            <label className="settings-field-label">
              <span>Telefon Numarası</span>
              <input
                name="phone"
                value={profile.phone || ''}
                onChange={updateProfile}
                type="tel"
                placeholder="05XX XXX XX XX"
                className="field-input"
              />
            </label>

            <label className="settings-field-label">
              <span>Restoran İletişim E-postası</span>
              <input
                name="email"
                value={profile.email || ''}
                onChange={updateProfile}
                type="email"
                placeholder="info@restoran.com"
                className="field-input"
              />
            </label>

            <label className="settings-field-label settings-field-label--full">
              <span>Fiziksel Adres</span>
              <textarea
                name="address"
                value={profile.address || ''}
                onChange={updateProfile}
                rows="2"
                placeholder="Restoranınızın açık adresi..."
                className="field-input resize-none"
              />
            </label>
          </div>
        </div>

        {/* Marka Açıklaması ve Renkler */}
        <div className="settings-form-section">
          <h4 className="settings-section-subhead">Marka Açıklaması ve Renk Paleti</h4>
          <div className="space-y-4">
            <label className="settings-field-label">
              <div className="flex items-center justify-between">
                <span>Hakkımızda / Menü Açıklaması</span>
                <small className="text-slate-400">{(settings.description || '').length}/500</small>
              </div>
              <textarea
                name="description"
                value={settings.description || ''}
                onChange={updateSetting}
                maxLength="500"
                rows="3"
                placeholder="Müşterilerinize mekanınızı ve lezzetlerinizi anlatan kısa bir açıklama..."
                className="field-input resize-none"
              />
            </label>

            <div className="settings-colors-grid">
              <ColorPickerBox
                label="Ana Renk (Primary)"
                name="primaryColor"
                value={settings.primaryColor || '#1F2937'}
                onChange={updateSetting}
              />
              <ColorPickerBox
                label="İkincil Renk (Secondary)"
                name="secondaryColor"
                value={settings.secondaryColor || '#FFFFFF'}
                onChange={updateSetting}
              />
            </div>
          </div>
        </div>

        <div className="settings-form-footer">
          <button
            type="submit"
            disabled={savingBranding}
            className="settings-primary-button"
          >
            {savingBranding ? 'Kaydediliyor...' : 'Marka Bilgilerini Kaydet'}
          </button>
        </div>
      </form>

      {/* 2. Sosyal Medya Hesapları Kartı */}
      <section className="settings-card">
        <div className="settings-card__header">
          <div>
            <span className="settings-eyebrow">Sosyal Medya</span>
            <h3 className="settings-card__title">Sosyal Ağ Bağlantıları</h3>
            <p className="settings-card__desc">
              Menünüzde ve mağaza detaylarınızda yer alacak resmi sosyal medya bağlantılarınızı ekleyin.
            </p>
          </div>
          {!isAddingSocial && (
            <button
              type="button"
              onClick={startAddingSocial}
              className="settings-action-btn settings-action-btn--primary"
            >
              + Yeni Hesap Ekle
            </button>
          )}
        </div>

        {/* Yeni Hesap Ekleme Formu */}
        {isAddingSocial && (
          <div className="settings-social-card settings-social-card--editing" style={{ marginBottom: '1rem' }}>
            <div className="settings-social-card__edit-form">
              <label className="settings-field-label">
                <span>Platform</span>
                <select
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial((prev) => ({ ...prev, platform: e.target.value }))}
                  className="field-input"
                >
                  {socialPlatformOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </label>
              <label className="settings-field-label settings-social-card__url-field">
                <span>Profil / Hesap URL'si</span>
                <input
                  type="url"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://instagram.com/restoraniniz"
                  className="field-input"
                  autoFocus
                />
              </label>
            </div>
            <div className="settings-social-card__actions">
              <button
                type="button"
                disabled={savingSocial}
                onClick={saveNewSocial}
                className="settings-action-btn settings-action-btn--primary"
              >
                {savingSocial ? 'Kaydediliyor...' : 'Hesabı Ekle'}
              </button>
              <button
                type="button"
                disabled={savingSocial}
                onClick={cancelAddingSocial}
                className="settings-action-btn"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {socialList.length === 0 && !isAddingSocial ? (
          <div className="settings-empty-state">
            <div className="settings-empty-state__icon">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <h4>Henüz sosyal medya hesabı eklenmedi</h4>
            <p>Instagram, TikTok, WhatsApp veya web sitenizi ekleyerek müşterilerinizin size kolayca ulaşmasını sağlayın.</p>
            <button type="button" onClick={startAddingSocial} className="settings-action-btn">
              İlk Hesabı Ekle
            </button>
          </div>
        ) : (
          <div className="settings-social-grid">
            {socialList.map((item, index) => {
              const option = getPlatformOption(item.platform);
              const isEditing = editingSocialIndex === index;

              if (isEditing) {
                return (
                  <div className="settings-social-card settings-social-card--editing" key={`social-${index}`}>
                    <div className="settings-social-card__edit-form">
                      <label className="settings-field-label">
                        <span>Platform</span>
                        <select
                          value={editingSocialData.platform}
                          onChange={(e) => setEditingSocialData((prev) => ({ ...prev, platform: e.target.value }))}
                          className="field-input"
                        >
                          {socialPlatformOptions.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="settings-field-label settings-social-card__url-field">
                        <span>Profil / Hesap URL'si</span>
                        <input
                          type="url"
                          value={editingSocialData.url}
                          onChange={(e) => setEditingSocialData((prev) => ({ ...prev, url: e.target.value }))}
                          placeholder="https://instagram.com/restoraniniz"
                          className="field-input"
                          autoFocus
                        />
                      </label>
                    </div>
                    <div className="settings-social-card__actions">
                      <button
                        type="button"
                        disabled={savingSocial}
                        onClick={() => saveEditingSocial(index)}
                        className="settings-action-btn settings-action-btn--primary"
                      >
                        {savingSocial ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      <button
                        type="button"
                        disabled={savingSocial}
                        onClick={cancelEditingSocial}
                        className="settings-action-btn"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        disabled={savingSocial}
                        onClick={() => removeSocial(index)}
                        className="settings-action-btn settings-action-btn--danger"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="settings-social-card" key={`social-${item.platform}-${index}`}>
                  <div className="settings-social-card__main">
                    <div className="settings-social-card__icon" style={{ color: option.color }}>
                      {option.icon}
                    </div>
                    <div className="settings-social-card__text">
                      <strong>{option.label}</strong>
                      <a href={item.url} target="_blank" rel="noreferrer" title={item.url}>
                        {item.url}
                      </a>
                    </div>
                  </div>
                  <div className="settings-social-card__actions">
                    <button
                      type="button"
                      onClick={() => startEditingSocial(index)}
                      className="settings-icon-btn"
                      aria-label={`${option.label} düzenle`}
                      title="Düzenle"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSocial(index)}
                      className="settings-icon-btn settings-icon-btn--danger"
                      aria-label={`${option.label} sil`}
                      title="Sil"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SettingsBrandTab;
