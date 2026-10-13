import BlurImage from '../common/BlurImage';

const Icon = ({ name, size = 20 }) => {
  const props = { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false };
  if (name === 'search') return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
  if (name === 'info') return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
  if (name === 'list') return <svg {...props}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>;
  if (name === 'up') return <svg {...props}><path d="m18 15-6-6-6 6" /></svg>;
  return null;
};

const formatPrice = (value) => `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Top bar of the Stüdyo theme: identity on the left, search + info on the right. Scrolls away; the category chips stay. */
export const StudioBar = ({ restaurant, onOpenInfo, onOpenSearch }) => (
  <header className="studio-bar">
    <div className="studio-bar__brand">
      <span className="studio-bar__avatar" aria-hidden={!restaurant.logo}>
        {restaurant.logo ? <BlurImage src={restaurant.logo} alt={restaurant.name} /> : restaurant.name.charAt(0)}
      </span>
      <div className="studio-bar__text">
        <h1>{restaurant.name}</h1>
        {restaurant.description && <p>{restaurant.description}</p>}
      </div>
    </div>
    <div className="studio-bar__actions">
      <button type="button" className="studio-icon-btn" onClick={onOpenSearch} aria-label="Ürün ara"><Icon name="search" size={19} /></button>
      <button type="button" className="studio-icon-btn" onClick={onOpenInfo} aria-label="Restoran bilgilerini aç"><Icon name="info" size={19} /></button>
    </div>
  </header>
);

/** Horizontal showcase of featured (or, failing that, photographed) products. */
export const StudioSpotlight = ({ products, onSelect }) => {
  const list = products || [];
  const featured = list.filter((product) => product.isFeatured && product.isAvailable !== false);
  const picked = (featured.length >= 2 ? featured : list.filter((product) => product.image)).slice(0, 8);
  if (picked.length < 2) return null;

  return (
    <section className="studio-spotlight" aria-label="Öne çıkan ürünler">
      <h2 className="studio-spotlight__title">Önerilenler</h2>
      <div className="studio-spotlight__track">
        {picked.map((product) => (
          <button key={product.id} type="button" className="studio-spot" onClick={() => onSelect(product)} aria-label={`${product.name} detayını aç`}>
            {product.image ? <BlurImage src={product.image} alt="" loading="lazy" className="studio-spot__img" /> : <span className="studio-spot__initial" aria-hidden="true">{product.name.charAt(0)}</span>}
            <span className="studio-spot__shade" aria-hidden="true" />
            <span className="studio-spot__info">
              <span className="studio-spot__name">{product.name}</span>
              <span className="studio-spot__price">{formatPrice(product.price)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

/** Product card of the Stüdyo theme: photo on top with the price pill laid over it. */
export const StudioProductCard = ({ product, onSelect, layout = {} }) => {
  const showImage = layout.showImages !== false;
  const showPrice = layout.showPrices !== false;
  const emphasized = Boolean(product.isFeatured && layout.emphasizeFeatured !== false);
  const description = product.shortDescription || product.description;

  return (
    <button
      type="button"
      className={`public-product public-product--studio ${emphasized ? 'is-featured' : ''} ${!product.isAvailable ? 'is-unavailable' : ''} ${showImage ? '' : 'has-no-visual'}`}
      onClick={() => onSelect(product)}
    >
      {showImage && (
        <span className="studio-card__visual">
          {product.image ? <BlurImage src={product.image} alt={`${product.name} görseli`} loading="lazy" /> : <span className="studio-card__initial" aria-hidden="true">{product.name.charAt(0)}</span>}
          {emphasized && <span className="studio-card__flag">Öne çıkan</span>}
          {!product.isAvailable && <span className="studio-card__soldout">Tükendi</span>}
          {showPrice && product.isAvailable && <span className="studio-card__price">{formatPrice(product.price)}</span>}
        </span>
      )}
      <span className="studio-card__body">
        <span className="studio-card__name">{product.name}</span>
        {layout.showDescriptions !== false && description && <span className="studio-card__desc">{description}</span>}
        {showPrice && (
          <span className="studio-card__inline-price">{product.oldPrice != null && <del>{formatPrice(product.oldPrice)}</del>}{formatPrice(product.price)}</span>
        )}
      </span>
    </button>
  );
};

/** Floating dock: categories, search and (once scrolled) back to top. */
export const StudioDock = ({ onCategories, onSearch, showTop }) => (
  <nav className="studio-dock" aria-label="Menü kısayolları">
    <button type="button" onClick={onCategories}><Icon name="list" size={18} /><span>Kategoriler</span></button>
    <button type="button" onClick={onSearch}><Icon name="search" size={18} /><span>Ara</span></button>
    {showTop && <button type="button" className="studio-dock__top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Başa dön"><Icon name="up" size={18} /></button>}
  </nav>
);
