import { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import RestaurantLayout from '../components/RestaurantLayout';
import ProductManager from '../components/ProductManager';
import MenuStructureEditor from '../components/MenuStructureEditor';
import DashboardSkeleton from '../components/DashboardSkeleton';
import PublicMenuButton from '../components/PublicMenuButton';
import MenuCustomizationCompactModal, { ThemePreview, buildDefaultMenuTemplate, ThemeDeleteConfirmDialog } from '../components/MenuCustomizationCompactModal';
import MenuImportPanel from '../components/MenuImportPanel';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../services/menuService';
import { restaurantSettingsService } from '../services/restaurantSettingsService';
import { publicMenuService } from '../services/publicMenuService';
import '../components/CategorySuggester.css';
import {
  findMatchingCategory,
  getFilteredCategorySuggestions,
  getNextCategoryDescription,
} from '../data/categoryDescriptionTemplates';

const emptyForm = { name: '', description: '', isActive: true, displayOrder: 0 };

const IconSparkle = ({ size = 14, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 1L14.8 8.8L22 12L14.8 15.2L12 23L9.2 15.2L2 12L9.2 8.8L12 1Z" />
  </svg>
);

const CategoryModal = ({ category, nextOrder, onClose, onSaved }) => {
  const [form, setForm] = useState(category ? { name: category.name, description: category.description || '', isActive: category.isActive, displayOrder: category.displayOrder } : { ...emptyForm, displayOrder: nextOrder });
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Global top-center toast state (3s fade in/out)
  const [siteToast, setSiteToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setSiteToast({ message, type, id: Date.now() });
    toastTimeoutRef.current = setTimeout(() => {
      setSiteToast(null);
    }, 3000);
  };

  // Category suggestions & description states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [streamState, setStreamState] = useState('idle'); // 'idle' | 'thinking' | 'streaming'
  const [, setForceUpdate] = useState(0);
  const categoryInputContainerRef = useRef(null);
  const categoryInputRef = useRef(null);
  const thinkTimeoutRef = useRef(null);
  const streamIntervalRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (thinkTimeoutRef.current) clearTimeout(thinkTimeoutRef.current);
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Recognized category derived from normalized input
  const recognizedCategoryItem = useMemo(() => {
    return findMatchingCategory(form.name);
  }, [form.name]);

  const recognizedKey = recognizedCategoryItem?.key || null;
  const canSuggestDescription = Boolean(recognizedKey);
  const filteredSuggestions = useMemo(() => {
    return getFilteredCategorySuggestions(form.name);
  }, [form.name]);

  const handleClose = (callback) => {
    if (isClosing) return;
    if (thinkTimeoutRef.current) clearTimeout(thinkTimeoutRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setIsClosing(true);
    setTimeout(() => {
      if (typeof callback === 'function') callback();
      else if (typeof onClose === 'function') onClose();
    }, 200);
  };

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Dismiss suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoryInputContainerRef.current &&
        !categoryInputContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showSuggestions) {
          event.stopPropagation();
          setShowSuggestions(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing, showSuggestions]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleGenerateDescription = () => {
    if (!canSuggestDescription || isGeneratingDesc) return;

    if (thinkTimeoutRef.current) clearTimeout(thinkTimeoutRef.current);
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    setIsGeneratingDesc(true);
    setStreamState('thinking');

    // Phase 1: Soft preparation / AI synthesis (200ms)
    thinkTimeoutRef.current = setTimeout(() => {
      const next = getNextCategoryDescription(recognizedKey);
      if (!next?.description) {
        setIsGeneratingDesc(false);
        setStreamState('idle');
        return;
      }

      setStreamState('streaming');
      setForm((curr) => ({ ...curr, description: '' }));

      // Phase 2: Smooth text stream lasting precisely 2.5 seconds (2500ms)
      const targetText = next.description;
      const totalDuration = 2500; // 2.5 saniye
      const textLength = targetText.length;
      const startTime = performance.now();

      streamIntervalRef.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / totalDuration);
        const currentLength = Math.floor(progress * textLength);

        setForm((curr) => ({ ...curr, description: targetText.slice(0, currentLength) }));

        if (progress >= 1) {
          clearInterval(streamIntervalRef.current);
          setForm((curr) => ({ ...curr, description: targetText }));
          setIsGeneratingDesc(false);
          setStreamState('completed');
          setTimeout(() => {
            setStreamState('idle');
          }, 850);
          setForceUpdate((v) => v + 1);
        }
      }, 30);
    }, 200);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      showToast('Kategori adı zorunludur.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), displayOrder: Number(form.displayOrder) };
      const result = category ? await menuService.updateCategory(category._id, payload) : await menuService.createCategory(payload);
      handleClose(() => onSaved(result.message));
    } catch (err) {
      showToast(err.response?.data?.error || 'Kategori kaydedilemedi.', 'error');
      setSaving(false);
    }
  };

  const modalContent = (
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
      <div
        className={`category-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 ${isClosing ? 'is-closing' : ''}`}
        role="presentation"
        onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-dialog-title"
          className={`category-modal-panel w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 ${isClosing ? 'is-closing' : ''}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-600">Menü</p>
              <h2 id="category-dialog-title" className="mt-1 text-xl font-semibold">{category ? 'Kategoriyi düzenle' : 'Kategori ekle'}</h2>
            </div>
            <button type="button" onClick={() => handleClose()} className="text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Kapat">×</button>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Category Name Input & Suggestions Dropdown */}
          <div className="relative" ref={categoryInputContainerRef}>
            <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Kategori adı
            </label>
            <input
              ref={categoryInputRef}
              id="category-name"
              name="name"
              value={form.name}
              onChange={(e) => {
                updateField(e);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              autoFocus
              autoComplete="off"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              placeholder="Örn. Ana Yemekler"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="category-suggestions-dropdown">
                {filteredSuggestions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`category-suggestion-item ${recognizedKey === item.key ? 'is-selected' : ''}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setForm((current) => ({ ...current, name: item.name }));
                      setShowSuggestions(false);
                    }}
                  >
                    <span>{item.name}</span>
                    {recognizedKey === item.key && (
                      <span className="category-suggestion-item__badge">Seçili</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Description & Sparkle Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="category-description" className="block text-sm font-medium text-slate-700">
                Açıklama <span className="font-normal text-slate-400">(opsiyonel)</span>
              </label>
            </div>
            <div className="category-ai-textarea-wrapper">
              <textarea
                id="category-description"
                name="description"
                value={form.description}
                onChange={updateField}
                rows="3"
                className={`category-textarea w-full resize-none rounded-xl border border-slate-300 pl-3 pr-11 py-2.5 text-sm outline-none transition-all duration-300 ${
                  isGeneratingDesc
                    ? 'is-generating'
                    : streamState === 'completed'
                    ? 'is-completed'
                    : 'focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                }`}
                placeholder={isGeneratingDesc ? 'ZuuAI açıklama oluşturuyor...' : 'Kategori hakkında kısa bilgi'}
              />
              {/* Soft modern AI floating mini pill */}
              {isGeneratingDesc && (
                <div className="category-ai-soft-pill" aria-hidden="true">
                  <span className="category-ai-soft-dot" />
                  <span className="category-ai-soft-text">
                    {streamState === 'thinking' ? 'ZuuAI hazırlanıyor' : 'Yazılıyor'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!canSuggestDescription || isGeneratingDesc}
                className={`category-sparkle-btn ${isGeneratingDesc ? 'is-generating' : ''}`}
                aria-label={
                  isGeneratingDesc
                    ? 'Açıklama hazırlanıyor...'
                    : recognizedKey
                    ? 'ZuuAI ile açıklama öner'
                    : 'Açıklama önerisi için geçerli bir kategori seçin'
                }
                title={
                  isGeneratingDesc
                    ? 'Açıklama hazırlanıyor...'
                    : recognizedKey
                    ? 'ZuuAI ile açıklama öner'
                    : 'Açıklama önerisi için geçerli bir kategori seçin'
                }
              >
                <IconSparkle size={13} className="category-sparkle-icon" />
              </button>
            </div>
            <div className="category-desc-status">
              {isGeneratingDesc ? (
                <span className="category-desc-status__generating">✨ ZuuAI açıklama üretiyor...</span>
              ) : recognizedKey ? (
                <span className="category-desc-status__hint">{recognizedCategoryItem.name} için ZuuAI önerisi hazır</span>
              ) : (
                <span className="category-desc-status__hint text-slate-400">Standart kategoriler için ZuuAI önerisi aktiftir</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category-order" className="mb-1.5 block text-sm font-medium text-slate-700">Görüntüleme sırası</label>
              <input id="category-order" name="displayOrder" type="number" min="0" value={form.displayOrder} onChange={updateField} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
            </div>
            <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-slate-700">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={updateField} className="h-4 w-4 accent-[#deff36]" /> Aktif
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => handleClose()} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Vazgeç</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors">{saving ? 'Kaydediliyor...' : category ? 'Değişiklikleri kaydet' : 'Kategori oluştur'}</button>
          </div>
        </form>
      </div>
    </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

const ThemeArtCard = ({ theme }) => {
  const isGrid = theme?.theme === 'GRID';
  const isDark = theme?.mode === 'DARK';
  const primary = theme?.primaryColor || '#1F2937';
  const bg = isDark ? '#0f172a' : '#f7f5f0';
  const surface = isDark ? '#1e293b' : '#dfe6ef';
  const surface2 = isDark ? '#334155' : '#f3f6fb';
  const accent = isGrid ? (theme?.primaryColor || '#f97316') : primary;

  if (isGrid) {
    return (
      <span className="stsm-art" style={{ background: bg }}>
        <span style={{ display: 'block', height: '.55rem', width: '40%', borderRadius: '4px', background: accent, marginBottom: '3px' }} />
        <span style={{ display: 'block', height: '1.4rem', width: '100%', borderRadius: '5px', background: `linear-gradient(90deg, ${surface}, ${surface2})`, marginBottom: '3px' }} />
        <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
          <span style={{ height: '1.4rem', borderRadius: '5px', background: `linear-gradient(90deg, ${surface}, ${surface2})` }} />
          <span style={{ height: '1.4rem', borderRadius: '5px', background: `linear-gradient(90deg, ${surface}, ${surface2})` }} />
        </span>
      </span>
    );
  }

  return (
    <span className="stsm-art" style={{ background: bg }}>
      <span style={{ display: 'block', height: '.85rem', width: '48%', borderRadius: '999px', background: primary, marginBottom: '3px' }} />
      <span style={{ display: 'block', height: '.35rem', width: '80%', borderRadius: '999px', background: surface, marginBottom: '4px' }} />
      <span style={{ display: 'block', height: '.65rem', width: '78%', borderRadius: '6px', background: surface, marginBottom: '2px' }} />
      <span style={{ display: 'block', height: '.65rem', width: '55%', borderRadius: '6px', background: surface2 }} />
    </span>
  );
};

const SavedThemeSelectionModal = ({ themes, activeThemeId, onClose, onApply, applying, onNewTheme, onEditTheme, onDeleteTheme }) => {
  const [selectedThemeId, setSelectedThemeId] = useState(activeThemeId ? String(activeThemeId) : '');
  const [isClosing, setIsClosing] = useState(false);
  const [themeToDelete, setThemeToDelete] = useState(null);
  const [isDeletingTheme, setIsDeletingTheme] = useState(false);

  const handleClose = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (typeof callback === 'function') {
        callback();
      } else if (typeof onClose === 'function') {
        onClose();
      }
    }, 220);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !themeToDelete) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing, themeToDelete]);

  useEffect(() => {
    setSelectedThemeId(activeThemeId ? String(activeThemeId) : '');
  }, [activeThemeId]);

  const options = [
    { id: '', name: 'Varsayılan', theme: buildDefaultMenuTemplate({ name: 'Varsayılan' }), description: 'Klasik menü' },
    ...themes.map((theme, index) => ({ id: String(theme._id || theme.id), name: theme.name, theme, description: theme.theme === 'GRID' ? 'Modern tema' : 'Varsayılan tema', index })),
  ];

  const canAddNewTheme = themes.length < 3; // En fazla 3 özel tema + 1 varsayılan = 4 tema

  return (
    <div
      className={`saved-theme-selection-backdrop ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
    >
      <div
        className={`saved-theme-selection-modal stsm-redesign ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-theme-selection-title"
      >
        <header className="saved-theme-selection-modal__header">
          <div>
            <p className="menu-publish-card__eyebrow">Menü özelleştirme ({options.length}/4 tema)</p>
            <h2 id="saved-theme-selection-title">Menü Tasarımını Seç</h2>
          </div>
          <button
            type="button"
            className="saved-theme-selection-modal__close"
            onClick={() => handleClose()}
            aria-label="Kapat"
          >
            ×
          </button>
        </header>
        {!canAddNewTheme && (
          <div className="stsm-limit-notice" role="status">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>En fazla 4 tema kaydedebilirsiniz. Yeni bir tema kaydetmek için mevcut temalarınızdan birini silmelisiniz.</span>
          </div>
        )}
        <div className="stsm-grid">
          {options.map((option) => (
            <div key={option.id || 'default'} className="stsm-card-wrapper">
              <button
                type="button"
                className={`stsm-card ${selectedThemeId === option.id ? 'is-selected' : ''}`}
                onClick={() => setSelectedThemeId(option.id)}
              >
                <ThemeArtCard theme={option.theme} />
                <span className="stsm-card__meta">
                  <strong>{option.name}</strong>
                  <small>{option.description}</small>
                  {selectedThemeId === option.id && <b>✓ Seçili</b>}
                </span>
              </button>
              {option.id !== '' && (
                <div className="stsm-card__actions">
                  <button
                    type="button"
                    className="stsm-card__edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose(() => onEditTheme(option.theme, option.index));
                    }}
                    title="Temayı Düzenle"
                    aria-label={`${option.name} temasını düzenle`}
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="stsm-card__delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThemeToDelete(option);
                    }}
                    title="Temayı Sil"
                    aria-label={`${option.name} temasını sil`}
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new theme button (only shown if limit not reached) */}
          {canAddNewTheme && (
            <button
              type="button"
              className="stsm-card stsm-card--new"
              onClick={() => handleClose(() => onNewTheme())}
              title="Yeni tema oluştur"
            >
              <span className="stsm-art stsm-art--new">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
              <span className="stsm-card__meta">
                <strong>Yeni Tema</strong>
                <small>Yeni özelleştirme</small>
              </span>
            </button>
          )}
        </div>
        <footer className="saved-theme-selection-modal__footer">
          <button type="button" className="publish-dialog__cancel" onClick={() => handleClose()}>Vazgeç</button>
          <button type="button" className="publish-dialog__confirm" onClick={() => onApply(selectedThemeId)} disabled={applying}>{applying ? 'Uygulanıyor...' : 'Seç ve Uygula'}</button>
        </footer>

        <ThemeDeleteConfirmDialog
          open={Boolean(themeToDelete)}
          themeName={themeToDelete?.name}
          deleting={isDeletingTheme}
          onCancel={() => setThemeToDelete(null)}
          onConfirm={async () => {
            if (!themeToDelete || typeof onDeleteTheme !== 'function') return;
            setIsDeletingTheme(true);
            try {
              await onDeleteTheme(themeToDelete.theme || themeToDelete);
              if (selectedThemeId === themeToDelete.id) {
                setSelectedThemeId('');
              }
              setThemeToDelete(null);
            } catch (_) {
              setThemeToDelete(null);
            } finally {
              setIsDeletingTheme(false);
            }
          }}
        />
      </div>
    </div>
  );
};

const StatusConfirmDialog = ({ statusDialog, onClose, onConfirm, actionId }) => {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (typeof callback === 'function') callback();
      else onClose();
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

  return (
    <div
      className={`publish-dialog-backdrop ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
    >
      <div
        className={`publish-dialog ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-dialog-title"
      >
        <h2 id="publish-dialog-title">
          {statusDialog.status === 'PUBLISHED' ? 'Menüyü yayınla' : statusDialog.status === 'DRAFT' ? 'Menüyü taslağa al' : 'Menüyü gizle'}
        </h2>
        <p>
          {statusDialog.status === 'PUBLISHED'
            ? 'Menünüz yayınlandığında müşteriler güncel menüyü görebilecek.'
            : statusDialog.status === 'DRAFT'
            ? 'Menünüz public linkte hazırlanıyor olarak görünecek.'
            : 'Menünüz public linkte geçici olarak erişime kapanacak.'}
        </p>
        <div className="publish-dialog__actions">
          <button type="button" onClick={() => handleClose()} className="publish-dialog__cancel">Vazgeç</button>
          <button
            type="button"
            onClick={() => handleClose(onConfirm)}
            disabled={actionId === 'menu-status'}
            className={statusDialog.status === 'HIDDEN' ? 'publish-dialog__confirm publish-dialog__confirm--danger' : 'publish-dialog__confirm'}
          >
            {statusDialog.status === 'PUBLISHED' ? 'Menüyü Yayınla' : statusDialog.status === 'DRAFT' ? 'Taslağa Al' : 'Menüyü Gizle'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuManagement = () => {
  const location = useLocation();
  const { user, restaurant } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [overview, setOverview] = useState(() => (
    restaurant ? {
      restaurant,
      stats: { menuStatus: restaurant.menuStatus || 'DRAFT' },
    } : null
  ));
  const [statusDialog, setStatusDialog] = useState(null);
  const [menuThemes, setMenuThemes] = useState([]);
  const [activeMenuThemeId, setActiveMenuThemeId] = useState(null);
  const [themeSelectionOpen, setThemeSelectionOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [editingThemeIndex, setEditingThemeIndex] = useState(null);
  const [highlightViewMenu, setHighlightViewMenu] = useState(false);

  useEffect(() => {
    if (restaurant && !overview) {
      setOverview({
        restaurant,
        stats: { menuStatus: restaurant.menuStatus || 'DRAFT' },
      });
    }
  }, [restaurant, overview]);

  useEffect(() => {
    if (!notice) return undefined;
    const clearTimer = window.setTimeout(() => setNotice(''), 3000);
    return () => { window.clearTimeout(clearTimer); };
  }, [notice]);

  useEffect(() => {
    if (!error) return undefined;
    const clearTimer = window.setTimeout(() => setError(''), 3000);
    return () => { window.clearTimeout(clearTimer); };
  }, [error]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [categoryData, productData, settingsData] = await Promise.all([
        menuService.getCategories(),
        menuService.getProducts(),
        restaurantSettingsService.get(),
      ]);
      setCategories(categoryData.categories || []);
      setProducts(productData.products || []);
      if (categoryData.restaurant) {
        setOverview({
          restaurant: categoryData.restaurant,
          stats: { menuStatus: categoryData.restaurant.menuStatus || 'DRAFT' },
        });
      }
      setMenuThemes(settingsData?.settings?.menuThemes || []);
      setActiveMenuThemeId(settingsData?.settings?.activeMenuThemeId || null);
      publicMenuService.clearCache();
    } catch (err) {
      setError(err.response?.data?.error || 'Kategoriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const updateMenuStatus = async () => {
    const nextStatus = statusDialog?.status;
    if (!nextStatus) return;
    setActionId('menu-status');
    setError('');
    try {
      const result = await menuService.updateStatus(nextStatus);
      setOverview((current) => ({ ...current, restaurant: { ...current?.restaurant, ...result.restaurant }, stats: { ...current?.stats, menuStatus: result.restaurant?.menuStatus || nextStatus } }));
      setNotice(result.message);
      setStatusDialog(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Menü durumu güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const menuStatus = overview?.stats?.menuStatus || overview?.restaurant?.menuStatus || 'DRAFT';
  const statusCopy = {
    PUBLISHED: ['Menünüz Yayında', 'Menünüz müşterileriniz için erişilebilir.', 'Taslağa Al', 'DRAFT'],
    HIDDEN: ['Menünüz şu anda gizli', 'Müşteriler menünüze erişemiyor.', 'Menüyü Yayınla', 'PUBLISHED'],
    DRAFT: ['Menünüz taslak halinde', 'Menünüz henüz yayınlanmadı.', 'Menüyü Yayınla', 'PUBLISHED'],
  }[menuStatus];

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (location.search.includes('import=1')) {
      window.setTimeout(() => document.getElementById('menu-import')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    }
  }, [location.search]);

  const showNotice = (message) => {
    setModalOpen(false);
    setEditingCategory(null);
    setNotice(message);
    loadData(true);
  };

  const toggleCategory = async (category) => {
    setActionId(category._id);
    setError('');
    try {
      const result = await menuService.toggleCategory(category._id);
      setNotice(result.message);
      await loadData(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori durumu güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const deleteCategory = async (category) => {
    setActionId(category._id);
    setError('');
    try {
      const result = await menuService.deleteCategory(category._id);
      setNotice(result.message);
      await loadData(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori silinemedi.');
    } finally {
      setActionId(null);
    }
  };

  const moveCategory = async (index, direction) => {
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= categories.length) return;
    const current = categories[index];
    const neighbor = categories[neighborIndex];
    if (current.displayOrder === neighbor.displayOrder) return;
    setActionId(current._id);
    setError('');
    try {
      await Promise.all([
        menuService.updateCategory(current._id, { displayOrder: neighbor.displayOrder }),
        menuService.updateCategory(neighbor._id, { displayOrder: current.displayOrder }),
      ]);
      setNotice('Kategori sırası güncellendi.');
      await loadData(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Kategori sırası güncellenemedi.');
    } finally {
      setActionId(null);
    }
  };

  const saveMenuThemes = async (themes) => {
    const result = await restaurantSettingsService.update({ menuThemes: themes });
    setMenuThemes(result.settings?.menuThemes || themes);
    return result.settings;
  };

  const selectMenuTheme = async (value, themeObj = null) => {
    const nextThemeId = value || null;
    setActionId('menu-theme');
    setError('');
    try {
      const selectedObj = themeObj || (nextThemeId
        ? menuThemes.find((t) => String(t._id || t.id) === String(nextThemeId))
        : null);
      const payload = nextThemeId
        ? {
            activeMenuThemeId: nextThemeId,
            activeMenuId: nextThemeId,
            theme: selectedObj?.theme || 'DEFAULT',
            mode: selectedObj?.mode || 'LIGHT',
            primaryColor: selectedObj?.primaryColor || '#1F2937',
            secondaryColor: selectedObj?.secondaryColor || '#FFFFFF',
          }
        : {
            activeMenuThemeId: null,
            activeMenuId: null,
            theme: 'DEFAULT',
            mode: 'LIGHT',
            primaryColor: '#1F2937',
            secondaryColor: '#FFFFFF',
          };
      const result = await restaurantSettingsService.update(payload);
      setActiveMenuThemeId(nextThemeId);
      if (result.settings?.menuThemes) {
        setMenuThemes(result.settings.menuThemes);
      }
      publicMenuService.clearCache();
      setNotice(nextThemeId ? 'Menü teması seçildi.' : 'Varsayılan menü görünümüne dönüldü.');
      setThemeSelectionOpen(false);
      return result.settings;
    } catch (err) {
      setError(err.response?.data?.error || 'Menü teması seçilemedi.');
    } finally {
      setActionId(null);
    }
  };

  const handleOpenCustomization = () => {
    if (menuThemes.length >= 3) {
      setNotice('En fazla 4 tema kaydedebilirsiniz (3 özel tema + 1 varsayılan). Düzenlemek istediğiniz temayı seçebilirsiniz.');
      setThemeSelectionOpen(true);
      return;
    }

    setEditingTheme(null);
    setEditingThemeIndex(null);
    setCustomizationOpen(true);
  };

  return (
    <RestaurantLayout>
      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-600">Menü</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Menünüzü buradan yönetin</h2>
            <p className="mt-1 text-sm text-slate-500">Kategorilerinizi oluşturun, düzenleyin ve menü sıralamanızı belirleyin.</p>
          </div>
          {user?.username && (
            <PublicMenuButton
              username={user?.username}
              label="Menüyü Görüntüle"
              compact
              brand
              highlighted={highlightViewMenu}
              onHighlightDismiss={() => setHighlightViewMenu(false)}
            />
          )}
        </section>
        {notice && typeof document !== 'undefined' && createPortal(
          <div key={notice} className="site-global-toast site-global-toast--success" role="status">
            <span>✓</span>
            <span>{notice}</span>
          </div>,
          document.body
        )}
        {error && typeof document !== 'undefined' && createPortal(
          <div key={error} className="site-global-toast site-global-toast--error" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>,
          document.body
        )}
        <div className="menu-management-header-grid">
          {overview ? (
            <section className="menu-publish-card">
              <div className="menu-publish-card__header">
                <div>
                  <p className="menu-publish-card__eyebrow">Yayın Durumu</p>
                  <h3>{statusCopy[0]}</h3>
                  <p>{statusCopy[1]}</p>
                  {overview.restaurant?.publishedAt && (
                    <small>Son yayın: {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(overview.restaurant.publishedAt))}</small>
                  )}
                </div>
                <div className="menu-status-switcher" role="group" aria-label="Menü görünürlüğü">
                  {[['DRAFT', 'Taslak'], ['PUBLISHED', 'Yayında'], ['HIDDEN', 'Gizli']].map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      className={`${menuStatus === value ? 'is-active ' : ''}menu-status-switcher__${value.toLowerCase()}`}
                      disabled={actionId === 'menu-status'}
                      onClick={() => menuStatus !== value && setStatusDialog({ status: value })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="menu-publish-card menu-publish-card--skeleton">
              <div className="menu-publish-card__header">
                <div>
                  <span className="dashboard-skeleton__line dashboard-skeleton__eyebrow" style={{ width: '80px', display: 'block' }} />
                  <span className="dashboard-skeleton__line dashboard-skeleton__heading" style={{ width: '160px', height: '1.4rem', marginTop: '6px', display: 'block' }} />
                  <span className="dashboard-skeleton__line dashboard-skeleton__short" style={{ width: '220px', marginTop: '6px', display: 'block' }} />
                </div>
                <div className="menu-status-switcher" style={{ opacity: 0.6, pointerEvents: 'none' }}>
                  <button type="button" className="is-active">Taslak</button>
                  <button type="button">Yayında</button>
                  <button type="button">Gizli</button>
                </div>
              </div>
            </section>
          )}
          <section className="menu-customization-entry"><div className="menu-customization-entry__header"><div><p className="menu-publish-card__eyebrow">Tasarım</p><h3>Menü Özelleştirme</h3><p>Temanızı, tipografinizi ve ürün görünümünü beğeninize göre tasarlayın.</p></div></div><div className="menu-customization-entry__actions"><button type="button" className="menu-customization-entry__edit" onClick={() => setThemeSelectionOpen(true)} aria-label="Kayıtlı menü tasarımını seç" title="Kayıtlı menü tasarımını seç"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m4 16.5-.8 4.3 4.3-.8L19.2 8.3a2.4 2.4 0 0 0-3.4-3.4L4 16.5Z" /><path d="m14.5 6.5 3 3" /></svg></button><button type="button" onClick={handleOpenCustomization} className="menu-customization-entry__button"><span>✦</span> Özelleştir</button></div></section>
        </div>
        <MenuImportPanel onImported={(message) => { setNotice(message); loadData(true); }} />
        {loading ? (
          <DashboardSkeleton variant="menu" />
        ) : (
          <MenuStructureEditor
            categories={categories}
            products={products}
            actionId={actionId}
            onEditCategory={(category) => { setEditingCategory(category); setModalOpen(true); }}
            onToggleCategory={toggleCategory}
            onDeleteCategory={deleteCategory}
            onAddCategory={() => { setEditingCategory(null); setModalOpen(true); }}
            onMessage={(message, isError = false) => { if (isError) setError(message); else setNotice(message); }}
            onRefresh={() => loadData(true)}
          />
        )}
      </div>
      {modalOpen && <CategoryModal category={editingCategory} nextOrder={categories.length} onClose={() => { setModalOpen(false); setEditingCategory(null); }} onSaved={showNotice} />}
      {themeSelectionOpen && (
        <SavedThemeSelectionModal
          themes={menuThemes}
          activeThemeId={activeMenuThemeId}
          onClose={() => setThemeSelectionOpen(false)}
          onApply={selectMenuTheme}
          applying={actionId === 'menu-theme'}
          onNewTheme={() => {
            setEditingTheme(null);
            setEditingThemeIndex(null);
            setThemeSelectionOpen(false);
            setCustomizationOpen(true);
          }}
          onEditTheme={(theme, index) => {
            setEditingTheme(theme);
            setEditingThemeIndex(index);
            setThemeSelectionOpen(false);
            setCustomizationOpen(true);
          }}
          onDeleteTheme={async (themeToDelete) => {
            const deleteId = themeToDelete._id || themeToDelete.id;
            const remainingThemes = menuThemes.filter((t) => String(t._id || t.id) !== String(deleteId));
            const isDeletedActive = String(activeMenuThemeId) === String(deleteId);
            const payload = {
              menuThemes: remainingThemes,
              ...(isDeletedActive
                ? { activeMenuThemeId: null, activeMenuId: null, theme: 'DEFAULT', mode: 'LIGHT', primaryColor: '#1F2937', secondaryColor: '#FFFFFF' }
                : {}),
            };
            const result = await restaurantSettingsService.update(payload);
            setMenuThemes(result.settings?.menuThemes || remainingThemes);
            if (isDeletedActive) {
              setActiveMenuThemeId(null);
            }
            publicMenuService.clearCache();
            setNotice('Tema silindi.');
            return result.settings;
          }}
        />
      )}
      {customizationOpen && (
        <MenuCustomizationCompactModal
          themes={menuThemes}
          initialMenu={editingTheme}
          editingIndex={editingThemeIndex}
          restaurant={overview?.restaurant || restaurant}
          onClose={() => {
            setCustomizationOpen(false);
            setEditingTheme(null);
            setEditingThemeIndex(null);
          }}
          onSaved={async (themes, savedPayload, savedIndex) => {
            const isEditing = typeof savedIndex === 'number' && savedIndex >= 0;
            const settings = await saveMenuThemes(themes);
            const savedList = settings?.menuThemes || themes;
            if (settings?.menuThemes) setMenuThemes(settings.menuThemes);

            // Invalidate cache immediately so public menu shows fresh settings
            publicMenuService.clearCache();

            // Find the saved theme from the returned list
            let targetTheme = null;
            if (isEditing && savedList[savedIndex]) {
              targetTheme = savedList[savedIndex];
            } else if (savedPayload?.name) {
              targetTheme = savedList.slice().reverse().find((t) => t.name === savedPayload.name) || savedList[savedList.length - 1];
            } else if (savedList.length > 0) {
              targetTheme = savedList[savedList.length - 1];
            }

            const targetThemeId = targetTheme?._id || targetTheme?.id;

            // Direct selection: Immediately set as active menu
            if (targetThemeId) {
              await selectMenuTheme(targetThemeId, targetTheme || savedPayload);
            }

            publicMenuService.clearCache();
            setNotice('');
            setTimeout(() => setNotice(isEditing ? 'Tema güncellendi ve menü olarak uygulandı.' : 'Tema kaydedildi ve yeni menü olarak seçildi.'), 50);
            setHighlightViewMenu(true);
            setTimeout(() => setHighlightViewMenu(false), 9000);
            return settings;
          }}
          onDelete={async (remainingThemes, deletedId) => {
            const isDeletedActive = String(activeMenuThemeId) === String(deletedId);
            const payload = {
              menuThemes: remainingThemes,
              ...(isDeletedActive
                ? { activeMenuThemeId: null, activeMenuId: null, theme: 'DEFAULT', mode: 'LIGHT', primaryColor: '#1F2937', secondaryColor: '#FFFFFF' }
                : {}),
            };
            const result = await restaurantSettingsService.update(payload);
            setMenuThemes(result.settings?.menuThemes || remainingThemes);
            if (isDeletedActive) {
              setActiveMenuThemeId(null);
            }
            publicMenuService.clearCache();
            setNotice('Tema silindi.');
            return result.settings;
          }}
        />
      )}
      {statusDialog && (
        <StatusConfirmDialog
          statusDialog={statusDialog}
          onClose={() => setStatusDialog(null)}
          onConfirm={updateMenuStatus}
          actionId={actionId}
        />
      )}
    </RestaurantLayout>
  );
};

export default MenuManagement;