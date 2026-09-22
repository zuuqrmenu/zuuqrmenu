import BlurImage from '../common/BlurImage';

const CategoryCardGrid = ({ categories, onSelectCategory, onOpenReview }) => {
  if (!categories || !categories.length) return null;

  return (
    <section className="category-card-grid" id="menu-categories-grid" aria-label="Görsel Menü Kategorileri">
      <div className="category-card-grid__layout">
        {categories.map((category, index) => {
          // Asymmetric bento pattern: 1 full-width card, then 2 half-width cards, repeat
          const isFull = index % 3 === 0;
          const bgImage =
            category.image ||
            category.products?.find((p) => p.image)?.image ||
            null;

          const subtitle =
            category.description ||
            (category.products?.length
              ? `${category.products.length} lezzetli seçenek`
              : 'Özel tatlar ve sunumlar');

          const hasImage = Boolean(bgImage);

          return (
            <div
              key={category.id}
              className={`category-bento-card ${isFull ? 'is-full' : 'is-half'} ${!hasImage ? 'has-no-image' : ''}`}
              onClick={() => onSelectCategory?.(category.id)}
              role="button"
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectCategory?.(category.id);
                }
              }}
              aria-label={`${category.name} kategorisi`}
            >
              {hasImage ? (
                <div className="category-bento-card__media">
                  <BlurImage
                    src={bgImage}
                    alt={category.name}
                    loading="lazy"
                    className="category-bento-card__img"
                  />
                  <div className="category-bento-card__gradient" />
                </div>
              ) : (
                <div className="category-bento-card__empty-media" aria-hidden="true" />
              )}

              <div className="category-bento-card__content">
                <h3 className="category-bento-card__title">{category.name}</h3>
                <p className="category-bento-card__subtitle">{subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryCardGrid;

