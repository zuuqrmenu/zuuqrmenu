import { useEffect, useState } from 'react';

const MenuHeader = ({
  restaurant,
  onOpenCategories,
  onOpenInfo,
  onOpenSearch,
  onGoHome,
  isGridTheme,
}) => {
  const [lightBackground, setLightBackground] = useState(false);

  useEffect(() => {
    if (!restaurant.coverImage || isGridTheme) {
      setLightBackground(false);
      return undefined;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      setLightBackground((red * 299 + green * 587 + blue * 114) / 1000 > 160);
    };
    image.onerror = () => setLightBackground(false);
    image.src = restaurant.coverImage;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [restaurant.coverImage, isGridTheme]);

  if (isGridTheme) {
    return (
      <header className="public-header public-header--grid">
        <div className="public-header__bar">
          <button
            type="button"
            className="header-control header-control--hamburger"
            onClick={onOpenCategories}
            aria-label="Kategorileri aç"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round">
              <line x1="3.5" y1="6" x2="20.5" y2="6" />
              <line x1="3.5" y1="12" x2="20.5" y2="12" />
              <line x1="3.5" y1="18" x2="20.5" y2="18" />
            </svg>
          </button>

          <div
            className="public-header__identity public-header__identity--clickable"
            onClick={onGoHome}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onGoHome?.()}
            aria-label="Menü anasayfasına dön"
          >
            {restaurant.logo ? (
              <img src={restaurant.logo} alt={restaurant.name} className="public-header__logo-img" />
            ) : (
              <h1 className="public-header__title">{restaurant.name}</h1>
            )}
          </div>

          <button
            type="button"
            className="header-control header-control--search"
            onClick={onOpenSearch || onOpenInfo}
            aria-label="Ürün ara"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`public-header ${lightBackground ? 'public-header--light' : 'public-header--dark'}`}
      style={restaurant.coverImage ? { backgroundImage: `url(${restaurant.coverImage})` } : undefined}
    >
      <div className="public-header__bar">
        <button type="button" className="header-control" onClick={onOpenCategories} aria-label="Kategorileri aç">
          ☰
        </button>
        <div
          className="public-header__identity"
          onClick={onGoHome}
          role={onGoHome ? 'button' : undefined}
          style={onGoHome ? { cursor: 'pointer' } : undefined}
        >
          <h1 className="public-header__title">{restaurant.name}</h1>
          {restaurant.description && <p className="public-header__description">{restaurant.description}</p>}
        </div>
        <button type="button" className="header-control" onClick={onOpenInfo} aria-label="Restoran bilgilerini aç">
          ⓘ
        </button>
      </div>
    </header>
  );
};

export default MenuHeader;