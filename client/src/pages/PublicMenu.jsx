import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryNavigation from '../components/public-menu/CategoryNavigation';
import CategorySection from '../components/public-menu/CategorySection';
import MenuHeader from '../components/public-menu/MenuHeader';
import ProductDetailModal from '../components/public-menu/ProductDetailModal';
import InfoDrawer from '../components/public-menu/InfoDrawer';
import ReviewSheet from '../components/public-menu/ReviewSheet';
import SearchSheet from '../components/public-menu/SearchSheet';
import SeoHead from '../components/SeoHead';
import FeaturedStories from '../components/public-menu/FeaturedStories';
import MenuHeroCover from '../components/public-menu/MenuHeroCover';
import CategoryCardGrid from '../components/public-menu/CategoryCardGrid';
import { publicMenuService } from '../services/publicMenuService';
import { getPublicMenuTheme, publicMenuFonts } from '../utils/publicMenuTheme';
import { trackEvent } from '../utils/analytics';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import BlurImage from '../components/common/BlurImage';
import PublicMenuSkeleton from '../components/public-menu/PublicMenuSkeleton';
import { searchProducts } from '../utils/menuSearch';

const langOptions = [
  { code: 'tr', label: 'Türkçe', short: 'TR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
];

const PublicMenu = () => {
  const { username } = useParams();
  const publicSiteOrigin = 'https://zuuqrmenu.com';
  const cachedMenu = publicMenuService.getCachedMenu(username);
  const [data, setData] = useState(() => cachedMenu);
  const [status, setStatus] = useState(() => {
    if (!cachedMenu) return 'loading';
    if (cachedMenu.status === 'PREPARING' || cachedMenu.status === 'HIDDEN') {
      return cachedMenu.status === 'HIDDEN' ? 'hidden' : 'preparing';
    }
    return 'ready';
  });
  const [selectedGridCategory, setSelectedGridCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(() => cachedMenu?.categories?.[0]?.id || '');
  const [drawer, setDrawer] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const [language, setLanguage] = useState(() => localStorage.getItem('zuulab-language') || 'tr');
  const [showTop, setShowTop] = useState(false);
  const categoryScrollLock = useRef(false);
  const categoryScrollTimer = useRef(null);

  const resetScrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useLayoutEffect(() => {
    resetScrollToTop();
    const rafId = requestAnimationFrame(() => {
      resetScrollToTop();
    });
    return () => cancelAnimationFrame(rafId);
  }, [selectedGridCategory]);

  useEffect(() => {
    if (!langDropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [langDropdownOpen]);

  useEffect(() => {
    let mounted = true;
    const existing = publicMenuService.getCachedMenu(username);
    if (!existing) {
      setStatus('loading');
    }
    publicMenuService.getMenu(username, true)
      .then((result) => {
        if (!mounted) return;
        setData(result);
        if (result.status === 'PREPARING' || result.status === 'HIDDEN') {
          setStatus(result.status === 'HIDDEN' ? 'hidden' : 'preparing');
          return;
        }
        setActiveCategory((prev) => prev || result.categories[0]?.id || '');
        setStatus('ready');
      })
      .catch(() => {
        if (mounted && !existing) setStatus('unavailable');
      });
    return () => { mounted = false; };
  }, [username]);

  // Silently sync latest menu when returning to tab from Dashboard or other windows
  useEffect(() => {
    if (!username) return undefined;
    const syncLatestMenu = () => {
      if (document.visibilityState === 'visible') {
        publicMenuService.getMenu(username, true)
          .then((result) => {
            if (result && result.categories) {
              setData(result);
            }
          })
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', syncLatestMenu);
    window.addEventListener('focus', syncLatestMenu);
    return () => {
      document.removeEventListener('visibilitychange', syncLatestMenu);
      window.removeEventListener('focus', syncLatestMenu);
    };
  }, [username]);

  const categoryIds = useMemo(() => data?.categories.map((category) => `category-${category.id}`) || [], [data]);

  useEffect(() => {
    if (!data?.categories.length) return undefined;
    const updateActiveCategory = () => {
      if (categoryScrollLock.current) return;
      const sections = categoryIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      const visibleCategory = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 180);
      if (visibleCategory) {
        const nextCategory = visibleCategory.id.replace('category-', '');
        setActiveCategory((current) => current === nextCategory ? current : nextCategory);
      }
    };
    updateActiveCategory();
    window.addEventListener('scroll', updateActiveCategory, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateActiveCategory);
      window.clearTimeout(categoryScrollTimer.current);
    };
  }, [categoryIds, data]);

  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setSelectedProduct(null);
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 420);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useBodyScrollLock(Boolean(selectedProduct || drawer || reviewOpen || searchOpen));

  useEffect(() => {
    const close = (event) => event.key === 'Escape' && (setSelectedProduct(null), setDrawer(''), setReviewOpen(false), setSearchOpen(false), setSearch(''));
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setDrawer('');
    publicMenuService.trackEvent(username, { eventType: 'CATEGORY_VIEW', categoryId }).catch(() => {});

    // GA4: Kategori tıklama ve görüntüleme takibi
    const category = data?.categories?.find((c) => c.id === categoryId);
    trackEvent('select_category', {
      restaurant_username: username,
      restaurant_name: data?.restaurant?.name,
      category_id: String(categoryId),
      category_name: category?.name || String(categoryId),
    });

    const section = document.getElementById(`category-${categoryId}`);
    const categoryNav = document.querySelector('.category-nav');
    if (!section) return;
    const offset = (categoryNav?.getBoundingClientRect().height || 0) + 8;
    categoryScrollLock.current = true;
    window.clearTimeout(categoryScrollTimer.current);
    window.scrollTo({ top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset), behavior: 'smooth' });
    categoryScrollTimer.current = window.setTimeout(() => {
      categoryScrollLock.current = false;
      window.dispatchEvent(new Event('scroll'));
    }, 700);
  };

  const selectProduct = (product) => {
    publicMenuService.trackEvent(username, { eventType: 'PRODUCT_VIEW', productId: product.id, categoryId: product.categoryId }).catch(() => {});

    // GA4: Ürün detay tıklama takibi (Standart e-ticaret view_item etkinliği)
    const category = data?.categories?.find((c) => c.id === product.categoryId);
    trackEvent('view_item', {
      restaurant_username: username,
      restaurant_name: data?.restaurant?.name,
      item_id: String(product.id),
      item_name: product.name,
      item_category: category?.name || undefined,
      price: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
      currency: 'TRY',
    });
    setSelectedProduct({
      ...product,
      categoryName: product.categoryName || category?.name,
      categoryId: product.categoryId || category?.id,
    });
  };

  const allProducts = data?.categories.flatMap((category) =>
    (category.products || []).map((p) => ({
      ...p,
      categoryName: category.name,
      categoryId: category.id,
    }))
  ) || [];
  const searchResults = useMemo(() => searchProducts(allProducts, search), [allProducts, search]);
  const selectLanguage = (value) => {
    trackEvent('select_language', {
      restaurant_username: username,
      language: value,
    });
    setLanguage(value);
    localStorage.setItem('zuulab-language', value);
  };

  if (status === 'loading') return <PublicMenuSkeleton />;
  if (status === 'preparing') return <div className="public-state public-state--preparing"><div className="public-state__icon">✦</div><h1>{data?.restaurant?.name || 'Menünüz'} hazırlanıyor</h1><p>Bu menü henüz yayına alınmadı. Çok yakında burada olacağız.</p></div>;
  if (status === 'hidden') return <div className="public-state public-state--hidden"><div className="public-state__icon">—</div><h1>Menü geçici olarak kapalı</h1><p>Bu menü sahibi tarafından geçici olarak erişime kapatıldı.</p></div>;
  if (status === 'unavailable') return <div className="public-state"><div className="public-state__icon">—</div><h1>Menü bulunamadı.</h1><p>Bu menü şu anda kullanılamıyor.</p></div>;

  const theme = getPublicMenuTheme(data.restaurant.theme || 'DEFAULT');
  const menuTheme = data.restaurant.menuTheme;
  const menuMode = menuTheme?.mode || 'LIGHT';
  const defaultLayout = { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD', showStories: true, showEcoBadge: true };
  const menuLayout = { ...defaultLayout, ...(menuTheme?.layout || {}), showStories: menuTheme?.layout?.showStories !== false, showEcoBadge: menuTheme?.layout?.showEcoBadge !== false };
  const selectedTheme = getPublicMenuTheme(menuTheme?.theme || data.restaurant.theme || 'DEFAULT', menuMode);
  const canonicalUrl = `${publicSiteOrigin}/${encodeURIComponent(username)}/menu`;
  const seoTitle = `${data.restaurant.name} Menü | zuuqrmenu`;
  const seoDescription = data.restaurant.description || `${data.restaurant.name} dijital menüsünü inceleyin. Menü, ürünler ve güncel fiyatlar zuuqrmenu'da.`;
  const absoluteImage = (value) => value ? new URL(value, window.location.origin).toString() : undefined;
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Restaurant',
        '@id': `${canonicalUrl}#restaurant`,
        name: data.restaurant.name,
        description: seoDescription,
        url: canonicalUrl,
        image: [data.restaurant.logo, data.restaurant.coverImage].filter(Boolean).map(absoluteImage),
        telephone: data.restaurant.phone || undefined,
        email: data.restaurant.email || undefined,
        address: data.restaurant.address || data.restaurant.city ? { '@type': 'PostalAddress', streetAddress: data.restaurant.address || undefined, addressLocality: data.restaurant.city || undefined } : undefined,
        sameAs: [...(data.restaurant.socialMedia?.map((item) => item.url).filter(Boolean) || []), data.restaurant.website].filter(Boolean),
        hasMenu: {
          '@type': 'Menu',
          name: data.menu?.name || `${data.restaurant.name} Menü`,
          hasMenuSection: data.categories.map((category) => ({
            '@type': 'MenuSection',
            name: category.name,
            description: category.description || undefined,
            hasMenuItem: category.products.map((product) => ({
              '@type': 'MenuItem',
              name: product.name,
              description: product.description || product.shortDescription || undefined,
              image: absoluteImage(product.image),
              offers: { '@type': 'Offer', price: product.price, priceCurrency: 'TRY', availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
            })),
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://zuuqrmenu.com/' },
          { '@type': 'ListItem', position: 2, name: data.restaurant.name, item: canonicalUrl },
        ],
      },
    ],
  };
  const style = {
    '--menu-primary': menuTheme?.primaryColor || data.restaurant.primaryColor,
    '--menu-secondary': menuTheme?.secondaryColor || data.restaurant.secondaryColor,
    '--menu-background': selectedTheme.background || theme.background,
    '--menu-surface': selectedTheme.surface || theme.surface,
    '--menu-text': selectedTheme.text || theme.text,
    '--menu-muted': selectedTheme.muted || theme.muted,
    '--menu-border': selectedTheme.border || theme.border,
    '--menu-radius': selectedTheme.radius || theme.radius,
    '--menu-shadow': selectedTheme.shadow || theme.shadow,
    '--menu-font': publicMenuFonts[menuTheme?.font] || publicMenuFonts.Inter,
  };

  const currentThemeKey = menuTheme?.theme || data.restaurant.theme || 'DEFAULT';
  const isGridTheme = currentThemeKey === 'GRID';

  return (
    <div className="public-menu-shell" data-theme={currentThemeKey} data-mode={menuMode} data-layout={menuLayout.style || 'STANDARD'} data-show-featured={menuLayout.emphasizeFeatured !== false} style={style}>
      <SeoHead title={seoTitle} description={seoDescription} canonical={canonicalUrl} image={absoluteImage(data.restaurant.coverImage || data.restaurant.logo)} ogType="restaurant.menu" structuredData={structuredData} />
      <div className="public-menu-page">
        {isGridTheme ? (
          <>
            <header className={`public-header public-header--grid-category ${!selectedGridCategory ? 'is-grid-home' : ''}`} data-mode={menuMode}>
              <div className="public-header--grid__top-bar">
                <button
                  type="button"
                  className="header-control header-control--hamburger"
                  onClick={() => setDrawer('categories')}
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
                    resetScrollToTop();
                    setSelectedGridCategory(null);
                  }}
                  role="button"
                  tabIndex="0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      resetScrollToTop();
                      setSelectedGridCategory(null);
                    }
                  }}
                  aria-label="Kategorilere dön"
                >
                  {data.restaurant.logo ? (
                    <BlurImage
                      src={data.restaurant.logo}
                      alt={data.restaurant.name}
                      className="public-header--grid__logo-img"
                    />
                  ) : (
                    <span className="public-header--grid__title">{data.restaurant.name}</span>
                  )}
                </div>

                <button
                  type="button"
                  className="header-control header-control--info header-control--search"
                  onClick={() => {
                    trackEvent('view_restaurant_info', {
                      restaurant_username: username,
                      restaurant_name: data?.restaurant?.name,
                    });
                    setDrawer('info');
                  }}
                  aria-label="Restoran bilgileri"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </button>
              </div>

              {selectedGridCategory && data.categories.length > 0 && (
                <div className="grid-category-nav-wrapper">
                  <CategoryNavigation
                    categories={data.categories}
                    activeCategory={selectedGridCategory}
                    onSelect={(catId) => {
                      resetScrollToTop();
                      setSelectedGridCategory(catId);
                    }}
                  />
                </div>
              )}
            </header>

            {!selectedGridCategory && (
              <CategoryCardGrid
                categories={data.categories}
                onSelectCategory={(catId) => {
                  resetScrollToTop();
                  setSelectedGridCategory(catId);
                }}
                onOpenReview={() => setReviewOpen(true)}
              />
            )}
          </>
        ) : (
          <>
            <MenuHeader
              restaurant={data.restaurant}
              onOpenCategories={() => setDrawer('categories')}
              onOpenSearch={() => {
                setSearch('');
                setSearchOpen(true);
              }}
              onOpenInfo={() => {
                trackEvent('view_restaurant_info', {
                  restaurant_username: username,
                  restaurant_name: data?.restaurant?.name,
                });
                setDrawer('info');
              }}
            />
            {data.categories.length > 0 && <CategoryNavigation categories={data.categories} activeCategory={activeCategory} onSelect={scrollToCategory} />}
            {menuLayout?.showStories && (
              <FeaturedStories products={allProducts} onSelect={selectProduct} />
            )}
          </>
        )}

        {isGridTheme ? (
          selectedGridCategory ? (
            <main className="public-menu-content">
              {(() => {
                const activeCat = data.categories.find((c) => c.id === selectedGridCategory) || data.categories[0];
                return activeCat ? (
                  <CategorySection
                    key={activeCat.id}
                    category={activeCat}
                    layout={menuLayout}
                    onProductSelect={selectProduct}
                    themeKey={currentThemeKey}
                  />
                ) : null;
              })()}
            </main>
          ) : null
        ) : (
          <main className="public-menu-content">
            {data.categories.length === 0 ? <div className="public-empty"><span>✦</span><h2>Menü hazırlanıyor</h2><p>Bu restoranda henüz yayınlanmış ürün bulunmuyor.</p></div> : data.categories.map((category) => <CategorySection key={category.id} category={category} layout={menuLayout} onProductSelect={selectProduct} themeKey={currentThemeKey} />)}
          </main>
        )}

        <footer className="public-footer">
          <p className="public-footer__powered">Powered by zuuqrmenu</p>
          {menuLayout.showEcoBadge !== false && (
            <div className="eco-leaf-banner" aria-label="Çevre dostu dijital menü">
              <div className="eco-ambient-leaves" aria-hidden="true">
                <span className="eco-ambient-leaf eco-ambient-leaf--1">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
                    <path
                      d="M19 3C15 4 8.5 8.5 7.5 14c-.8 4.2 1.8 7.5 5.2 7.5 4.5 0 7.5-5 8-10 .3-4-.5-7.5-1.7-8.5z"
                      fill="currentColor"
                      fillOpacity="0.45"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 19.5C11.5 16 14.5 10.5 19 3"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                    <path d="M11.5 15.5c-1.5-.6-2.5-1.4-3-2.2" stroke="currentColor" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
                    <path d="M14 12c1.8-.4 3.2-1.2 3.8-2" stroke="currentColor" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="eco-ambient-leaf eco-ambient-leaf--2">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor">
                    <path
                      d="M20 4c-3.8 2-9 6-11 11.5-1.2 3.3.4 6 3 6 4 0 7.2-4.5 8.8-10.5.8-3 .2-6-.8-7z"
                      fill="currentColor"
                      fillOpacity="0.4"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 20C12.5 16.5 15.5 11 20 4"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                  </svg>
                </span>
                <span className="eco-ambient-leaf eco-ambient-leaf--3">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor">
                    <path
                      d="M18.5 4.5c-3.2 1.5-7 5.2-7.8 9.5-.7 3.5 1.4 6.5 4.3 6.5 3.6 0 6-3.8 6.5-8.2.4-3.2-.3-6.5-3-7.8z"
                      fill="currentColor"
                      fillOpacity="0.45"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.5 19c2.2-3 4.8-7.5 6-14.5"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      opacity="0.8"
                    />
                    <path d="M14.5 15c-1.2-.5-2-1.2-2.5-1.8" stroke="currentColor" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
              <span className="eco-leaf-banner__text">
                Bu menü kağıda basılmadı. Birlikte <strong>{Number(data.restaurant?.menuViewCount || 1).toLocaleString('tr-TR')}</strong> yaprak koruduk.
              </span>
            </div>
          )}
        </footer>
      </div>
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        allProducts={allProducts}
        onSelectProduct={selectProduct}
        themeKey={currentThemeKey}
        mode={menuMode}
      />
      {drawer === 'categories' && (
        <div
          className={`public-drawer-backdrop ${isGridTheme ? 'public-drawer-backdrop--grid' : ''}`}
          data-theme={currentThemeKey}
          data-mode={menuMode}
          role="presentation"
          onMouseDown={(event) => event.target === event.currentTarget && setDrawer('')}
        >
          <aside
            className={`public-drawer ${isGridTheme ? 'public-drawer--grid' : ''}`}
            data-theme={currentThemeKey}
            data-mode={menuMode}
          >
            {isGridTheme ? (
              <div className="drawer-grid-container">
                <div className="drawer-grid-header">
                  <button
                    type="button"
                    className="drawer-grid-close"
                    onClick={() => setDrawer('')}
                    aria-label="Kapat"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  className="drawer-all-menus-btn"
                  onClick={() => {
                    resetScrollToTop();
                    setSelectedGridCategory(null);
                    setDrawer('');
                  }}
                  aria-label="Menü ana sayfasına dön"
                >
                  <div className="all-menus-left">
                    <div className="all-menus-icon-box" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.6" />
                        <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.6" />
                        <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.6" />
                        <rect x="14" y="14" width="6.5" height="6.5" rx="1.6" />
                      </svg>
                    </div>
                    <div className="all-menus-text">
                      <strong className="all-menus-title">Tüm menüler</strong>
                      <span className="all-menus-desc">Menü ana sayfasına dön</span>
                    </div>
                  </div>
                  <svg className="all-menus-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <div className="drawer-grid-divider" />

                <div className="drawer-grid-categories">
                  {data.categories.map((category) => (
                    <button
                      type="button"
                      className={`drawer-grid-item ${selectedGridCategory === category.id ? 'is-active' : ''}`}
                      key={category.id}
                      onClick={() => {
                        resetScrollToTop();
                        setSelectedGridCategory(category.id);
                        setDrawer('');
                      }}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                <div className="drawer-grid-footer">
                  <div className="drawer-grid-lang-wrapper" ref={langDropdownRef}>
                    {langDropdownOpen && (
                      <div className="drawer-lang-popover" role="menu">
                        {langOptions.map((opt) => (
                          <button
                            key={opt.code}
                            type="button"
                            className={`drawer-lang-popover__item ${language === opt.code ? 'is-active' : ''}`}
                            onClick={() => {
                              setLanguage(opt.code);
                              localStorage.setItem('zuulab-language', opt.code);
                              setLangDropdownOpen(false);
                            }}
                          >
                            <span>{opt.label}</span>
                            {language === opt.code && <span className="drawer-lang-dot">●</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className="drawer-grid-lang-btn"
                      onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                      aria-label="Dil seçimi"
                      aria-expanded={langDropdownOpen}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 8 6 6" />
                        <path d="m4 14 6-6 2-3" />
                        <path d="M2 5h12" />
                        <path d="M7 2h1" />
                        <path d="m22 22-5-10-5 10" />
                        <path d="M14 18h6" />
                      </svg>
                      <span>{langOptions.find((l) => l.code === language)?.short || 'TR'}</span>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  <p className="drawer-grid-powered">Powered by zuuqrmenu</p>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={() => setDrawer('')}
                  aria-label="Kapat"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                {(() => {
                  const catStoreImg = data.restaurant.storeImage || data.restaurant.coverImage || data.restaurant.logo;
                  return (
                    <div className={`drawer-store-image ${catStoreImg ? 'has-image' : 'no-image'}`}>
                      {catStoreImg ? (
                        <BlurImage src={catStoreImg} alt={`${data.restaurant.name} mağaza görseli`} />
                      ) : (
                        <span aria-hidden="true">{data.restaurant.name.charAt(0)}</span>
                      )}
                    </div>
                  );
                })()}
                <div className="drawer-body">
                  <h2>{data.restaurant.name}</h2>
                  <p className="drawer-label">Kategoriler</p>
                  {data.categories.map((category) => (
                    <button
                      type="button"
                      className={`drawer-category ${activeCategory === category.id ? 'is-active' : ''}`}
                      key={category.id}
                      onClick={() => scrollToCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>
      )}
      {drawer === 'info' && (
        <InfoDrawer
          restaurant={data.restaurant}
          language={language}
          onLanguage={selectLanguage}
          onReview={() => setReviewOpen(true)}
          onClose={() => setDrawer('')}
          themeKey={currentThemeKey}
          mode={menuMode}
        />
      )}
      {reviewOpen && (
        <ReviewSheet
          username={username}
          onClose={() => setReviewOpen(false)}
          themeKey={currentThemeKey}
          mode={menuMode}
        />
      )}
      {searchOpen && (
        <SearchSheet
          value={search}
          onChange={setSearch}
          results={searchResults}
          onSelect={(product) => {
            if (search.trim()) {
              trackEvent('search', {
                restaurant_username: username,
                search_term: search.trim(),
              });
            }
            selectProduct(product);
            setSearchOpen(false);
            setSearch('');
          }}
          onClose={() => {
            setSearchOpen(false);
            setSearch('');
          }}
          themeKey={currentThemeKey}
          mode={menuMode}
        />
      )}
      <div className="public-floating-actions" data-mode={menuMode}>
        <button
          type="button"
          className={`floating-action floating-action--search ${showTop ? 'is-raised' : 'is-lowered'}`}
          onClick={() => {
            trackEvent('open_search', {
              restaurant_username: username,
              restaurant_name: data?.restaurant?.name,
            });
            setSearch('');
            setSearchOpen(true);
          }}
          aria-label="Ürün ara"
        >
          <span className="floating-action__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </button>
        <button
          type="button"
          className={`floating-action floating-action--top ${showTop ? 'is-visible' : 'is-hidden'}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Başa dön"
        >
          <span className="floating-action__icon">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m18 15-6-6-6 6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default PublicMenu;