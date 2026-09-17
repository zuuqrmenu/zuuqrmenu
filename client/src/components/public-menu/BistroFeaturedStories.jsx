const BistroFeaturedStories = ({ products, onSelect }) => {
  const featured = (products || []).filter((product) => product?.isFeatured);

  if (!featured.length) return null;

  return (
    <section className="bistro-stories" aria-label="Öne çıkan ürünler">
      <div className="bistro-stories__header">
        <span className="bistro-stories__eyebrow">Öne Çıkanlar</span>
      </div>
      <div className="bistro-stories__row" role="list">
        {featured.map((product) => (
          <button
            key={product.id}
            type="button"
            className="bistro-story"
            onClick={() => onSelect?.(product)}
            aria-label={product.name}
          >
            <span className="bistro-story__thumb" aria-hidden="true">
              {product.image ? <img src={product.image} alt={`${product.name} görseli`} loading="lazy" /> : <span aria-hidden="true">{product.name.charAt(0)}</span>}
            </span>
            <span className="bistro-story__name">{product.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default BistroFeaturedStories;
