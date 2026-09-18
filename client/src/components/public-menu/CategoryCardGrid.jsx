const fallbackCategoryImages = [
  'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80', // Kahvaltı
  'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80', // Atıştırmalık
  'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80', // Patates / Fries
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80', // Fried Chicken
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', // Burger
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', // Wrap
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', // Ana yemek
  'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=800&q=80', // Salata
  'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80', // Makarna
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', // Pizza
  'https://images.unsplash.com/photo-1608270546006-ff17316710b1?auto=format&fit=crop&w=800&q=80', // Bira
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', // Kokteyl
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', // Tatlı
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
            fallbackCategoryImages[index % fallbackCategoryImages.length];

          const subtitle =
            category.description ||
            (category.products?.length
              ? `${category.products.length} lezzetli seçenek`
              : 'Özel tatlar ve sunumlar');

          return (
            <div
              key={category.id}
              className={`category-bento-card ${isFull ? 'is-full' : 'is-half'}`}
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
              <div className="category-bento-card__media">
                <img
                  src={bgImage}
                  alt={category.name}
                  loading="lazy"
                  className="category-bento-card__img"
                />
                <div className="category-bento-card__gradient" />
              </div>

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
