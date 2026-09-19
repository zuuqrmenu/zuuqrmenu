import { useMemo } from 'react';
import ProductCard from './ProductCard';
import BlurImage from '../common/BlurImage';

const CategorySection = ({ category, onProductSelect, layout, themeKey }) => {
  const isGridTheme = themeKey === 'GRID';
  const showStories = Boolean(layout?.showStories);
  
  // Find products that have images for the top rectangular story highlight cards in randomized order
  const highlightProducts = useMemo(() => {
    if (!isGridTheme || !showStories) return [];
    const withImages = category.products.filter((p) => p.image);
    const shuffled = [...withImages];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [category.id, category.products, isGridTheme, showStories]);

  return (
    <section id={`category-${category.id}`} className={`public-category ${isGridTheme ? 'public-category--grid' : ''}`}>
      <div className="public-category__heading">
        <h2>{category.name}</h2>
      </div>

      {isGridTheme && showStories && highlightProducts.length > 0 && (
        <div className="category-story-scroll" aria-label={`${category.name} öne çıkan ürünleri`}>
          <div className="category-story-track">
            {highlightProducts.map((prod) => (
              <button
                key={`highlight-${prod.id}`}
                type="button"
                className="category-story-card"
                onClick={() => onProductSelect(prod)}
                aria-label={`${prod.name} detayını aç`}
              >
                <BlurImage
                  src={prod.image}
                  alt={prod.name}
                  loading="lazy"
                  className="category-story-card__img"
                />
                <div className="category-story-card__gradient" />
                <div className="category-story-card__info">
                  <span className="category-story-card__name">{prod.name}</span>
                  <span className="category-story-card__price">₺{Number(prod.price).toFixed(0)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="public-products">
        {category.products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            layout={layout}
            onSelect={onProductSelect}
            themeKey={themeKey}
          />
        ))}
      </div>
    </section>
  );
};

export default CategorySection;