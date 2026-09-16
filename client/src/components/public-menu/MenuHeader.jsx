import { useEffect, useState } from 'react';

const MenuHeader = ({ restaurant, onOpenCategories, onOpenInfo }) => {
  const [lightBackground, setLightBackground] = useState(false);

  useEffect(() => {
    if (!restaurant.coverImage) {
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
    return () => { image.onload = null; image.onerror = null; };
  }, [restaurant.coverImage]);

  return (
    <header className={`public-header ${lightBackground ? 'public-header--light' : 'public-header--dark'}`} style={restaurant.coverImage ? { backgroundImage: `url(${restaurant.coverImage})` } : undefined}>
      <div className="public-header__bar">
        <button type="button" className="header-control" onClick={onOpenCategories} aria-label="Kategorileri aç">☰</button>
        <span className="public-header__title">{restaurant.name}</span>
        <button type="button" className="header-control" onClick={onOpenInfo} aria-label="Restoran bilgilerini aç">ⓘ</button>
      </div>
    </header>
  );
};

export default MenuHeader;