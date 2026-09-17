const ProductCard = ({ product, onSelect, layout = {} }) => (
  <button
    type="button"
    className={`public-product ${product.isFeatured && layout.emphasizeFeatured !== false ? 'is-featured' : ''} ${!product.isAvailable ? 'is-unavailable' : ''}`}
    onClick={() => onSelect(product)}
  >
    {layout.showImages !== false && <span className="public-product__visual" aria-hidden="true">{product.image ? <img src={product.image} alt="" /> : '✦'}</span>}
    <span className="public-product__body">
      <span className="public-product__topline">
        <span className="public-product__name">{product.name}</span>
        {product.isFeatured && <span className="featured-badge">Öne Çıkan</span>}
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

export default ProductCard;