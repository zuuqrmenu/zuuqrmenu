import { useEffect, useRef, useState } from 'react';
import FeaturedStories from '../public-menu/FeaturedStories';
import CategoryNavigation from '../public-menu/CategoryNavigation';
import CategorySection from '../public-menu/CategorySection';
import MenuHeader from '../public-menu/MenuHeader';
import CategoryCardGrid from '../public-menu/CategoryCardGrid';
import { StudioBar, StudioDock, StudioSpotlight } from '../public-menu/StudioParts';
import { getPublicMenuTheme, publicMenuFonts } from '../../utils/publicMenuTheme';
import { useAuth } from '../../context/AuthContext';
import { previewDemoCategories, previewDemoRestaurant } from './previewData';
import '../../styles/menu-studio.css';

const defaultLayout = { showImages: true, showDescriptions: true, showPrices: true, emphasizeFeatured: true, style: 'STANDARD', showStories: true, showEcoBadge: true };

const EcoBanner = ({ count }) => (
  <div className="eco-leaf-banner" aria-label="Çevre dostu dijital menü">
    <div className="eco-ambient-leaves" aria-hidden="true">
      <span className="eco-ambient-leaf eco-ambient-leaf--1">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
          <path d="M19 3C15 4 8.5 8.5 7.5 14c-.8 4.2 1.8 7.5 5.2 7.5 4.5 0 7.5-5 8-10 .3-4-.5-7.5-1.7-8.5z" fill="currentColor" fillOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8.5 19.5C11.5 16 14.5 10.5 19 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
        </svg>
      </span>
      <span className="eco-ambient-leaf eco-ambient-leaf--2">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor">
          <path d="M20 4c-3.8 2-9 6-11 11.5-1.2 3.3.4 6 3 6 4 0 7.2-4.5 8.8-10.5.8-3 .2-6-.8-7z" fill="currentColor" fillOpacity="0.4" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20C12.5 16.5 15.5 11 20 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
        </svg>
      </span>
      <span className="eco-ambient-leaf eco-ambient-leaf--3">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor">
          <path d="M18.5 4.5c-3.2 1.5-7 5.2-7.8 9.5-.7 3.5 1.4 6.5 4.3 6.5 3.6 0 6-3.8 6.5-8.2.4-3.2-.3-6.5-3-7.8z" fill="currentColor" fillOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 19c2.2-3 4.8-7.5 6-14.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>
      </span>
    </div>
    <span className="eco-leaf-banner__text">
      Bu menü kağıda basılmadı. Birlikte <strong>{Number(count || 12480).toLocaleString('tr-TR')}</strong> yaprak koruduk.
    </span>
  </div>
);

const MenuGlyph = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" aria-hidden="true">
    <line x1="3.5" y1="6" x2="20.5" y2="6" /><line x1="3.5" y1="12" x2="20.5" y2="12" /><line x1="3.5" y1="18" x2="20.5" y2="18" />
  </svg>
);

const InfoGlyph = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.8" /><line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);

/** Live phone preview: renders the real public-menu components with demo content and the draft's settings. */
const ThemePreview = ({ draft, restaurant: propRestaurant }) => {
  const auth = useAuth();
  const currentRestaurant = propRestaurant || auth?.restaurant || null;
  const restaurant = {
    ...previewDemoRestaurant,
    ...(currentRestaurant || {}),
    name: currentRestaurant?.name || previewDemoRestaurant.name,
    coverImage: currentRestaurant?.coverImage || currentRestaurant?.storeImage || previewDemoRestaurant.coverImage,
    logo: currentRestaurant?.logo || previewDemoRestaurant.logo,
    menuViewCount: currentRestaurant?.menuViewCount ?? previewDemoRestaurant.menuViewCount,
  };
  const shellRef = useRef(null);
  const [gridCategory, setGridCategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState(previewDemoCategories[0].id);

  const themeKey = draft.theme || 'DEFAULT';
  const mode = draft.mode || 'LIGHT';
  const layout = { ...defaultLayout, ...(draft.layout || {}) };
  const palette = getPublicMenuTheme(themeKey, mode);
  const primary = draft.primaryColor || restaurant.primaryColor || '#1F2937';
  const secondary = draft.secondaryColor || (mode === 'DARK' ? '#f4efe8' : '#fffdf8');
  const isGrid = themeKey === 'GRID';
  const isStudio = themeKey === 'STUDIO';

  const style = {
    '--menu-primary': primary,
    '--menu-secondary': secondary,
    '--menu-background': palette.background,
    '--menu-bg': palette.background,
    '--menu-surface': palette.surface,
    '--menu-text': palette.text,
    '--menu-muted': palette.muted,
    '--menu-border': palette.border,
    '--menu-radius': palette.radius,
    '--menu-shadow': palette.shadow,
    '--menu-font': publicMenuFonts[draft.font] || publicMenuFonts.Inter,
  };

  useEffect(() => {
    if (shellRef.current) shellRef.current.scrollTop = 0;
  }, [themeKey, mode, gridCategory]);

  const goHome = () => {
    setGridCategory(null);
    if (shellRef.current) shellRef.current.scrollTop = 0;
  };

  const scrollToCategory = (id) => {
    setActiveCategory(id);
    const container = shellRef.current;
    const target = container?.querySelector(`#preview-cat-${id}`);
    if (!container || !target) return;
    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: Math.max(0, offset - 56), behavior: 'smooth' });
  };

  const shellClass = isStudio ? 'public-menu-shell mcz-preview-shell' : 'public-menu-shell preview-menu-shell';

  return (
    <div ref={shellRef} className={shellClass} data-theme={themeKey} data-mode={mode} data-layout={layout.style || 'STANDARD'} data-show-featured={layout.emphasizeFeatured !== false} style={style}>
      <div className="public-menu-page preview-public-page">
        {isGrid ? (
          <>
            <header className={`public-header public-header--grid-category ${!gridCategory ? 'is-grid-home' : ''}`} data-mode={mode}>
              <div className="public-header--grid__top-bar">
                <button type="button" className="header-control header-control--hamburger" onClick={goHome} aria-label="Kategorileri aç"><MenuGlyph /></button>
                <div className="public-header--grid__identity" onClick={goHome} role="button" tabIndex="0" onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && goHome()} aria-label="Kategorilere dön">
                  {restaurant.logo ? <img src={restaurant.logo} alt={restaurant.name} className="public-header--grid__logo-img" /> : <span className="public-header--grid__title">{restaurant.name}</span>}
                </div>
                <button type="button" className="header-control header-control--search" aria-label="Restoran bilgileri"><InfoGlyph /></button>
              </div>
              {gridCategory && (
                <div className="grid-category-nav-wrapper">
                  <CategoryNavigation categories={previewDemoCategories} activeCategory={gridCategory} onSelect={(id) => { setGridCategory(id); if (shellRef.current) shellRef.current.scrollTop = 0; }} />
                </div>
              )}
            </header>
            {!gridCategory && <CategoryCardGrid categories={previewDemoCategories} onSelectCategory={(id) => { setGridCategory(id); if (shellRef.current) shellRef.current.scrollTop = 0; }} />}
          </>
        ) : isStudio ? (
          <>
            <StudioBar restaurant={restaurant} onOpenSearch={() => {}} onOpenInfo={() => {}} />
            <CategoryNavigation categories={previewDemoCategories} activeCategory={activeCategory} onSelect={scrollToCategory} />
            {layout.showStories && <StudioSpotlight products={previewDemoCategories.flatMap((category) => category.products)} onSelect={() => {}} />}
          </>
        ) : (
          <>
            <MenuHeader restaurant={restaurant} onOpenCategories={() => {}} onOpenInfo={() => {}} />
            <CategoryNavigation categories={previewDemoCategories} activeCategory={activeCategory} onSelect={scrollToCategory} />
            {layout.showStories && <FeaturedStories products={previewDemoCategories.flatMap((category) => category.products)} onSelect={() => {}} />}
          </>
        )}

        {(!isGrid || gridCategory) && (
          <main className="public-menu-content preview-menu-content">
            {isGrid ? (
              <CategorySection key={gridCategory} category={previewDemoCategories.find((category) => category.id === gridCategory) || previewDemoCategories[0]} layout={layout} onProductSelect={() => {}} themeKey={themeKey} />
            ) : (
              previewDemoCategories.map((category) => (
                <div key={category.id} id={`preview-cat-${category.id}`}>
                  <CategorySection category={category} layout={layout} onProductSelect={() => {}} themeKey={themeKey} />
                </div>
              ))
            )}
          </main>
        )}

        <footer className="public-footer">
          <p className="public-footer__powered">Powered by zuuqrmenu</p>
          {layout.showEcoBadge !== false && <EcoBanner count={restaurant.menuViewCount} />}
        </footer>
      </div>
      {isStudio && <StudioDock onCategories={() => {}} onSearch={() => {}} showTop={false} />}
    </div>
  );
};

export default ThemePreview;
