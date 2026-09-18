import { useState } from 'react';

const BistroFeaturedStories = ({ products, onSelect }) => {
  const featured = (products || []).filter((product) => product?.isFeatured);
  const [viewed, setViewed] = useState(new Set());

  if (!featured.length) return null;

  const handleClick = (product) => {
    setViewed((prev) => new Set([...prev, product.id]));
    onSelect?.(product);
  };

  return (
    <section className="bistro-stories" aria-label="Öne çıkan ürünler">
      <div className="bistro-stories__header">
        <span className="bistro-stories__eyebrow">Öne Çıkanlar</span>
      </div>
      <div className="bistro-stories__row" role="list">
        {featured.map((product) => {
          const isViewed = viewed.has(product.id);
          return (
            <button
              key={product.id}
              type="button"
              className={`bistro-story ${isViewed ? 'is-viewed' : 'is-unviewed'}`}
              onClick={() => handleClick(product)}
              aria-label={product.name}
            >
              <span className="bistro-story__ring" aria-hidden="true">
                <span className="bistro-story__thumb">
                  {product.image ? <img src={product.image} alt={`${product.name} görseli`} loading="lazy" /> : <span aria-hidden="true">{product.name.charAt(0)}</span>}
                </span>
              </span>
              <span className="bistro-story__name">{product.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default BistroFeaturedStories;
