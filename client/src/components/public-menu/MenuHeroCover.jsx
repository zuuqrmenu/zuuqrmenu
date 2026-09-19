import { useRef } from 'react';
import BlurImage from '../common/BlurImage';

const MenuHeroCover = ({
  restaurant,
  onExplore,
  onOpenCategories,
  onOpenInfo,
  onOpenSearch,
  onGoHome,
}) => {
  const coverImg =
    restaurant?.coverImage ||
    restaurant?.storeImage ||
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80';

  const handleExplore = () => {
    if (onExplore) {
      onExplore();
    } else {
      const target = document.getElementById('menu-categories-grid') || document.querySelector('.public-menu-content');
      target?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="menu-hero-cover" aria-label="Restoran karşılama alanı">
      <div className="menu-hero-cover__backdrop">
        <BlurImage src={coverImg} alt={`${restaurant?.name || 'Menü'} kapağı`} className="menu-hero-cover__img" />
        <div className="menu-hero-cover__overlay" />
      </div>

      <header className="menu-hero-cover__nav">
        <button
          type="button"
          className="menu-hero-cover__btn"
          onClick={onOpenCategories}
          aria-label="Kategorileri aç"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <div
          className="menu-hero-cover__brand"
          onClick={onGoHome}
          role={onGoHome ? 'button' : undefined}
          style={onGoHome ? { cursor: 'pointer' } : undefined}
        >
          {restaurant?.logo ? (
            <BlurImage src={restaurant.logo} alt={restaurant.name} className="menu-hero-cover__logo" />
          ) : (
            <span className="menu-hero-cover__name">{restaurant?.name || 'Restoran'}</span>
          )}
        </div>

        <button
          type="button"
          className="menu-hero-cover__btn"
          onClick={onOpenInfo}
          aria-label="Restoran bilgileri"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="8.01" strokeWidth="2.8" />
            <line x1="12" y1="12" x2="12" y2="16" />
          </svg>
        </button>
      </header>

      <div className="menu-hero-cover__footer">
        <button
          type="button"
          className="menu-hero-cover__cta"
          onClick={handleExplore}
          id="hero-explore-btn"
        >
          <span>Menüyü Görüntüle</span>
        </button>
      </div>
    </div>
  );
};

export default MenuHeroCover;
