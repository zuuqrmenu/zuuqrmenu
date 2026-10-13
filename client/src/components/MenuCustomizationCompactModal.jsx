import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ThemePreview from './menu-customizer/ThemePreview';
import ThemeArt from './menu-customizer/ThemeArt';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import { publicMenuFonts } from '../utils/publicMenuTheme';
import { menuFontMeta, menuFonts, menuLayoutOptions, menuPalettes, menuThemeOptions, menuToggleOptions } from '../utils/menuThemeMeta';
import '../styles/menu-customizer.css';

export { ThemePreview };

const MAX_CUSTOM_THEMES = 3;

const defaults = {
  name: '',
  theme: 'DEFAULT',
  mode: 'LIGHT',
  font: 'Inter',
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
  layout: { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD', showStories: true, showEcoBadge: true },
};

export const buildDefaultMenuTemplate = (overrides = {}) => ({
  ...defaults,
  name: overrides.name !== undefined ? overrides.name : 'Varsayılan Menü',
  theme: 'DEFAULT',
  mode: 'LIGHT',
  font: 'Inter',
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
  ...overrides,
  layout: { ...defaults.layout, ...(overrides.layout || {}) },
});

const normalize = (theme) => ({ ...defaults, ...(theme || {}), mode: theme?.mode || 'LIGHT', layout: { ...defaults.layout, ...((theme && theme.layout) || {}) } });

const ICONS = {
  theme: <><rect x="3" y="3" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="2" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="2" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" /></>,
  color: <><path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-1.8 0-1.3-1-1.6-1-2.7 0-1 .8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" /><circle cx="7.5" cy="11" r="1" /><circle cx="10.5" cy="7" r="1" /><circle cx="15" cy="7.5" r="1" /></>,
  type: <><path d="M4 7V5h16v2M12 5v14M9 19h6" /></>,
  layout: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  close: <><path d="M18 6 6 18M6 6l12 12" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 .8 12.2a1 1 0 0 0 1 .8h8.4a1 1 0 0 0 1-.8L18 7M9 7V4h6v3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" />,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
};

const Icon = ({ name, size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{ICONS[name]}</svg>
);

const TABS = [
  ['theme', 'Tema', 'theme'],
  ['color', 'Renk', 'color'],
  ['type', 'Yazı tipi', 'type'],
  ['layout', 'Düzen', 'layout'],
];

const Section = ({ title, hint, children }) => (
  <section className="mcz-section">
    <div className="mcz-section__head">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
    {children}
  </section>
);

const ColorField = ({ label, hint, value, onChange }) => (
  <label className="mcz-color">
    <span className="mcz-color__swatch" style={{ background: value }}>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value.toUpperCase())} aria-label={label} />
    </span>
    <span className="mcz-color__text">
      <b>{label}</b>
      <small>{hint}</small>
    </span>
    <code>{value}</code>
  </label>
);

const MenuCustomizationCompactModal = ({ themes, onClose, onSaved, onDelete = null, editingIndex = null, initialMenu = null, restaurant = null }) => {
  useBodyScrollLock(true);
  const [savedThemes, setSavedThemes] = useState(Array.isArray(themes) ? themes : []);
  const [draft, setDraft] = useState(() => (initialMenu ? normalize(initialMenu) : buildDefaultMenuTemplate({ name: '' })));
  const [activeTab, setActiveTab] = useState('theme');
  const [mobileView, setMobileView] = useState('settings');
  const [toast, setToast] = useState(null);
  const [nameError, setNameError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toastTimer = useRef(null);
  const snapshotRef = useRef('');
  const nameRef = useRef(null);

  const isEditingExisting = Boolean(initialMenu && (initialMenu._id || initialMenu.id || typeof editingIndex === 'number'));
  const isDirty = useMemo(() => JSON.stringify(draft) !== snapshotRef.current, [draft]);

  const showToast = (message, type = 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => { if (typeof onClose === 'function') onClose(); }, 200);
  };

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape' && !deleteConfirmOpen) handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isClosing, deleteConfirmOpen]);

  // The saved list follows the parent; the draft only restarts when a different theme is opened.
  useEffect(() => { setSavedThemes(Array.isArray(themes) ? themes : []); }, [themes]);

  useEffect(() => {
    const initial = initialMenu ? normalize(initialMenu) : buildDefaultMenuTemplate({ name: '' });
    setDraft(initial);
    snapshotRef.current = JSON.stringify(initial);
  }, [initialMenu]);

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const updateLayout = (field, value) => setDraft((current) => ({ ...current, layout: { ...current.layout, [field]: value } }));
  const applyPalette = (palette) => setDraft((current) => ({ ...current, primaryColor: palette.primary, secondaryColor: palette.secondary }));

  const save = async () => {
    const cleanName = draft.name?.trim() || '';
    if (!cleanName) {
      setNameError(true);
      nameRef.current?.focus();
      showToast('Lütfen tasarıma bir ad verin.', 'error');
      return;
    }
    // Nothing changed on an existing design: just confirm and close.
    if (isEditingExisting && !isDirty) {
      showToast('Tasarım kaydedildi.', 'success');
      setTimeout(handleClose, 150);
      return;
    }

    setNameError(false);
    setSaving(true);
    try {
      const payload = { ...normalize(draft), name: cleanName, mode: draft.mode || 'LIGHT', layout: { ...defaults.layout, ...(draft.layout || {}) } };
      const next = Array.isArray(savedThemes) ? [...savedThemes] : [];
      const hasEditingIndex = typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < next.length;
      const targetId = draft?._id || draft?.id || initialMenu?._id || initialMenu?.id;
      const existingIndex = hasEditingIndex
        ? editingIndex
        : (targetId ? next.findIndex((item) => String(item?._id || item?.id) === String(targetId)) : -1);

      if (existingIndex >= 0) {
        const existingId = next[existingIndex]?._id || next[existingIndex]?.id;
        next[existingIndex] = { ...payload, ...(existingId ? { _id: existingId } : {}) };
      } else if (next.length >= MAX_CUSTOM_THEMES) {
        throw Object.assign(new Error('limit'), { response: { status: 400, data: { error: 'En fazla 3 özel tasarım kaydedebilirsiniz. Yeni tasarım için önce birini silin.' } } });
      } else {
        const { _id, id, ...fresh } = payload;
        next.push(fresh);
      }

      let lastError = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          await onSaved(next, payload, existingIndex >= 0 ? existingIndex : -1);
          lastError = null;
          break;
        } catch (attemptError) {
          lastError = attemptError;
          if (attemptError?.response?.status === 400) break; // validation errors will not succeed on retry
          if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 400)); // one retry for a waking server
        }
      }
      if (lastError) throw lastError;

      showToast(existingIndex >= 0 ? 'Tasarım güncellendi.' : 'Tasarım kaydedildi.', 'success');
      setTimeout(handleClose, 150);
    } catch (err) {
      showToast(err?.response?.data?.error || 'Tasarım kaydedilemedi. Lütfen tekrar deneyin.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (typeof onDelete !== 'function') { setDeleteConfirmOpen(false); return; }
    setDeleting(true);
    try {
      const next = Array.isArray(savedThemes) ? [...savedThemes] : [];
      const targetId = draft?._id || draft?.id || initialMenu?._id || initialMenu?.id;
      const hasEditingIndex = typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < next.length;
      const targetIndex = hasEditingIndex ? editingIndex : (targetId ? next.findIndex((item) => String(item?._id || item?.id) === String(targetId)) : -1);
      if (targetIndex >= 0) {
        const deletedId = next[targetIndex]?._id || next[targetIndex]?.id || targetId;
        next.splice(targetIndex, 1);
        await onDelete(next, deletedId, targetIndex);
      }
      setDeleteConfirmOpen(false);
      handleClose();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Tasarım silinemedi. Lütfen tekrar deneyin.', 'error');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const activeThemeOption = menuThemeOptions.find((option) => option.value === draft.theme) || menuThemeOptions[0];

  const renderTab = () => {
    if (activeTab === 'theme') {
      return (
        <>
          <Section title="Menü teması" hint="Menünün genel düzeni ve gezinme biçimi.">
            <div className="mcz-theme-list" role="radiogroup" aria-label="Menü teması">
              {menuThemeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={draft.theme === option.value}
                  className={`mcz-theme ${draft.theme === option.value ? 'is-selected' : ''}`}
                  onClick={() => update('theme', option.value)}
                >
                  <ThemeArt theme={option.value} mode={draft.mode} accent={draft.primaryColor} />
                  <span className="mcz-theme__text">
                    <b>{option.label}</b>
                    <small>{option.kind}</small>
                    <em>{option.description}</em>
                  </span>
                  <span className="mcz-theme__check" aria-hidden="true"><Icon name="check" size={14} /></span>
                </button>
              ))}
            </div>
          </Section>
          <Section title="Menü modu" hint="Müşterinin telefonunda açık ya da koyu görünüm.">
            <div className="mcz-seg" role="radiogroup" aria-label="Menü modu">
              {[['LIGHT', 'Açık', 'sun'], ['DARK', 'Koyu', 'moon']].map(([value, label, icon]) => (
                <button key={value} type="button" role="radio" aria-checked={draft.mode === value} className={draft.mode === value ? 'is-active' : ''} onClick={() => update('mode', value)}>
                  <Icon name={icon} size={16} />{label}
                </button>
              ))}
            </div>
          </Section>
        </>
      );
    }

    if (activeTab === 'color') {
      return (
        <>
          <Section title="Hazır paletler" hint="Tek dokunuşla vurgu ve ikincil rengi birlikte ayarlayın.">
            <div className="mcz-palettes">
              {menuPalettes.map((palette) => {
                const selected = palette.primary.toLowerCase() === draft.primaryColor?.toLowerCase() && palette.secondary.toLowerCase() === draft.secondaryColor?.toLowerCase();
                return (
                  <button key={palette.name} type="button" className={`mcz-palette ${selected ? 'is-selected' : ''}`} onClick={() => applyPalette(palette)} aria-pressed={selected}>
                    <span className="mcz-palette__dots"><i style={{ background: palette.primary }} /><i style={{ background: palette.secondary }} /></span>
                    <b>{palette.name}</b>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section title="Kendi renkleriniz" hint="Marka renginizi seçin; önizleme anında güncellenir.">
            <div className="mcz-colors">
              <ColorField label="Vurgu rengi" hint="Seçili sekme, rozet, düğmeler" value={draft.primaryColor || '#1F2937'} onChange={(value) => update('primaryColor', value)} />
              <ColorField label="İkincil renk" hint="Yardımcı yüzeyler ve detaylar" value={draft.secondaryColor || '#FFFFFF'} onChange={(value) => update('secondaryColor', value)} />
            </div>
          </Section>
        </>
      );
    }

    if (activeTab === 'type') {
      return (
        <Section title="Yazı tipi" hint="Menünün sesini belirleyen karakter.">
          <div className="mcz-fonts" role="radiogroup" aria-label="Yazı tipi">
            {menuFonts.map((font) => (
              <button key={font} type="button" role="radio" aria-checked={draft.font === font} className={`mcz-font ${draft.font === font ? 'is-selected' : ''}`} onClick={() => update('font', font)}>
                <span className="mcz-font__sample" style={{ fontFamily: publicMenuFonts[font] }}>Aa</span>
                <span className="mcz-font__text">
                  <b style={{ fontFamily: publicMenuFonts[font] }}>{font}</b>
                  <small>{menuFontMeta[font]}</small>
                </span>
                <span className="mcz-theme__check" aria-hidden="true"><Icon name="check" size={14} /></span>
              </button>
            ))}
          </div>
        </Section>
      );
    }

    return (
      <>
        <Section title="Ürün yerleşimi" hint="Ürünlerin listede nasıl dizileceği.">
          <div className="mcz-layouts" role="radiogroup" aria-label="Ürün yerleşimi">
            {menuLayoutOptions.map((option) => (
              <button key={option.value} type="button" role="radio" aria-checked={draft.layout.style === option.value} className={`mcz-layout ${draft.layout.style === option.value ? 'is-selected' : ''}`} onClick={() => updateLayout('style', option.value)}>
                <span className={`mcz-layout__art mcz-layout__art--${option.value.toLowerCase()}`} aria-hidden="true"><i /><i /><i /></span>
                <span className="mcz-layout__text"><b>{option.label}</b><small>{option.description}</small></span>
              </button>
            ))}
          </div>
        </Section>
        <Section title="Gösterilecekler" hint="Menüde hangi unsurların yer alacağını seçin.">
          <div className="mcz-toggles">
            {menuToggleOptions.map(([field, title, helper]) => (
              <label key={field} className="mcz-toggle">
                <span className="mcz-toggle__text"><b>{title}</b><small>{helper}</small></span>
                <span className="mcz-switch">
                  <input type="checkbox" checked={draft.layout[field] !== false} onChange={(event) => updateLayout(field, event.target.checked)} />
                  <i aria-hidden="true" />
                </span>
              </label>
            ))}
          </div>
        </Section>
      </>
    );
  };

  // Rendered in <body> so the dashboard's global form/heading overrides never leak into the dialog.
  return createPortal(
    <>
      {toast && <div key={toast.id} className={`mcz-toast mcz-toast--${toast.type}`} role="status">{toast.message}</div>}
      <div className={`mcz-backdrop ${isClosing ? 'is-closing' : ''}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
        <div className={`mcz-dialog ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="mcz-title">
          <header className="mcz-head">
            <div className="mcz-head__title">
              <p className="mcz-kicker">{isEditingExisting ? 'Tasarımı düzenle' : 'Yeni tasarım'}</p>
              <label className={`mcz-name ${nameError ? 'is-invalid' : ''}`}>
                <span className="mcz-visually-hidden" id="mcz-title">Tasarım adı</span>
                <input
                  ref={nameRef}
                  type="text"
                  value={draft.name || ''}
                  onChange={(event) => { update('name', event.target.value); setNameError(false); }}
                  placeholder="Tasarıma bir ad verin"
                  maxLength={60}
                  aria-invalid={nameError}
                />
              </label>
            </div>
            <div className="mcz-head__actions">
              {isEditingExisting && typeof onDelete === 'function' && (
                <button type="button" className="mcz-icon-btn mcz-icon-btn--danger" onClick={() => setDeleteConfirmOpen(true)} disabled={saving || deleting} aria-label="Tasarımı sil" title="Tasarımı sil"><Icon name="trash" /></button>
              )}
              <button type="button" className="mcz-icon-btn" onClick={handleClose} aria-label="Kapat" title="Kapat"><Icon name="close" /></button>
            </div>
          </header>

          <div className="mcz-mobile-switch" role="tablist" aria-label="Görünüm">
            <button type="button" role="tab" aria-selected={mobileView === 'settings'} className={mobileView === 'settings' ? 'is-active' : ''} onClick={() => setMobileView('settings')}><Icon name="sliders" size={16} />Ayarlar</button>
            <button type="button" role="tab" aria-selected={mobileView === 'preview'} className={mobileView === 'preview' ? 'is-active' : ''} onClick={() => setMobileView('preview')}><Icon name="eye" size={16} />Önizleme</button>
          </div>

          <div className={`mcz-body is-${mobileView}`}>
            <div className="mcz-controls">
              <div className="mcz-tabs" role="tablist" aria-label="Tasarım ayarları">
                {TABS.map(([id, label, icon]) => (
                  <button key={id} type="button" role="tab" id={`mcz-tab-${id}`} aria-selected={activeTab === id} aria-controls="mcz-panel" className={activeTab === id ? 'is-active' : ''} onClick={() => setActiveTab(id)}>
                    <Icon name={icon} size={17} /><span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="mcz-panel" id="mcz-panel" role="tabpanel" aria-labelledby={`mcz-tab-${activeTab}`} key={activeTab}>
                {renderTab()}
              </div>
            </div>

            <div className="mcz-stage">
              <div className="mcz-stage__label">
                <span>Canlı önizleme</span>
                <b>{activeThemeOption.label} · {draft.mode === 'DARK' ? 'Koyu' : 'Açık'}</b>
              </div>
              <div className="mcz-phone">
                <div className="mcz-phone__screen">
                  <ThemePreview draft={draft} restaurant={restaurant} />
                </div>
              </div>
            </div>
          </div>

          <footer className="mcz-foot">
            <p className={`mcz-status ${isDirty || !isEditingExisting ? 'is-dirty' : ''}`}>
              <i aria-hidden="true" />
              {isEditingExisting ? (isDirty ? 'Kaydedilmemiş değişiklikler var' : 'Tüm değişiklikler kaydedildi') : 'Yeni tasarım henüz kaydedilmedi'}
            </p>
            <div className="mcz-foot__actions">
              <button type="button" className="mcz-btn mcz-btn--ghost" onClick={handleClose}>Vazgeç</button>
              <button type="button" className="mcz-btn mcz-btn--primary" onClick={save} disabled={saving}>
                {saving ? <><span className="mcz-spinner" aria-hidden="true" />Kaydediliyor…</> : 'Tasarımı kaydet'}
              </button>
            </div>
          </footer>

          <ThemeDeleteConfirmDialog open={deleteConfirmOpen} themeName={draft.name} deleting={deleting} onCancel={() => setDeleteConfirmOpen(false)} onConfirm={handleDelete} />
        </div>
      </div>
    </>,
    document.body,
  );
};

export const ThemeDeleteConfirmDialog = ({ open, themeName, deleting, onCancel, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (deleting || isClosing) return;
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onCancel(); }, 200);
  };

  useEffect(() => {
    if (!open) { setIsClosing(false); return undefined; }
    const onKey = (event) => { if (event.key === 'Escape' && !deleting) { event.stopPropagation(); handleClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, deleting, isClosing]);

  if (!open) return null;

  return (
    <div className={`publish-dialog-backdrop ${isClosing ? 'is-closing' : ''}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
      <div className={`publish-dialog ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="theme-delete-confirm-title">
        <h2 id="theme-delete-confirm-title">Tasarımı sil</h2>
        <p><strong>{themeName || 'Bu tasarımı'}</strong> silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="publish-dialog__actions">
          <button type="button" className="publish-dialog__cancel" onClick={handleClose} disabled={deleting}>Vazgeç</button>
          <button type="button" className="publish-dialog__confirm publish-dialog__confirm--danger" onClick={onConfirm} disabled={deleting}>{deleting ? 'Siliniyor...' : 'Tasarımı sil'}</button>
        </div>
      </div>
    </div>
  );
};

export default MenuCustomizationCompactModal;
