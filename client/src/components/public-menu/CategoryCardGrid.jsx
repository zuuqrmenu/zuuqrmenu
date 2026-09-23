import BlurImage from '../common/BlurImage';

const ABSTRACT_PATTERNS = [
  // 0: Concentric Zen Arcs & Floating Rings
  (
    <svg viewBox="0 0 240 180" className="bento-abstract-svg" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <circle cx="215" cy="150" r="105" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
      <circle cx="215" cy="150" r="75" stroke="currentColor" strokeWidth="1.1" strokeDasharray="3 4" strokeOpacity="0.32" />
      <circle cx="215" cy="150" r="46" fill="currentColor" fillOpacity="0.08" />
      <path d="M110 180 C135 125, 175 90, 240 82" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.38" />
      <circle cx="150" cy="98" r="6" fill="currentColor" fillOpacity="0.22" />
      <circle cx="182" cy="68" r="4" fill="currentColor" fillOpacity="0.26" />
      <circle cx="120" cy="140" r="3" fill="currentColor" fillOpacity="0.16" />
    </svg>
  ),
  // 1: Modern Organic Waves & Contours
  (
    <svg viewBox="0 0 240 180" className="bento-abstract-svg" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path d="M75 180 C105 130, 165 120, 240 142" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.32" />
      <path d="M105 180 C130 110, 190 95, 240 105" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.42" />
      <path d="M135 180 C160 88, 210 68, 240 74" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" strokeOpacity="0.3" />
      <ellipse cx="205" cy="138" rx="38" ry="24" fill="currentColor" fillOpacity="0.08" transform="rotate(-15 205 138)" />
      <circle cx="132" cy="120" r="5" fill="currentColor" fillOpacity="0.22" />
      <circle cx="180" cy="78" r="3.5" fill="currentColor" fillOpacity="0.26" />
      <circle cx="215" cy="48" r="4.5" fill="currentColor" fillOpacity="0.16" />
    </svg>
  ),
  // 2: Bauhaus Geometry & Floating Capsule
  (
    <svg viewBox="0 0 240 180" className="bento-abstract-svg" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <rect x="162" y="68" width="56" height="92" rx="28" fill="currentColor" fillOpacity="0.08" />
      <rect x="162" y="68" width="56" height="92" rx="28" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.38" />
      <circle cx="132" cy="140" r="46" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.32" />
      <circle cx="132" cy="140" r="26" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.28" />
      <line x1="115" y1="180" x2="232" y2="63" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.22" />
      <circle cx="190" cy="98" r="6.5" fill="currentColor" fillOpacity="0.22" />
      <circle cx="105" cy="155" r="3.5" fill="currentColor" fillOpacity="0.18" />
    </svg>
  ),
  // 3: Harmonic Ellipses & Orbital Rings
  (
    <svg viewBox="0 0 240 180" className="bento-abstract-svg" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <ellipse cx="192" cy="132" rx="64" ry="40" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.38" transform="rotate(22 192 132)" />
      <ellipse cx="192" cy="132" rx="40" ry="24" fill="currentColor" fillOpacity="0.08" transform="rotate(22 192 132)" />
      <circle cx="138" cy="92" r="28" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 4" strokeOpacity="0.32" />
      <circle cx="138" cy="92" r="14" fill="currentColor" fillOpacity="0.07" />
      <circle cx="218" cy="72" r="5" fill="currentColor" fillOpacity="0.24" />
      <circle cx="165" cy="155" r="3.5" fill="currentColor" fillOpacity="0.18" />
      <path d="M95 180 Q150 138, 240 148" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.26" />
    </svg>
  ),
];

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
          const patternIndex = index % ABSTRACT_PATTERNS.length;

          return (
            <div
              key={category.id}
              className={`category-bento-card ${isFull ? 'is-full' : 'is-half'} ${!hasImage ? 'has-no-image' : ''}`}
              data-pattern={patternIndex}
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
                <div className="category-bento-card__empty-media" aria-hidden="true">
                  {ABSTRACT_PATTERNS[patternIndex]}
                </div>
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

