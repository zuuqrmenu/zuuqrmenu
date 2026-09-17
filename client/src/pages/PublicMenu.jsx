import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryNavigation from '../components/public-menu/CategoryNavigation';
import CategorySection from '../components/public-menu/CategorySection';
import MenuHeader from '../components/public-menu/MenuHeader';
import ProductDetailModal from '../components/public-menu/ProductDetailModal';
import InfoDrawer from '../components/public-menu/InfoDrawer';
import ReviewSheet from '../components/public-menu/ReviewSheet';
import SearchSheet from '../components/public-menu/SearchSheet';
import BistroFeaturedStories from '../components/public-menu/BistroFeaturedStories';
import { publicMenuService } from '../services/publicMenuService';
import { getPublicMenuTheme, publicMenuFonts } from '../utils/publicMenuTheme';

const PublicMenu = () => {
  const { username } = useParams();
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
    setSelectedProduct(product);
  };

  const allProducts = data?.categories.flatMap((category) => category.products) || [];
  const searchResults = allProducts.filter((product) => `${product.name} ${product.description} ${product.shortDescription}`.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')));
  const selectLanguage = (value) => { setLanguage(value); localStorage.setItem('zuulab-language', value); };

  if (status === 'loading') return <div className="public-state"><div className="public-loader" /><p>Menü hazırlanıyor...</p></div>;
  if (status === 'preparing') return <div className="public-state public-state--preparing"><div className="public-state__icon">✦</div><h1>{data?.restaurant?.name || 'Menünüz'} hazırlanıyor</h1><p>Bu menü henüz yayına alınmadı. Çok yakında burada olacağız.</p></div>;
  if (status === 'hidden') return <div className="public-state public-state--hidden"><div className="public-state__icon">—</div><h1>Menü geçici olarak kapalı</h1><p>Bu menü sahibi tarafından geçici olarak erişime kapatıldı.</p></div>;
  if (status === 'unavailable') return <div className="public-state"><div className="public-state__icon">—</div><h1>Menü bulunamadı.</h1><p>Bu menü şu anda kullanılamıyor.</p></div>;

  const theme = getPublicMenuTheme(data.restaurant.theme || 'MINIMAL');
  const menuTheme = data.restaurant.menuTheme;
  const menuMode = menuTheme?.mode || 'LIGHT';
  const menuLayout = menuTheme?.layout || { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD' };
  const selectedTheme = getPublicMenuTheme(menuTheme?.theme || data.restaurant.theme || 'MINIMAL', menuMode);
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
      <div className="public-menu-page">
        <MenuHeader restaurant={data.restaurant} onOpenCategories={() => setDrawer('categories')} onOpenInfo={() => setDrawer('info')} />
        {menuTheme?.theme === 'BISTRO' && (
          <BistroFeaturedStories products={allProducts} onSelect={selectProduct} />
        )}
        {data.categories.length > 0 && <CategoryNavigation categories={data.categories} activeCategory={activeCategory} onSelect={scrollToCategory} />}
        <main className="public-menu-content">
          {data.categories.length === 0 ? <div className="public-empty"><span>✦</span><h2>Menü hazırlanıyor</h2><p>Bu restoranda henüz yayınlanmış ürün bulunmuyor.</p></div> : data.categories.map((category) => <CategorySection key={category.id} category={category} layout={menuLayout} onProductSelect={selectProduct} />)}
        </main>
        <footer className="public-footer">zuuqrmenu <span>•</span> Dijital Menü</footer>
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      {drawer === 'categories' && <div className="public-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDrawer('')}><aside className="public-drawer"><button type="button" className="drawer-close" onClick={() => setDrawer('')} aria-label="Kapat">×</button><div className="drawer-store-image">{data.restaurant.storeImage ? <img src={data.restaurant.storeImage} alt="" /> : <span>{data.restaurant.name.charAt(0)}</span>}</div><h2>{data.restaurant.name}</h2><p className="drawer-label">Kategoriler</p>{data.categories.map((category) => <button type="button" className="drawer-category" key={category.id} onClick={() => scrollToCategory(category.id)}>{category.name}</button>)}</aside></div>}
      {drawer === 'info' && <InfoDrawer restaurant={data.restaurant} language={language} onLanguage={selectLanguage} onReview={() => setReviewOpen(true)} onClose={() => setDrawer('')} />}
      {reviewOpen && <ReviewSheet username={username} onClose={() => setReviewOpen(false)} />}
      {searchOpen && <SearchSheet value={search} onChange={setSearch} results={searchResults} onSelect={(product) => { selectProduct(product); setSearchOpen(false); }} onClose={() => { setSearchOpen(false); setSearch(''); }} />}
      <div className="public-floating-actions">
        <button type="button" className={`floating-action floating-action--search ${showTop ? 'is-raised' : 'is-lowered'}`} onClick={() => setSearchOpen(true)} aria-label="Ürün ara"><span className="floating-action__icon">⌕</span></button>
        <button type="button" className={`floating-action floating-action--top ${showTop ? 'is-visible' : 'is-hidden'}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Başa dön">↑</button>
      </div>
    </div>
  );
};

export default PublicMenu;