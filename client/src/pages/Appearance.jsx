import { useEffect, useState } from 'react';
import RestaurantLayout from '../components/RestaurantLayout';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { getPublicMenuTheme, publicMenuThemes } from '../utils/publicMenuTheme';
import DashboardSkeleton from '../components/DashboardSkeleton';

const defaults = { primaryColor: '#1F2937', secondaryColor: '#FFFFFF', theme: 'MINIMAL' };
const themeLabels = { MINIMAL: 'Minimal', ELEGANT: 'Elegant', WARM: 'Warm', MODERN: 'Modern', DARK: 'Dark', CLASSIC: 'Classic' };
const fonts = ['Inter', 'Poppins', 'Manrope', 'Playfair Display'];

const Appearance = () => {
  const [form, setForm] = useState(defaults);
  const [font, setFont] = useState('Inter');
  const [showImages, setShowImages] = useState(true);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [showPrices, setShowPrices] = useState(true);
  const [emphasizeFeatured, setEmphasizeFeatured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    restaurantSettingsService.get()
      .then((data) => setForm({ ...defaults, ...(data?.settings || {}) }))
      .catch((err) => setError(err.response?.data?.error || 'Görünüm ayarları yüklenemedi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    setNoticeVisible(true);
    const fadeTimer = window.setTimeout(() => setNoticeVisible(false), 3000);
    const clearTimer = window.setTimeout(() => setNotice(''), 3300);
    return () => { window.clearTimeout(fadeTimer); window.clearTimeout(clearTimer); };
  }, [notice]);

  const reset = () => {
    setForm(defaults);
    setFont('Inter');
    setShowImages(true);
    setShowDescriptions(true);
    setShowPrices(true);
    setEmphasizeFeatured(true);
    setError('');
    setNotice('Önizleme varsayılanlara döndürüldü.');
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await restaurantSettingsService.update({ theme: form.theme, primaryColor: form.primaryColor, secondaryColor: form.secondaryColor });
      setNotice('Görünüm ayarları kaydedildi.');
    } catch (err) {
      setError(err.response?.data?.error || 'Görünüm ayarları kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const theme = getPublicMenuTheme(form.theme);
  const previewStyle = {
    '--preview-background': theme.background,
    '--preview-surface': theme.surface,
    '--preview-text': theme.text,
    '--preview-muted': theme.muted,
    '--preview-border': theme.border,
    '--preview-primary': form.primaryColor,
    '--preview-secondary': form.secondaryColor,
    '--preview-font': font === 'Playfair Display' ? 'Georgia, serif' : `${font}, Inter, sans-serif`,
  };

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8">
        <header>
          <p className="text-sm font-medium text-emerald-600">Görünüm</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Menünüzün görünümünü özelleştirin</h2>
          <p className="mt-2 text-sm text-slate-500">Değişiklikleri kaydetmeden önce canlı önizlemede deneyin.</p>
        </header>

        {notice && <div className={`settings-status settings-status--success ${noticeVisible ? 'is-visible' : 'is-hiding'}`} role="status">{notice}</div>}
        {error && <div className="settings-status settings-status--error" role="alert">{error}</div>}

        {loading ? <DashboardSkeleton variant="panel" /> : (
          <form onSubmit={save} className="appearance-layout">
            <div className="appearance-controls space-y-5">
              <section className="appearance-panel">
                <div className="appearance-panel__heading"><div><h3>Tema</h3><p>Menünüzün temel atmosferini seçin.</p></div></div>
                <div className="theme-card-grid">
                  {Object.entries(publicMenuThemes).map(([value, themeOption]) => (
                    <button type="button" key={value} onClick={() => setForm((current) => ({ ...current, theme: value }))} className={`theme-card ${form.theme === value ? 'is-selected' : ''}`}>
                      <span className="theme-card__preview" style={{ background: themeOption.background }}><span style={{ background: form.primaryColor, color: form.secondaryColor }}>Aa</span><i style={{ background: themeOption.surface }} /><i style={{ background: themeOption.surface }} /></span>
                      <span className="theme-card__name">{themeLabels[value]}</span>
                      {form.theme === value && <span className="theme-card__check">✓</span>}
                    </button>
                  ))}
                </div>
              </section>

              <section className="appearance-panel">
                <div className="appearance-panel__heading"><div><h3>Tipografi</h3><p>Bu seçim şu anki önizlemeyi etkiler.</p></div></div>
                <select value={font} onChange={(event) => setFont(event.target.value)} className="field-input">{fonts.map((fontName) => <option key={fontName} value={fontName}>{fontName}</option>)}</select>
              </section>

              <section className="appearance-panel">
                <div className="appearance-panel__heading"><div><h3>Menü düzeni</h3><p>Basit görünürlük seçenekleriyle önizlemeyi şekillendirin.</p></div></div>
                <div className="appearance-options"><label><input type="checkbox" checked={showImages} onChange={(event) => setShowImages(event.target.checked)} /> Ürün görsellerini göster</label><label><input type="checkbox" checked={showDescriptions} onChange={(event) => setShowDescriptions(event.target.checked)} /> Ürün açıklamalarını göster</label><label><input type="checkbox" checked={showPrices} onChange={(event) => setShowPrices(event.target.checked)} /> Fiyatları göster</label><label><input type="checkbox" checked={emphasizeFeatured} onChange={(event) => setEmphasizeFeatured(event.target.checked)} /> Öne çıkan ürünü vurgula</label></div>
              </section>

              <div className="flex flex-wrap justify-end gap-3"><button type="button" onClick={reset} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Varsayılanlara Dön</button><button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</button></div>
            </div>

            <aside className="appearance-preview-wrap"><div className="appearance-preview-label">Canlı önizleme</div><div className="appearance-preview" data-theme={form.theme} style={previewStyle}><div className="appearance-preview__header"><span>☰</span><strong>Test Restoran</strong><span>ⓘ</span></div><div className="appearance-preview__nav"><span>Başlangıçlar</span><span>Ana Yemekler</span><span>Tatlılar</span></div><div className="appearance-preview__content"><h4>Başlangıçlar</h4><div className={`appearance-preview__product ${emphasizeFeatured ? 'is-featured' : ''}`}>{showImages && <span className="appearance-preview__image" />}<span><b>Çıtır Tavuk Parçaları</b>{showDescriptions && <small>Özel dip sos ile</small>}{showPrices && <strong>₺220.00</strong>}</span></div><h4>Ana Yemekler</h4><div className="appearance-preview__product">{showImages && <span className="appearance-preview__image" />}<span><b>Izgara Köfte</b>{showDescriptions && <small>Patates ve mevsim garnitürü</small>}{showPrices && <strong>₺340.00</strong>}</span></div></div></div></aside>
          </form>
        )}
      </div>
    </RestaurantLayout>
  );
};

export default Appearance;
