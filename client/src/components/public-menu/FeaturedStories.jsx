import { useState, useMemo } from 'react';
import BlurImage from '../common/BlurImage';

const FeaturedStories = ({ products, onSelect }) => {
  const [viewed, setViewed] = useState(() => {
    try {
      const saved = sessionStorage.getItem('zuulab_viewed_stories');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (_) {
      return new Set();
    }
  });

  const featured = useMemo(() => {
    const list = products || [];
    // 1. Öne çıkan ve fotoğrafı olan ürünler
    const featuredWithImages = list.filter((p) => p?.isFeatured && p?.image);
    if (featuredWithImages.length >= 2) return featuredWithImages;

    // 2. Öne çıkan tüm ürünler
    const allFeatured = list.filter((p) => p?.isFeatured);
    if (allFeatured.length >= 2) return allFeatured;

    // 3. Fotoğraflı ürünler
    const withImages = list.filter((p) => p?.image);
    if (withImages.length > 0) return withImages.slice(0, 12);

    // 4. Tüm ürünler (en fazla 12 adet)
    return list.slice(0, 12);
  }, [products]);

  // Görüntülenen hikayeler en sağa (listenin sonuna) taşınır
  const sortedFeatured = useMemo(() => {
    if (!featured.length) return [];
    if (!viewed.size) return featured;

    const unviewed = featured.filter((p) => !viewed.has(String(p.id || p._id)));
    const viewedItems = featured.filter((p) => viewed.has(String(p.id || p._id)));
    return [...unviewed, ...viewedItems];
  }, [featured, viewed]);

  if (!sortedFeatured.length) return null;

  const handleClick = (product) => {
    const prodId = String(product.id || product._id);
    setViewed((prev) => {
      const next = new Set([...prev, prodId]);
      try {
        sessionStorage.setItem('zuulab_viewed_stories', JSON.stringify([...next]));
      } catch (_) {}
      return next;
    });
    onSelect?.(product);
  };

  return (
    <section className="featured-stories bistro-stories" aria-label="Öne çıkan ürünler">
      <div className="featured-stories__header bistro-stories__header">
        <span className="featured-stories__eyebrow bistro-stories__eyebrow">Öne Çıkanlar</span>
      </div>
      <div className="featured-stories__row bistro-stories__row" role="list">
        {sortedFeatured.map((product) => {
          const prodId = String(product.id || product._id);
          const isViewed = viewed.has(prodId);
          return (
            <button
              key={prodId}
              type="button"
              className={`featured-story bistro-story ${isViewed ? 'is-viewed' : 'is-unviewed'}`}
              onClick={() => handleClick(product)}
              aria-label={product.name}
            >
              <span className="featured-story__ring bistro-story__ring" aria-hidden="true">
                <span className="featured-story__thumb bistro-story__thumb">
                  {product.image ? (
                    <BlurImage src={product.image} alt={`${product.name} görseli`} loading="lazy" />
                  ) : (
                    <span aria-hidden="true">{product.name.charAt(0)}</span>
                  )}
                </span>
              </span>
              <span className="featured-story__name bistro-story__name">{product.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedStories;
