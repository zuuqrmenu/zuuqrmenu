import { useEffect, useState } from 'react';
import { getPublicMenuTheme, publicMenuThemes } from '../utils/publicMenuTheme';

const themeLabels = { MINIMAL: 'Minimal', ELEGANT: 'Elegant', WARM: 'Warm', MODERN: 'Modern', DARK: 'Dark', CLASSIC: 'Classic' };
const fonts = ['Inter', 'Poppins', 'Manrope', 'Playfair Display', 'DM Sans', 'Outfit', 'Cormorant Garamond', 'Space Grotesk', 'Libre Baskerville', 'Plus Jakarta Sans'];
const layoutOptions = [
  ['STANDARD', 'Dengeli', 'Görsel, açıklama ve fiyat için klasik menü akışı'],
  ['COMPACT', 'Kompakt', 'Daha fazla ürünü daha az alanda göster'],
  ['EDITORIAL', 'Editoryal', 'Görselleri ve ürün hikayesini öne çıkar'],
];

const defaults = { name: '', theme: 'MINIMAL', font: 'Inter', primaryColor: '#1F2937', secondaryColor: '#FFFFFF', layout: { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD' } };

const normalizeTheme = (theme) => ({ ...defaults, ...theme, layout: { ...defaults.layout, ...(theme?.layout || {}) } });

const MenuCustomizationModal = ({ themes, onClose, onSaved }) => {
  const [savedThemes, setSavedThemes] = useState(themes || []);
  const [draft, setDraft] = useState(normalizeTheme(themes?.[0]));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSavedThemes(themes || []);
    setDraft((current) => {
      const currentId = current?._id || current?.id;
      return normalizeTheme((themes || []).find((theme) => String(theme._id || theme.id) === String(currentId)) || themes?.[0]);
    });
  }, [themes]);

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const updateLayout = (field, value) => setDraft((current) => ({ ...current, layout: { ...current.layout, [field]: value } }));

  const startNew = () => {
    setDraft(normalizeTheme({ ...defaults, name: `Tema ${savedThemes.length + 1}` }));
    setError('');
  };

  const saveTheme = async () => {
    if (!draft.name.trim()) {
      setError('Tema adı zorunludur.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const existingIndex = savedThemes.findIndex((theme) => String(theme._id || theme.id) === String(draft._id || draft.id));
      const nextThemes = [...savedThemes];
      const payload = { ...draft, name: draft.name.trim() };
      if (existingIndex >= 0) nextThemes[existingIndex] = payload;
      else if (nextThemes.length >= 5) {
        setError('En fazla 5 tema kaydedebilirsiniz.');
        return;
      } else nextThemes.push(payload);
      const settings = await onSaved(nextThemes, payload);
      const savedTheme = settings?.menuThemes?.find((theme) => theme.name === payload.name) || payload;
      setSavedThemes(settings?.menuThemes || nextThemes);
      setDraft(normalizeTheme(savedTheme));
    } catch (err) {
      setError(err.response?.data?.error || 'Tema kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const previewTheme = getPublicMenuTheme(draft.theme);

  return (
    <div className="menu-customization-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="menu-customization-modal" role="dialog" aria-modal="true" aria-labelledby="menu-customization-title">
        <header className="menu-customization-modal__header"><div><p className="settings-eyebrow">Menü özelleştirme</p><h2 id="menu-customization-title">Menünüzün karakterini oluşturun</h2><p>Temayı, tipografiyi ve ürün görünümünü tek bir tasarım olarak kaydedin.</p></div><button type="button" className="menu-customization-close" onClick={onClose} aria-label="Kapat">×</button></header>
        {error && <div className="settings-error" role="alert">{error}</div>}
        <div className="menu-customization-modal__body">
          <section className="menu-customization-section"><div className="menu-customization-section__heading"><div><span>01</span><h3>Temalar</h3><p>Menü yapınızın temel atmosferini seçin.</p></div><button type="button" className="menu-customization-new" onClick={startNew} disabled={savedThemes.length >= 5}>+ Yeni tema</button></div><div className="menu-theme-grid">{Object.entries(publicMenuThemes).map(([value, option]) => <button type="button" key={value} className={`menu-theme-option ${draft.theme === value ? 'is-selected' : ''}`} onClick={() => updateDraft('theme', value)}><span className="menu-theme-option__preview" style={{ background: option.background }}><i style={{ background: draft.primaryColor }} /><b style={{ color: option.text }}>Aa</b><em style={{ background: option.surface }} /><em style={{ background: option.surface }} /></span><strong>{themeLabels[value]}</strong>{draft.theme === value && <small>Seçili</small>}</button>)}</div><div className="menu-theme-custom-row"><label>Tema adı<input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Örn. Akşam menüsü" /></label><label>Vurgu rengi<span className="menu-color-input"><input type="color" value={draft.primaryColor} onChange={(event) => updateDraft('primaryColor', event.target.value)} /><code>{draft.primaryColor}</code></span></label><label>İkincil renk<span className="menu-color-input"><input type="color" value={draft.secondaryColor} onChange={(event) => updateDraft('secondaryColor', event.target.value)} /><code>{draft.secondaryColor}</code></span></label></div></section>
          <section className="menu-customization-section"><div className="menu-customization-section__heading"><div><span>02</span><h3>Tipografi</h3><p>Menünüzün sesini yansıtan fontu seçin.</p></div></div><div className="menu-font-grid">{fonts.map((font) => <button type="button" key={font} className={draft.font === font ? 'is-selected' : ''} onClick={() => updateDraft('font', font)}><strong style={{ fontFamily: font === 'Playfair Display' || font === 'Cormorant Garamond' || font === 'Libre Baskerville' ? 'Georgia, serif' : font }}>{font}</strong><span>Başlangıçlar · {font}</span></button>)}</div></section>
          <section className="menu-customization-section"><div className="menu-customization-section__heading"><div><span>03</span><h3>Menü düzeni</h3><p>İçeriğin müşteriye nasıl sunulacağını belirleyin.</p></div></div><div className="menu-layout-grid">{layoutOptions.map(([value, label, description]) => <button type="button" key={value} className={`menu-layout-option ${draft.layout.style === value ? 'is-selected' : ''}`} onClick={() => updateLayout('style', value)}><strong>{label}</strong><span>{description}</span></button>)}</div><div className="menu-switch-list">{[['showImages', 'Ürün görsellerini göster'], ['showDescriptions', 'Ürün açıklamalarını göster'], ['showPrices', 'Fiyatları göster'], ['emphasizeFeatured', 'Öne çıkan ürünü vurgula']].map(([field, label]) => <label key={field}><span>{label}</span><input type="checkbox" checked={draft.layout[field]} onChange={(event) => updateLayout(field, event.target.checked)} /><i /></label>)}</div></section>
          <aside className="menu-customization-preview" style={{ '--preview-background': previewTheme.background, '--preview-surface': previewTheme.surface, '--preview-text': previewTheme.text, '--preview-muted': previewTheme.muted, '--preview-primary': draft.primaryColor }}><span>CANLI ÖNİZLEME</span><div className="menu-customization-preview__screen"><header><b>☰</b><strong>Demo Restoran</strong><b>ⓘ</b></header><nav><i>Başlangıçlar</i><i>Ana Yemekler</i><i>Tatlılar</i></nav><main><small>{themeLabels[draft.theme]} · {draft.layout.style}</small><h4>Başlangıçlar</h4><article>{draft.layout.showImages && <i /> }<span><b>Çıtır Tavuk Parçaları</b>{draft.layout.showDescriptions && <em>Özel dip sos ile</em>}{draft.layout.showPrices && <strong>₺280</strong>}</span></article><article>{draft.layout.showImages && <i /> }<span><b>Izgara sebze tabağı</b>{draft.layout.showDescriptions && <em>Mevsim sebzeleri</em>}{draft.layout.showPrices && <strong>₺260</strong>}</span></article></main></div></aside>
        </div>
        <footer className="menu-customization-modal__footer"><span>{savedThemes.length}/5 tema kayıtlı</span><div><button type="button" className="menu-customization-cancel" onClick={onClose}>Vazgeç</button><button type="button" className="menu-customization-save" onClick={saveTheme} disabled={saving}>{saving ? 'Kaydediliyor...' : 'Temayı Kaydet'}</button></div></footer>
      </div>
    </div>
  );
};

export default MenuCustomizationModal;
