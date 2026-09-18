import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryNavigation from '../components/public-menu/CategoryNavigation';
import CategorySection from '../components/public-menu/CategorySection';
import MenuHeader from '../components/public-menu/MenuHeader';
import ProductDetailModal from '../components/public-menu/ProductDetailModal';
import InfoDrawer from '../components/public-menu/InfoDrawer';
import ReviewSheet from '../components/public-menu/ReviewSheet';
import SearchSheet from '../components/public-menu/SearchSheet';
import SeoHead from '../components/SeoHead';
import BistroFeaturedStories from '../components/public-menu/BistroFeaturedStories';
import { publicMenuService } from '../services/publicMenuService';
import { getPublicMenuTheme, publicMenuFonts } from '../utils/publicMenuTheme';
import { trackEvent } from '../utils/analytics';

const PublicMenu = () => {
  const { username } = useParams();
  const publicSiteOrigin = 'https://zuuqrmenu.com';
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [drawer, setDrawer] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('zuulab-language') || 'tr');
  const [showTop, setShowTop] = useState(false);
  const categoryScrollLock = useRef(false);
  const categoryScrollTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    publicMenuService.getMenu(username)
      .then((result) => {
        if (!mounted) return;
        setData(result);
        if (result.status === 'PREPARING' || result.status === 'HIDDEN') {
          setStatus(result.status === 'HIDDEN' ? 'hidden' : 'preparing');
          return;
        }
        setActiveCategory(result.categories[0]?.id || '');
        setStatus('ready');
      })
      .catch(() => {
        if (mounted) setStatus('unavailable');
      });
    return () => { mounted = false; };
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

  useEffect(() => {
    document.body.style.overflow = selectedProduct || drawer || reviewOpen || searchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct, drawer, reviewOpen, searchOpen]);

  useEffect(() => {
    const close = (event) => event.key === 'Escape' && (setSelectedProduct(null), setDrawer(''), setReviewOpen(false), setSearchOpen(false));
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
    setSelectedProduct(product);
  };

  const allProducts = data?.categories.flatMap((category) => category.products) || [];
  const searchResults = allProducts.filter((product) => `${product.name} ${product.description} ${product.shortDescription}`.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')));
  const selectLanguage = (value) => {
    trackEvent('select_language', {
      restaurant_username: username,
      language: value,
    });
    setLanguage(value);
    localStorage.setItem('zuulab-language', value);
  };

  if (status === 'loading') return <div className="public-state"><div className="public-loader" /><p>Menü hazırlanıyor...</p></div>;
  if (status === 'preparing') return <div className="public-state public-state--preparing"><div className="public-state__icon">✦</div><h1>{data?.restaurant?.name || 'Menünüz'} hazırlanıyor</h1><p>Bu menü henüz yayına alınmadı. Çok yakında burada olacağız.</p></div>;
  if (status === 'hidden') return <div className="public-state public-state--hidden"><div className="public-state__icon">—</div><h1>Menü geçici olarak kapalı</h1><p>Bu menü sahibi tarafından geçici olarak erişime kapatıldı.</p></div>;
  if (status === 'unavailable') return <div className="public-state"><div className="public-state__icon">—</div><h1>Menü bulunamadı.</h1><p>Bu menü şu anda kullanılamıyor.</p></div>;

  const theme = getPublicMenuTheme(data.restaurant.theme || 'MINIMAL');
  const menuTheme = data.restaurant.menuTheme;
  const menuMode = menuTheme?.mode || 'LIGHT';
  const menuLayout = menuTheme?.layout || { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD' };
  const selectedTheme = getPublicMenuTheme(menuTheme?.theme || data.restaurant.theme || 'MINIMAL', menuMode);
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

  return (
    <div className="public-menu-shell" data-theme={menuTheme?.theme || data.restaurant.theme || 'MINIMAL'} data-mode={menuMode} data-layout={menuLayout.style || 'STANDARD'} data-show-featured={menuLayout.emphasizeFeatured !== false} style={style}>
      <SeoHead title={seoTitle} description={seoDescription} canonical={canonicalUrl} image={absoluteImage(data.restaurant.coverImage || data.restaurant.logo)} structuredData={structuredData} />
      <div className="public-menu-page">
        <MenuHeader
          restaurant={data.restaurant}
          onOpenCategories={() => setDrawer('categories')}
          onOpenInfo={() => {
            trackEvent('view_restaurant_info', {
              restaurant_username: username,
              restaurant_name: data?.restaurant?.name,
            });
            setDrawer('info');
          }}
        />
        {menuLayout?.showStories && (
          <BistroFeaturedStories products={allProducts} onSelect={selectProduct} />
        )}
        {data.categories.length > 0 && <CategoryNavigation categories={data.categories} activeCategory={activeCategory} onSelect={scrollToCategory} />}
        <main className="public-menu-content">
          {data.categories.length === 0 ? <div className="public-empty"><span>✦</span><h2>Menü hazırlanıyor</h2><p>Bu restoranda henüz yayınlanmış ürün bulunmuyor.</p></div> : data.categories.map((category) => <CategorySection key={category.id} category={category} layout={menuLayout} onProductSelect={selectProduct} />)}
        </main>
        <footer className="public-footer">zuuqrmenu <span>•</span> Dijital Menü</footer>
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      {drawer === 'categories' && <div className="public-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDrawer('')}><aside className="public-drawer"><button type="button" className="drawer-close" onClick={() => setDrawer('')} aria-label="Kapat">×</button><div className="drawer-store-image">{data.restaurant.storeImage ? <img src={data.restaurant.storeImage} alt={`${data.restaurant.name} mağaza görseli`} /> : <span aria-hidden="true">{data.restaurant.name.charAt(0)}</span>}</div><h2>{data.restaurant.name}</h2><p className="drawer-label">Kategoriler</p>{data.categories.map((category) => <button type="button" className="drawer-category" key={category.id} onClick={() => scrollToCategory(category.id)}>{category.name}</button>)}</aside></div>}
      {drawer === 'info' && <InfoDrawer restaurant={data.restaurant} language={language} onLanguage={selectLanguage} onReview={() => setReviewOpen(true)} onClose={() => setDrawer('')} />}
      {reviewOpen && <ReviewSheet username={username} onClose={() => setReviewOpen(false)} />}
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
          }}
          onClose={() => {
            setSearchOpen(false);
            setSearch('');
          }}
        />
      )}
      <div className="public-floating-actions">
        <button
          type="button"
          className={`floating-action floating-action--search ${showTop ? 'is-raised' : 'is-lowered'}`}
          onClick={() => {
            trackEvent('open_search', {
              restaurant_username: username,
              restaurant_name: data?.restaurant?.name,
            });
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