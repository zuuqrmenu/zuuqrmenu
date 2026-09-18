import { useEffect, useRef, useState } from 'react';
import BistroFeaturedStories from './public-menu/BistroFeaturedStories';
import CategoryNavigation from './public-menu/CategoryNavigation';
import CategorySection from './public-menu/CategorySection';
import MenuHeader from './public-menu/MenuHeader';
import { getPublicMenuTheme, publicMenuFonts, publicMenuThemes } from '../utils/publicMenuTheme';

const previewDemoRestaurant = {
  name: 'Demo Restoran',
  coverImage: '',
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
};

const previewDemoCategories = [
  {
    id: 'baslangiclar',
    name: 'Başlangıçlar',
    products: [
      { id: 'p1', name: 'Çıtır Tavuk Parçaları', shortDescription: 'Kızarmış patates, özel sos ve taze yeşillik', price: 280, oldPrice: 320, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p2', name: 'Akdeniz Salatası', shortDescription: 'Zeytin, domates, feta ve limon sosu', price: 240, oldPrice: null, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'ana-yemekler',
    name: 'Ana Yemekler',
    products: [
      { id: 'p3', name: 'Trüflü Makarna', shortDescription: 'Parmesan, mantar ve trüf yağı', price: 420, oldPrice: 450, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p4', name: 'Izgara Sebze Tabağı', shortDescription: 'Közlenmiş sebzeler, tahin sosu', price: 310, oldPrice: null, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'tatlilar',
    name: 'Tatlılar',
    products: [
      { id: 'p5', name: 'San Sebastian Cheesecake', shortDescription: 'Karamelize kremalı klasik tatlı', price: 190, oldPrice: null, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
      { id: 'p6', name: 'Bourbon Brownie', shortDescription: 'Ceviz, bitter çikolata ve vanilya', price: 170, oldPrice: 200, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
];

const themeOptions = [
  { value: 'MINIMAL', label: 'Varsayılan', accent: '#1F2937', description: 'Temel ve güvenli', kind: 'Standart görünüm' },
];
const fonts = ['Inter', 'DM Sans', 'Playfair Display', 'Lora'];
const fontMeta = {
  Inter: 'Modern & temiz',
  'DM Sans': 'Yumuşak & modern',
  'Playfair Display': 'Zarif & klasik',
  Lora: 'Editoryal & sıcak',
};
const structures = [
  { value: 'STANDARD', label: 'Kart düzeni', description: 'Görsel ve bilgiyi dengeli sunar', icon: '▦' },
  { value: 'COMPACT', label: 'Sıkı liste', description: 'Daha fazla ürünü hızlı taratır', icon: '☷' },
  { value: 'EDITORIAL', label: 'Editoryal', description: 'Ürünleri hikaye gibi öne çıkarır', icon: '▤' },
];
const defaults = {
  name: '',
  theme: 'MINIMAL',
  mode: 'LIGHT',
  font: 'Inter',
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
  layout: { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD', showStories: false },
};

export const buildDefaultMenuTemplate = (overrides = {}) => ({
  ...defaults,
  name: 'Varsayılan Menü',
  theme: 'MINIMAL',
  mode: 'LIGHT',
  font: 'Inter',
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
  layout: { ...defaults.layout },
  ...overrides,
  layout: { ...defaults.layout, ...(overrides.layout || {}) },
});

const normalize = (theme) => ({ ...defaults, ...(theme || {}), mode: theme?.mode || 'LIGHT', layout: { ...defaults.layout, ...((theme && theme.layout) || {}) } });

export const ThemePreview = ({ draft }) => {
  const previewTheme = getPublicMenuTheme(draft.theme || 'MINIMAL', draft.mode || 'LIGHT');
  const previewMode = draft.mode || 'LIGHT';
  const previewLayout = draft.layout || defaults.layout;
  const previewPrimary = draft.theme === 'BISTRO' ? '#b85c3b' : '#1F2937';
  const previewSecondary = draft.mode === 'DARK' ? '#f4efe8' : '#fffdf8';
  const previewStyle = {
    '--menu-primary': previewPrimary,
    '--menu-secondary': previewSecondary,
    '--menu-background': previewTheme.background,
    '--menu-surface': previewTheme.surface,
    '--menu-text': previewTheme.text,
    '--menu-muted': previewTheme.muted,
    '--menu-border': previewTheme.border,
    '--menu-radius': previewTheme.radius,
    '--menu-shadow': previewTheme.shadow,
    '--menu-font': publicMenuFonts[draft.font] || publicMenuFonts.Inter,
  };

  return (
    <div className="public-menu-shell preview-menu-shell" data-theme={draft.theme || 'MINIMAL'} data-mode={previewMode} data-layout={previewLayout.style || 'STANDARD'} data-show-featured={previewLayout.emphasizeFeatured !== false} style={previewStyle}>
      <div className="public-menu-page preview-public-page">
        <MenuHeader restaurant={{ ...previewDemoRestaurant, name: 'Demo Restoran' }} onOpenCategories={() => {}} onOpenInfo={() => {}} />
        <CategoryNavigation categories={previewDemoCategories} activeCategory={previewDemoCategories[0].id} onSelect={() => {}} />
        {previewLayout.showStories && <BistroFeaturedStories products={previewDemoCategories.flatMap((category) => category.products)} onSelect={() => {}} />}
        <main className="public-menu-content preview-menu-content">
          {previewDemoCategories.map((category) => (
            <CategorySection key={category.id} category={category} layout={previewLayout} onProductSelect={() => {}} />
          ))}
        </main>
        <footer className="public-footer">zuuqrmenu <span>•</span> Dijital Menü</footer>
      </div>
    </div>
  );
};

const MenuCustomizationCompactModal = ({ themes, onClose, onSaved, editingIndex = null, initialMenu = null }) => {
  const [savedThemes, setSavedThemes] = useState(Array.isArray(themes) ? themes : []);
  const [draft, setDraft] = useState(normalize(initialMenu || themes?.[0] || buildDefaultMenuTemplate()));
  const [feedback, setFeedback] = useState({ kind: 'idle', message: '', id: 0, isHiding: false });
  const [nameError, setNameError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewport);
      return () => mediaQuery.removeEventListener('change', updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  useEffect(() => {
    const nextThemes = Array.isArray(themes) ? themes : [];
    setSavedThemes(nextThemes);
    setDraft((current) => {
      const id = current?._id || current?.id;
      const nextDraft = nextThemes.find((item) => item && (String(item._id || item.id) === String(id))) || initialMenu || nextThemes[0] || buildDefaultMenuTemplate();
      return normalize(nextDraft);
    });
  }, [themes, initialMenu]);

  useEffect(() => () => {
    if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
  }, []);

  const triggerFeedback = (kind, message) => {
    if (feedbackTimeoutRef.current) window.clearTimeout(feedbackTimeoutRef.current);
    const nextId = Date.now() + Math.random();
    setFeedback({ kind, message, id: nextId, isHiding: false });
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback((current) => (current.id === nextId ? { ...current, isHiding: true } : current));
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback((current) => (current.id === nextId ? { kind: 'idle', message: '', id: current.id + 1, isHiding: false } : current));
      }, 350);
    }, 3000);
  };

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const updateLayout = (field, value) => setDraft((current) => ({ ...current, layout: { ...current.layout, [field]: value } }));

  const save = async () => {
    const cleanName = draft.name?.trim() || '';
    if (!cleanName) {
      setNameError(true);
      triggerFeedback('error', 'Menü adı boş bırakılamaz.');
      setError('Menü adı boş bırakılamaz.');
      return;
    }

    setNameError(false);
    setSaving(true);
    setError('');
    setFeedback((current) => ({ ...current, kind: 'idle', message: '', id: current.id + 1 }));

    try {
      const payload = {
        ...normalize(draft),
        name: cleanName,
        mode: draft.mode || 'LIGHT',
        layout: { ...defaults.layout, ...(draft.layout || {}) },
      };
      const next = Array.isArray(savedThemes) ? [...savedThemes] : [];
      const existingIndex = typeof editingIndex === 'number' ? editingIndex : next.findIndex((item) => String(item?._id || item?.id) === String(draft?._id || draft?.id));
      if (typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < next.length) {
        next[editingIndex] = payload;
      } else if (existingIndex >= 0) {
        next[existingIndex] = payload;
      } else if (next.length >= 5) {
        setError('En fazla 5 menü kaydedebilirsiniz.');
        setNameError(false);
        triggerFeedback('error', 'En fazla 5 menü kaydedebilirsiniz.');
        return;
      } else {
        next.push(payload);
      }

      const settings = await onSaved(next, payload, editingIndex);
      const result = settings?.savedMenus || settings?.menuThemes || next;
      setSavedThemes(result);
      const selected = Array.isArray(result)
        ? result.find((item) => String(item?._id || item?.id) === String(payload?._id || payload?.id)) || result.find((item) => item?.name === payload.name) || payload
        : payload;
      setDraft(normalize(selected));
      setError('');
      triggerFeedback('success', 'Tema kaydedildi.');
    } catch (err) {
      const message = err?.response?.data?.error || 'Menü kaydedilemedi. Lütfen tekrar deneyin.';
      setError(message);
      setNameError(false);
      triggerFeedback('error', message);
    } finally {
      setSaving(false);
    }
  };

  const preview = getPublicMenuTheme(draft.theme, draft.mode || 'LIGHT');
  const fontStack = publicMenuFonts[draft.font] || publicMenuFonts.Inter;
  const showPreviewSection = !isMobileViewport || showMobilePreview;

  return (
    <div className="menu-compact-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`menu-compact-modal ${feedback.kind === 'error' ? 'is-invalid' : ''} ${feedback.kind === 'success' ? 'is-success' : ''}`} role="dialog" aria-modal="true" aria-labelledby="menu-compact-title">
        <header className="menu-compact-header">
          <div className="menu-compact-header__title-wrap">
            <span className="menu-compact-kicker">MENÜ TASARIMI</span>
            <h2 id="menu-compact-title">Menü Tasarımı</h2>
            <p>Menünüzün görünümünü ve sunumunu özelleştirin.</p>
          </div>

          <div className="menu-compact-header__actions">
            <input
              type="text"
              value={draft.name || ''}
              onChange={(event) => { setDraft((current) => ({ ...current, name: event.target.value })); setNameError(false); setError(''); setFeedback({ kind: 'idle', message: '', id: Date.now() + Math.random() }); }}
              className={`menu-theme-name-inline__input ${nameError ? 'is-invalid' : ''}`}
              aria-label="Tema adı"
              aria-invalid={nameError}
              placeholder="Tema adı"
            />
            <button type="button" className="menu-compact-save" onClick={save} disabled={saving} aria-label="Kaydet" title={saving ? 'Kaydediliyor...' : 'Kaydet'}>{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            <button type="button" className="menu-compact-close-btn" onClick={onClose} aria-label="Kapat" title="Kapat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {isMobileViewport && (
          <button
            type="button"
            className={`menu-compact-mobile-preview-fab ${showMobilePreview ? 'is-active' : ''}`}
            onClick={() => setShowMobilePreview((current) => !current)}
            aria-label={showMobilePreview ? 'Canlı önizlemeyi kapat' : 'Canlı önizlemeyi aç'}
            title={showMobilePreview ? 'Canlı önizlemeyi kapat' : 'Canlı önizlemeyi aç'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </button>
        )}

        {feedback.kind !== 'idle' && (
          <div key={`${feedback.kind}-${feedback.id}`} className={`menu-compact-feedback is-${feedback.kind} ${feedback.isHiding ? 'is-hiding' : ''}`} role="alert">
            {feedback.message}
          </div>
        )}

        <div className={`menu-compact-layout ${isMobileViewport ? 'is-mobile' : ''} ${showMobilePreview && isMobileViewport ? 'is-mobile-preview' : ''}`}>
          {(!isMobileViewport || !showMobilePreview) && (
            <aside className="menu-compact-sidebar">
              <section className="menu-compact-panel">
                <div className="menu-compact-panel__header">
                  <div>
                    <h3>Tema</h3>
                    <p>Menünüzün temel görünümünü seçin.</p>
                  </div>
                </div>

                <div className="menu-theme-grid">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`menu-theme-card ${draft.theme === option.value ? 'is-selected' : ''}`}
                      onClick={() => update('theme', option.value)}
                      title={`${option.label} teması`}
                    >
                      <span className="menu-theme-card__art" style={{ background: option.value === 'BISTRO' ? '#f7f1e6' : '#f7f5f0' }}>
                        <span className="menu-theme-card__header" style={{ background: option.value === 'BISTRO' ? '#2a1d18' : '#1f2937' }} />
                        <span className="menu-theme-card__nav" style={{ background: option.value === 'BISTRO' ? '#efe4d7' : '#eef2f7' }} />
                        <span className="menu-theme-card__item" style={{ background: option.value === 'BISTRO' ? '#d6a67f' : '#dfe6ef' }} />
                        <span className="menu-theme-card__item menu-theme-card__item--secondary" style={{ background: option.value === 'BISTRO' ? '#f2dccc' : '#f3f6fb' }} />
                      </span>
                      <span className="menu-theme-card__meta">
                        <strong>{option.label}</strong>
                        <small>{option.kind}</small>
                      </span>
                      {draft.theme === option.value && <span className="menu-theme-card__indicator" aria-hidden="true" />}
                    </button>
                  ))}
                </div>

                <div className="menu-mode-row">
                  <span>Menü modu</span>
                  <div className="menu-mode-group" role="group" aria-label="Menü modu">
                    {['LIGHT', 'DARK'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={draft.mode === mode ? 'is-selected' : ''}
                        onClick={() => update('mode', mode)}
                      >
                        {mode === 'LIGHT' ? '☀ Açık' : '◐ Koyu'}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="menu-compact-panel">
                <div className="menu-compact-panel__header">
                  <div>
                    <h3>Tipografi</h3>
                    <p>Menünüzde kullanılacak yazı karakterini seçin.</p>
                  </div>
                </div>

                <div className="menu-font-grid">
                  {fonts.map((font) => (
                    <button
                      type="button"
                      key={font}
                      className={draft.font === font ? 'menu-font-card is-selected' : 'menu-font-card'}
                      onClick={() => update('font', font)}
                      title={`${font} — ${fontMeta[font]}`}
                    >
                      <span className="menu-font-sample" style={{ fontFamily: publicMenuFonts[font] }}>Aa</span>
                      <strong>{font}</strong>
                      <small>{fontMeta[font]}</small>
                    </button>
                  ))}
                </div>
              </section>

              <section className="menu-compact-panel">
                <div className="menu-compact-panel__header">
                  <div>
                    <h3>Görünüm</h3>
                    <p>Menüde hangi unsurları göstereceğinizi belirleyin.</p>
                  </div>
                </div>

                <div className="menu-switch-list">
                  {[
                    ['showImages', 'Ürün görsellerini göster', 'Ürün fotoğraflarını menüde göster.'],
                    ['showDescriptions', 'Ürün açıklamasını göster', 'Ürün açıklamalarını görünür tut.'],
                    ['showPrices', 'Fiyatları göster', 'Ürün fiyatlarını göstermek için açık tut.'],
                    ['emphasizeFeatured', 'Öne çıkan ürünü vurgula', 'Öne çıkan ürünleri daha belirgin göster.'],
                    ['showStories', 'Hikayeler alanını göster', 'Öne çıkan ürünleri dairesel hikaye olarak üstte göster.'],
                  ].map(([field, title, helper]) => (
                    <label key={field} className="menu-toggle-row">
                      <span className="menu-toggle-copy">
                        <b>{title}</b>
                        <small>{helper}</small>
                      </span>
                      <span className="menu-toggle-switch">
                        <input type="checkbox" checked={!!draft.layout[field]} onChange={(event) => updateLayout(field, event.target.checked)} />
                        <i aria-hidden="true" />
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </aside>
          )}

          {(!isMobileViewport || showMobilePreview) && (
            <div className="menu-compact-preview-shell">
              <div className="menu-compact-preview__eyebrow">Canlı önizleme</div>
              <div className="menu-compact-preview">
                <ThemePreview draft={draft} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuCustomizationCompactModal;
