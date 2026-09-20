import BlurImage from '../common/BlurImage';

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
            <BlurImage src={product.image} alt={`${product.name} görseli`} loading="lazy" />
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
      {layout.showImages !== false && (
        <span className="public-product__visual">
          {product.image ? <BlurImage src={product.image} alt={`${product.name} görseli`} loading="lazy" /> : '✦'}
        </span>
      )}
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