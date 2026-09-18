import { useState } from 'react';

const FeaturedStories = ({ products, onSelect }) => {
  const featured = (products || []).filter((product) => product?.isFeatured);
  const [viewed, setViewed] = useState(new Set());

  if (!featured.length) return null;

  const handleClick = (product) => {
    setViewed((prev) => new Set([...prev, product.id]));
    onSelect?.(product);
  };

  return (
    <section className="featured-stories bistro-stories" aria-label="Öne çıkan ürünler">
      <div className="featured-stories__header bistro-stories__header">
        <span className="featured-stories__eyebrow bistro-stories__eyebrow">Öne Çıkanlar</span>
      </div>
      <div className="featured-stories__row bistro-stories__row" role="list">
        {featured.map((product) => {
          const isViewed = viewed.has(product.id);
          return (
            <button
              key={product.id}
              type="button"
              className={`featured-story bistro-story ${isViewed ? 'is-viewed' : 'is-unviewed'}`}
              onClick={() => handleClick(product)}
              aria-label={product.name}
            >
              <span className="featured-story__ring bistro-story__ring" aria-hidden="true">
                <span className="featured-story__thumb bistro-story__thumb">
                  {product.image ? (
                    <img src={product.image} alt={`${product.name} görseli`} loading="lazy" />
                  ) : (
                    <span aria-hidden="true">{product.name.charAt(0)}</span>
                  )}
                </span>
              </span>
              <span className="featured-story__name bistro-story__name">{product.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedStories;
