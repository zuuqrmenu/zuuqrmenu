import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryNavigation from '../components/public-menu/CategoryNavigation';
import CategorySection from '../components/public-menu/CategorySection';
import MenuHeader from '../components/public-menu/MenuHeader';
import ProductDetailModal from '../components/public-menu/ProductDetailModal';
import InfoDrawer from '../components/public-menu/InfoDrawer';
import ReviewSheet from '../components/public-menu/ReviewSheet';
import SearchSheet from '../components/public-menu/SearchSheet';
import { publicMenuService } from '../services/publicMenuService';
import { getPublicMenuTheme } from '../utils/publicMenuTheme';

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

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    publicMenuService.getMenu(username)
      .then((result) => {
        if (!mounted) return;
        setData(result);
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
    return () => window.removeEventListener('scroll', updateActiveCategory);
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
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectProduct = (product) => {
    publicMenuService.trackEvent(username, { eventType: 'PRODUCT_VIEW', productId: product.id, categoryId: product.categoryId }).catch(() => {});
    setSelectedProduct(product);
  };

  const allProducts = data?.categories.flatMap((category) => category.products) || [];
  const searchResults = allProducts.filter((product) => `${product.name} ${product.description} ${product.shortDescription}`.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr')));
  const selectLanguage = (value) => { setLanguage(value); localStorage.setItem('zuulab-language', value); };

  if (status === 'loading') return <div className="public-state"><div className="public-loader" /><p>Menü hazırlanıyor...</p></div>;
  if (status === 'unavailable') return <div className="public-state"><div className="public-state__icon">—</div><h1>Menü bulunamadı.</h1><p>Bu menü şu anda kullanılamıyor.</p></div>;

  const theme = getPublicMenuTheme(data.restaurant.theme);
  const style = {
    '--menu-primary': data.restaurant.primaryColor,
    '--menu-secondary': data.restaurant.secondaryColor,
    '--menu-background': theme.background,
    '--menu-surface': theme.surface,
    '--menu-text': theme.text,
    '--menu-muted': theme.muted,
    '--menu-border': theme.border,
    '--menu-radius': theme.radius,
    '--menu-shadow': theme.shadow,
  };

  return (
    <div className="public-menu-shell" data-theme={data.restaurant.theme} style={style}>
      <div className="public-menu-page">
        <MenuHeader restaurant={data.restaurant} onOpenCategories={() => setDrawer('categories')} onOpenInfo={() => setDrawer('info')} />
        {data.categories.length > 0 && <CategoryNavigation categories={data.categories} activeCategory={activeCategory} onSelect={scrollToCategory} />}
        <main className="public-menu-content">
          {data.categories.length === 0 ? <div className="public-empty"><span>✦</span><h2>Menü hazırlanıyor</h2><p>Bu restoranda henüz yayınlanmış ürün bulunmuyor.</p></div> : data.categories.map((category) => <CategorySection key={category.id} category={category} onProductSelect={selectProduct} />)}
        </main>
        <footer className="public-footer">zuuqrmenu <span>•</span> Dijital Menü</footer>
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      {drawer === 'categories' && <div className="public-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDrawer('')}><aside className="public-drawer"><button type="button" className="drawer-close" onClick={() => setDrawer('')} aria-label="Kapat">×</button><div className="drawer-store-image">{data.restaurant.storeImage ? <img src={data.restaurant.storeImage} alt="" /> : <span>{data.restaurant.name.charAt(0)}</span>}</div><h2>{data.restaurant.name}</h2><p className="drawer-label">Kategoriler</p>{data.categories.map((category) => <button type="button" className="drawer-category" key={category.id} onClick={() => scrollToCategory(category.id)}>{category.name}</button>)}</aside></div>}
      {drawer === 'info' && <InfoDrawer restaurant={data.restaurant} language={language} onLanguage={selectLanguage} onReview={() => setReviewOpen(true)} onClose={() => setDrawer('')} />}
      {reviewOpen && <ReviewSheet username={username} onClose={() => setReviewOpen(false)} />}
      {searchOpen && <SearchSheet value={search} onChange={setSearch} results={searchResults} onSelect={(product) => { selectProduct(product); setSearchOpen(false); }} onClose={() => { setSearchOpen(false); setSearch(''); }} />}
      <div className="public-floating-actions">
        <button type="button" className={`floating-action floating-action--search ${showTop ? 'is-raised' : 'is-lowered'}`} onClick={() => setSearchOpen(true)} aria-label="Ürün ara">⌕</button>
        <button type="button" className={`floating-action floating-action--top ${showTop ? 'is-visible' : 'is-hidden'}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Başa dön">↑</button>
      </div>
    </div>
  );
};

export default PublicMenu;