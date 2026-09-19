import { useEffect, useRef, useState } from 'react';
import FeaturedStories from './public-menu/FeaturedStories';
import CategoryNavigation from './public-menu/CategoryNavigation';
import CategorySection from './public-menu/CategorySection';
import MenuHeader from './public-menu/MenuHeader';
import MenuHeroCover from './public-menu/MenuHeroCover';
import CategoryCardGrid from './public-menu/CategoryCardGrid';
import { getPublicMenuTheme, publicMenuFonts, publicMenuThemes } from '../utils/publicMenuTheme';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

const previewDemoRestaurant = {
  name: 'Demo Restoran',
  description: 'Geleneksel & Modern Lezzetler',
  coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  logo: null,
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
};

const previewDemoCategories = [
  {
    id: 'baslangiclar',
    name: 'Başlangıçlar',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 'p1', name: 'Çıtır Tavuk Parçaları', shortDescription: 'Kızarmış patates, özel dip sos ve taze yeşillik', price: 280, oldPrice: 320, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p2', name: 'Akdeniz Salatası', shortDescription: 'Zeytin, domates, tulum peyniri ve fesleğenli zeytinyağı sosu', price: 240, oldPrice: null, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'ana-yemekler',
    name: 'Ana Yemekler',
    image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 'p3', name: 'Trüflü Makarna', shortDescription: 'Parmesan, taze mantar ve trüf yağı', price: 420, oldPrice: 450, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p4', name: 'Izgara Somon & Kuşkonmaz', shortDescription: 'Limonlu tereyağı sosu ve fırınlanmış bebek patates', price: 490, oldPrice: 530, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'burger-wrap',
    name: 'Burger & Dürüm',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 'p7', name: 'Trüflü Dana Burger', shortDescription: 'Karamelize soğan, trüf mayonez ve patates kızartması', price: 380, oldPrice: null, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p8', name: 'Çıtır Tavuk Dürüm', shortDescription: 'Cheddar sos, turşu ve taze yeşillikler', price: 270, oldPrice: 295, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'pizza-firin',
    name: 'Taş Fırın & Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 'p9', name: 'Odun Ateşinde Margherita', shortDescription: 'San Marzano domates, taze mozzarella ve fesleğen', price: 340, oldPrice: null, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p10', name: 'Dört Peynirli İtalyan Pizza', shortDescription: 'Mozzarella, gorgonzola, parmesan ve gouda peyniri', price: 390, oldPrice: 420, image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'tatlilar',
    name: 'Tatlılar',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 'p5', name: 'San Sebastian Cheesecake', shortDescription: 'Karamelize kremalı enfes klasik tatlı', price: 190, oldPrice: null, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
      { id: 'p6', name: 'Bourbon Brownie', shortDescription: 'Ceviz, bitter çikolata ve vanilyalı dondurma', price: 170, oldPrice: 200, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
  {
    id: 'icecekler',
    name: 'İçecekler & Kahve',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    products: [
      { id: 'p11', name: 'Ev Yapımı Çilekli Limonata', shortDescription: 'Taze nane yaprakları ve çilek taneleri', price: 120, oldPrice: null, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', isFeatured: true, isAvailable: true },
      { id: 'p12', name: 'Karamel Macchiato', shortDescription: 'Espresso, vanilya şurubu, süt kreması ve karamel', price: 135, oldPrice: null, image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80', isFeatured: false, isAvailable: true },
    ],
  },
];

const themeOptions = [
  { value: 'DEFAULT', label: 'Varsayılan', accent: '#1F2937', description: 'Temel ve güvenli', kind: 'Standart görünüm' },
  { value: 'GRID', label: 'Modern', accent: '#f97316', description: 'Büyük görsel kapak & bento kartlar', kind: 'Kategori kartları' },
];
const fonts = ['Inter', 'DM Sans', 'Playfair Display', 'Lora'];
const fontMeta = {
  Inter: 'Modern & temiz',
  'DM Sans': 'Yumuşak & modern',
  'Playfair Display': 'Zarif & klasik',
  Lora: 'Editoryal & sıcak',
};
const structures = [
  {
    value: 'STANDARD',
    label: 'Görsel Odaklı Standart',
    description: 'Büyük ürün görselleri, detaylı açıklamalar ve öne çıkan rozetleri.',
    highlights: ['Kart formatı', 'Geniş fotoğraf alanı', 'Açıklama & fiyat vurgusu'],
  },
  {
    value: 'COMPACT',
    label: 'Kompakt Hızlı Liste',
    description: 'Daha sıkı aralıklar, hızlı taranabilir küçük görseller ve fiyat satırları.',
    highlights: ['Yoğun yerleşim', 'Hızlı sipariş akışı', 'Daha az dikey kaydırma'],
  },
  {
    value: 'EDITORIAL',
    label: 'Geniş Kart Editoryal',
    description: 'Dergi benzeri tipografi, ferah boşluklar ve güçlü ürün kartları.',
    highlights: ['Geniş başlıklar', 'Ferah boşluklar', 'Premium restoran hissi'],
  },
];

const palettePresets = [
  {
    name: 'Sıcak Amber',
    badge: 'Popüler',
    preview: ['#1F2937', '#B45309', '#FFFDF8'],
    themes: [
      { name: 'Koyu Menü', mode: 'DARK', primaryColor: '#F59E0B', secondaryColor: '#1F2937' },
      { name: 'Açık Menü', mode: 'LIGHT', primaryColor: '#B45309', secondaryColor: '#FFFDF8' },
    ],
  },
  {
    name: 'Modern Adaçayı',
    badge: 'Sakin',
    preview: ['#132A13', '#31572C', '#F7F9F6'],
    themes: [
      { name: 'Orman Koyu', mode: 'DARK', primaryColor: '#90A955', secondaryColor: '#132A13' },
      { name: 'Adaçayı Açık', mode: 'LIGHT', primaryColor: '#31572C', secondaryColor: '#F7F9F6' },
    ],
  },
  {
    name: 'Gece Mavisi',
    badge: 'Premium',
    preview: ['#0F172A', '#2563EB', '#F8FAFC'],
    themes: [
      { name: 'Gece Koyu', mode: 'DARK', primaryColor: '#60A5FA', secondaryColor: '#0F172A' },
      { name: 'Buzul Açık', mode: 'LIGHT', primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC' },
    ],
  },
  {
    name: 'Zarif Şarap',
    badge: 'Şık',
    preview: ['#3B0910', '#881337', '#FFF5F5'],
    themes: [
      { name: 'Kadife Koyu', mode: 'DARK', primaryColor: '#FB7185', secondaryColor: '#2A060C' },
      { name: 'Gül Açık', mode: 'LIGHT', primaryColor: '#881337', secondaryColor: '#FFF5F5' },
    ],
  },
];

const defaults = {
  name: '',
  theme: 'DEFAULT',
  mode: 'LIGHT',
  font: 'Inter',
  primaryColor: '#1F2937',
  secondaryColor: '#FFFFFF',
  layout: { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD', showStories: true },
};

export const buildDefaultMenuTemplate = (overrides = {}) => ({
  ...defaults,
  name: overrides.name !== undefined ? overrides.name : 'Varsayılan Menü',
  theme: 'DEFAULT',
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
  const previewShellRef = useRef(null);
  const [previewGridCategory, setPreviewGridCategory] = useState(null);
  const [previewDefaultCategory, setPreviewDefaultCategory] = useState(previewDemoCategories[0].id);
  const previewTheme = getPublicMenuTheme(draft.theme || 'DEFAULT', draft.mode || 'LIGHT');
  const previewMode = draft.mode || 'LIGHT';
  const previewLayout = draft.layout || defaults.layout;
  const previewPrimary = draft.primaryColor || previewDemoRestaurant.primaryColor || '#1F2937';
  const previewSecondary = draft.secondaryColor || (draft.mode === 'DARK' ? '#f4efe8' : '#fffdf8');
  const previewStyle = {
    '--menu-primary': previewPrimary,
    '--menu-secondary': previewSecondary,
    '--menu-bg': previewTheme.background,
    '--menu-surface': previewTheme.surface,
    '--menu-text': previewTheme.text,
    '--menu-muted': previewTheme.muted,
    '--menu-border': previewTheme.border,
    '--menu-radius': previewTheme.radius,
    '--menu-shadow': previewTheme.shadow,
    '--menu-font': publicMenuFonts[draft.font] || publicMenuFonts.Inter,
  };

  const isGridTheme = draft.theme === 'GRID';

  useEffect(() => {
    if (previewShellRef.current) {
      previewShellRef.current.scrollTop = 0;
    }
  }, [draft.theme, draft.mode, previewGridCategory]);

  const handleDefaultCategorySelect = (id) => {
    setPreviewDefaultCategory(id);
    const container = previewShellRef.current;
    if (!container) return;

    if (id === previewDemoCategories[0]?.id) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = container.querySelector(`#preview-cat-${id}`);
    if (target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offsetTop = targetRect.top - containerRect.top + container.scrollTop;
      container.scrollTo({
        top: Math.max(0, offsetTop - 52),
        behavior: 'smooth',
      });
    }
  };

  return (
    <div ref={previewShellRef} className="public-menu-shell preview-menu-shell" data-theme={draft.theme || 'DEFAULT'} data-mode={previewMode} data-layout={previewLayout.style || 'STANDARD'} data-show-featured={previewLayout.emphasizeFeatured !== false} style={previewStyle}>
      <div className="public-menu-page preview-public-page">
        {isGridTheme ? (
          <>
            <header className={`public-header public-header--grid-category ${!previewGridCategory ? 'is-grid-home' : ''}`} data-mode={previewMode}>
              <div className="public-header--grid__top-bar">
                <button
                  type="button"
                  className="header-control header-control--hamburger"
                  onClick={() => {
                    setPreviewGridCategory(null);
                    if (previewShellRef.current) previewShellRef.current.scrollTop = 0;
                  }}
                  aria-label="Kategorileri aç"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round">
                    <line x1="3.5" y1="6" x2="20.5" y2="6" />
                    <line x1="3.5" y1="12" x2="20.5" y2="12" />
                    <line x1="3.5" y1="18" x2="20.5" y2="18" />
                  </svg>
                </button>

                <div
                  className="public-header--grid__identity"
                  onClick={() => {
                    setPreviewGridCategory(null);
                    if (previewShellRef.current) previewShellRef.current.scrollTop = 0;
                  }}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setPreviewGridCategory(null);
                      if (previewShellRef.current) previewShellRef.current.scrollTop = 0;
                    }
                  }}
                  aria-label="Kategorilere dön"
                >
                  {previewDemoRestaurant.logo ? (
                    <img
                      src={previewDemoRestaurant.logo}
                      alt={previewDemoRestaurant.name}
                      className="public-header--grid__logo-img"
                    />
                  ) : (
                    <span className="public-header--grid__title">{previewDemoRestaurant.name}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="header-control header-control--search"
                  onClick={() => {}}
                  aria-label="Restoran bilgileri"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </button>
              </div>

              {previewGridCategory && (
                <div className="grid-category-nav-wrapper">
                  <CategoryNavigation
                    categories={previewDemoCategories}
                    activeCategory={previewGridCategory}
                    onSelect={(id) => {
                      setPreviewGridCategory(id);
                      if (previewShellRef.current) previewShellRef.current.scrollTop = 0;
                    }}
                  />
                </div>
              )}
            </header>

            {!previewGridCategory && (
              <CategoryCardGrid
                categories={previewDemoCategories}
                onSelectCategory={(id) => {
                  setPreviewGridCategory(id);
                  if (previewShellRef.current) previewShellRef.current.scrollTop = 0;
                }}
              />
            )}
          </>
        ) : (
          <>
            <MenuHeader
              restaurant={previewDemoRestaurant}
              onOpenCategories={() => {}}
              onOpenInfo={() => {}}
            />
            <CategoryNavigation
              categories={previewDemoCategories}
              activeCategory={previewDefaultCategory}
              onSelect={handleDefaultCategorySelect}
            />
            {previewLayout.showStories && (
              <FeaturedStories
                products={previewDemoCategories.flatMap((category) => category.products)}
                onSelect={() => {}}
              />
            )}
          </>
        )}

        {(!isGridTheme || previewGridCategory) && (
          <main className="public-menu-content preview-menu-content">
            {isGridTheme ? (
              (() => {
                const activeCat = previewDemoCategories.find((c) => c.id === previewGridCategory) || previewDemoCategories[0];
                return activeCat ? (
                  <CategorySection key={activeCat.id} category={activeCat} layout={previewLayout} onProductSelect={() => {}} themeKey={draft.theme} />
                ) : null;
              })()
            ) : (
              previewDemoCategories.map((category) => (
                <div key={category.id} id={`preview-cat-${category.id}`}>
                  <CategorySection category={category} layout={previewLayout} onProductSelect={() => {}} themeKey={draft.theme} />
                </div>
              ))
            )}
          </main>
        )}

        <footer className="public-footer">zuuqrmenu <span>•</span> Dijital Menü</footer>
      </div>
    </div>
  );
};

const MenuCustomizationCompactModal = ({ themes, onClose, onSaved, onDelete = null, editingIndex = null, initialMenu = null }) => {
  useBodyScrollLock(true);
  const [savedThemes, setSavedThemes] = useState(Array.isArray(themes) ? themes : []);
  const [draft, setDraft] = useState(() => (initialMenu ? normalize(initialMenu) : buildDefaultMenuTemplate({ name: '' })));
  const [feedback, setFeedback] = useState({ kind: 'idle', message: '', id: 0, isHiding: false });
  const [nameError, setNameError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const feedbackTimeoutRef = useRef(null);

  const isEditingExisting = Boolean(initialMenu && (initialMenu._id || initialMenu.id || typeof editingIndex === 'number'));

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      if (typeof onClose === 'function') {
        onClose();
      }
    }, 220);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

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
    if (initialMenu) {
      setDraft(normalize(initialMenu));
    } else {
      setDraft(buildDefaultMenuTemplate({ name: '' }));
    }
  }, [initialMenu]);

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
    }, 2200);
  };

  const update = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError('');
    setFeedback({ kind: 'idle', message: '', id: Date.now() + Math.random() });
  };
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
      const hasEditingIndex = typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < next.length;
      const targetId = draft?._id || draft?.id || initialMenu?._id || initialMenu?.id;
      const existingIndex = hasEditingIndex
        ? editingIndex
        : (targetId ? next.findIndex((item) => String(item?._id || item?.id) === String(targetId)) : -1);

      if (existingIndex >= 0) {
        const existingItem = next[existingIndex];
        const existingId = existingItem?._id || existingItem?.id;
        next[existingIndex] = {
          ...payload,
          ...(existingId ? { _id: existingId } : {}),
        };
      } else if (next.length >= 3) {
        setError('En fazla 3 özel tema (toplam 4 tema) kaydedebilirsiniz.');
        setNameError(false);
        triggerFeedback('error', 'En fazla 3 özel tema (toplam 4 tema) kaydedebilirsiniz.');
        return;
      } else {
        const { _id, id, ...newThemePayload } = payload;
        next.push(newThemePayload);
      }

      const settings = await onSaved(next, payload, existingIndex >= 0 ? existingIndex : null);
      const result = settings?.savedMenus || settings?.menuThemes || next;
      setSavedThemes(result);
      setError('');
      triggerFeedback('success', existingIndex >= 0 ? 'Tema güncellendi.' : 'Tema kaydedildi.');
      handleClose();
    } catch (err) {
      const message = err?.response?.data?.error || 'Menü kaydedilemedi. Lütfen tekrar deneyin.';
      setError(message);
      setNameError(false);
      triggerFeedback('error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheme = async () => {
    if (typeof onDelete !== 'function') {
      setDeleteConfirmOpen(false);
      return;
    }
    setDeleting(true);
    try {
      const next = Array.isArray(savedThemes) ? [...savedThemes] : [];
      const targetId = draft?._id || draft?.id || initialMenu?._id || initialMenu?.id;
      const hasEditingIndex = typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < next.length;
      const targetIndex = hasEditingIndex
        ? editingIndex
        : (targetId ? next.findIndex((item) => String(item?._id || item?.id) === String(targetId)) : -1);

      if (targetIndex >= 0) {
        const deletedItem = next[targetIndex];
        const deletedId = deletedItem?._id || deletedItem?.id || targetId;
        next.splice(targetIndex, 1);
        await onDelete(next, deletedId, targetIndex);
      }
      setDeleteConfirmOpen(false);
      handleClose();
    } catch (err) {
      const message = err?.response?.data?.error || 'Tema silinemedi. Lütfen tekrar deneyin.';
      setError(message);
      triggerFeedback('error', message);
      setDeleteConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const preview = getPublicMenuTheme(draft.theme, draft.mode || 'LIGHT');
  const fontStack = publicMenuFonts[draft.font] || publicMenuFonts.Inter;
  const showPreviewSection = !isMobileViewport || showMobilePreview;

  return (
    <div className={`menu-compact-backdrop ${isClosing ? 'is-closing' : ''}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
      <div className={`menu-compact-modal ${isClosing ? 'is-closing' : ''} ${feedback.kind === 'error' ? 'is-invalid' : ''} ${feedback.kind === 'success' ? 'is-success' : ''}`} role="dialog" aria-modal="true" aria-labelledby="menu-compact-title">
        <header className="menu-compact-header">
          <div className="menu-compact-header__title-wrap">
            <span className="menu-compact-kicker">MENÜ TASARIMI</span>
            <h2 id="menu-compact-title">Menü Tasarımı</h2>
            <p>Menünüzün görünümünü ve sunumunu özelleştirin.</p>
          </div>

          <div className="menu-compact-header__actions">
            <div className={`menu-theme-name-box ${nameError ? 'is-invalid' : ''}`}>
              <span className="menu-theme-name-box__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </span>
              <input
                type="text"
                value={draft.name || ''}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, name: event.target.value }));
                  setNameError(false);
                  setError('');
                  setFeedback({ kind: 'idle', message: '', id: Date.now() + Math.random() });
                }}
                className="menu-theme-name-box__input"
                aria-label="Tema adı"
                aria-invalid={nameError}
                placeholder="Tema adı girin..."
              />
            </div>

            {isEditingExisting && (
              <button
                type="button"
                className="menu-compact-delete-btn"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={saving || deleting}
                title="Temayı Sil"
                aria-label="Temayı Sil"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <span>Sil</span>
              </button>
            )}

            <button
              type="button"
              className="menu-compact-save"
              onClick={save}
              disabled={saving}
              aria-label="Kaydet"
              title={saving ? 'Kaydediliyor...' : 'Kaydet'}
            >
              {saving ? (
                <>
                  <span className="menu-compact-spinner" aria-hidden="true" />
                  <span>Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Kaydet</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="menu-compact-close-btn"
              onClick={handleClose}
              aria-label="Kapat"
              title="Kapat"
            >
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
                      {option.value === 'GRID' ? (
                        <span className="menu-theme-card__art" style={{ background: '#0f172a' }}>
                          <span style={{ display: 'block', height: '0.6rem', width: '38%', borderRadius: '4px', background: '#f97316' }} />
                          <span style={{ display: 'block', height: '1.5rem', width: '100%', borderRadius: '6px', background: 'linear-gradient(90deg, #1e293b, #334155)', margin: '2px 0' }} />
                          <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', width: '100%' }}>
                            <span style={{ height: '1.5rem', borderRadius: '5px', background: 'linear-gradient(90deg, #1e293b, #334155)' }} />
                            <span style={{ height: '1.5rem', borderRadius: '5px', background: 'linear-gradient(90deg, #1e293b, #334155)' }} />
                          </span>
                        </span>
                      ) : (
                        <span className="menu-theme-card__art" style={{ background: '#f7f5f0' }}>
                          <span className="menu-theme-card__header" style={{ background: '#1f2937' }} />
                          <span className="menu-theme-card__nav" style={{ background: '#eef2f7' }} />
                          <span className="menu-theme-card__item" style={{ background: '#dfe6ef' }} />
                          <span className="menu-theme-card__item menu-theme-card__item--secondary" style={{ background: '#f3f6fb' }} />
                        </span>
                      )}
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
                    ['showStories', 'Hikayeler alanını göster', 'Öne çıkan ürünleri menüde hikaye kartları olarak göster.'],
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

        <ThemeDeleteConfirmDialog
          open={deleteConfirmOpen}
          themeName={draft.name}
          deleting={deleting}
          onCancel={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteTheme}
        />
      </div>
    </div>
  );
};

const ThemeDeleteConfirmDialog = ({ open, themeName, deleting, onCancel, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsClosing(false);
      return;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deleting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, deleting]);

  if (!open) return null;

  const handleClose = () => {
    if (deleting || isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel();
    }, 200);
  };

  return (
    <div
      className={`publish-dialog-backdrop ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
    >
      <div className={`publish-dialog ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="theme-delete-confirm-title">
        <h2 id="theme-delete-confirm-title">Temayı Sil</h2>
        <p>
          <strong>{themeName || 'Bu temayı'}</strong> silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div className="publish-dialog__actions">
          <button
            type="button"
            className="publish-dialog__cancel"
            onClick={handleClose}
            disabled={deleting}
          >
            Vazgeç
          </button>
          <button
            type="button"
            className="publish-dialog__confirm publish-dialog__confirm--danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Siliniyor...' : 'Temayı Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCustomizationCompactModal;

