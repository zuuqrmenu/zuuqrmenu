const ProductCard = ({ product, onSelect, layout = {}, themeKey }) => {
  const isGrid = themeKey === 'GRID';
  const isFeaturedEmphasized = Boolean(product.isFeatured && layout.emphasizeFeatured !== false);

  if (isGrid) {
    const hasImage = layout.showImages !== false && !!product.image;
    return (
      <button
        type="button"
        className={`public-product public-product--grid ${isFeaturedEmphasized ? 'is-featured' : ''} ${!product.isAvailable ? 'is-unavailable' : ''} ${!hasImage ? 'has-no-image' : ''}`}
        onClick={() => onSelect(product)}
      >
        <span className="public-product__body">
          <span className="public-product__topline">
            <span className="public-product__name">{product.name}</span>
            {isFeaturedEmphasized && <span className="featured-badge">Öne Çıkan</span>}
            <svg className="public-product__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
          {!product.isAvailable && <span className="public-product__meta sold-out-label">Tükendi</span>}
          {layout.showDescriptions !== false && (product.shortDescription || product.description) && (
            <span className="public-product__description">{product.shortDescription || product.description}</span>
          )}
          {layout.showPrices !== false && (
            <span className="public-product__price">
              {product.oldPrice !== null && <del>₺{Number(product.oldPrice).toFixed(0)}</del>}
              <strong>₺{Number(product.price).toFixed(0)}</strong>
            </span>
          )}
        </span>
        {hasImage && (
          <span className="public-product__visual">
            <img src={product.image} alt={`${product.name} görseli`} loading="lazy" />
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`public-product ${isFeaturedEmphasized ? 'is-featured' : ''} ${!product.isAvailable ? 'is-unavailable' : ''}`}
      onClick={() => onSelect(product)}
    >
      {layout.showImages !== false && <span className="public-product__visual">{product.image ? <img src={product.image} alt={`${product.name} görseli`} loading="lazy" /> : '✦'}</span>}
      <span className="public-product__body">
        <span className="public-product__topline">
          <span className="public-product__name">{product.name}</span>
          {isFeaturedEmphasized && <span className="featured-badge">Öne Çıkan</span>}
        </span>
        {!product.isAvailable && <span className="public-product__meta sold-out-label">Tükendi</span>}
        {layout.showDescriptions !== false && product.shortDescription && <span className="public-product__description">{product.shortDescription}</span>}
        {layout.showPrices !== false && <span className="public-product__price">
          {product.oldPrice !== null && <del>₺{Number(product.oldPrice).toFixed(2)}</del>}
          <strong>₺{Number(product.price).toFixed(2)}</strong>
        </span>}
      </span>
    </button>
  );
};

export default ProductCard;