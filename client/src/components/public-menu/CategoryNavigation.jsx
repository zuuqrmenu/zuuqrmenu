import { useEffect, useRef } from 'react';

const CategoryNavigation = ({ categories, activeCategory, onSelect }) => {
  const buttonRefs = useRef({});
  const navRef = useRef(null);

  useEffect(() => {
    const button = buttonRefs.current[activeCategory];
    const nav = navRef.current;
    if (!button || !nav) return;
    const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
    const targetLeft = buttonCenter - nav.clientWidth / 2;
    const maxScroll = nav.scrollWidth - nav.clientWidth;
    nav.scrollTo({ left: Math.max(0, Math.min(targetLeft, maxScroll)), behavior: 'auto' });
  }, [activeCategory]);

  const handleSelect = (categoryId) => {
    onSelect(categoryId);
  };

  return (
    <nav ref={navRef} className="category-nav" aria-label="Menü kategorileri">
      <div className="category-nav__inner">
        {categories.map((category) => (
          <button
            ref={(element) => {
              if (element) buttonRefs.current[category.id] = element;
              else delete buttonRefs.current[category.id];
            }}
            type="button"
            key={category.id}
            className={activeCategory === category.id ? 'is-active' : ''}
            onClick={() => handleSelect(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNavigation;