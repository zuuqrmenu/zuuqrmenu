import { useEffect, useMemo, useRef, useState } from 'react';
import BlurImage from '../common/BlurImage';

const dietaryLabels = {
  VEGAN: 'Vegan', VEGETARIAN: 'Vejetaryen', GLUTEN_FREE: 'Glutensiz',
  SPICY: 'Acılı', MILD: 'Acısız', HALAL: 'Helal',
};

const detailIcons = {
  calories: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 2.8c.2 3-1.8 4.6-3.2 6.2-1.1 1.2-1.8 2.4-1.8 4.1a4.8 4.8 0 0 0 9.6 0c0-2.2-1.2-4.3-3.2-6.3.1 2-1 3.2-2.1 4-.2-2.1.2-4.8.7-8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  allergen: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 17H3L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 9v4m0 3h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  ingredient: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 8c2.5 0 4.4 1.1 7 3 2.6-1.9 4.5-3 7-3M5 16c2.5 0 4.4-1.1 7-3 2.6 1.9 4.5 3 7 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
};

const DRINK_KEYWORDS = [
  'içecek', 'icecek', 'meşrubat', 'mesrubat', 'kola', 'cola', 'fanta', 'sprite',
  'ayran', 'şalgam', 'salgam', 'soda', 'maden suyu', 'su', 'limonata',
  'meyve suyu', 'smoothie', 'milkshake', 'kahve', 'coffee', 'çay', 'cay',
  'latte', 'espresso', 'cappuccino', 'americano', 'soğuk içecek', 'sıcak içecek',
  'bira', 'şarap', 'kokteyl', 'cocktail', 'drink', 'beverage'
];

const SIDE_KEYWORDS = [
  'patates', 'fries', 'french fries', 'elma dilim', 'cips', 'soğan halkası', 'sogan halkasi',
  'nugget', 'çıtır tavuk', 'tenders', 'atıştırmalık', 'atistirmalik', 'snack', 'yan ürün',
  'ekstra', 'sos', 'dip', 'nachos', 'meze', 'başlangıç', 'baslangic', 'appetizer'
];

const DESSERT_KEYWORDS = [
  'tatlı', 'tatli', 'dessert', 'pasta', 'kek', 'sufle', 'souffle', 'brownie',
  'cheesecake', 'dondurma', 'ice cream', 'waffle', 'baklava', 'kurabiye',
  'cookie', 'pancake', 'kruvasan', 'croissant', 'sütlaç', 'kazandibi', 'tiramisu'
];

const MAIN_KEYWORDS = [
  'burger', 'hamburger', 'cheeseburger', 'pizza', 'makarna', 'pasta',
  'dürüm', 'durum', 'sandviç', 'sandvic', 'tost', 'köfte', 'kofte', 'kebap',
  'döner', 'doner', 'tavuk', 'chicken', 'et', 'steak', 'lahmacun', 'pide',
  'wrap', 'taco', 'hot dog', 'sosis', 'fajita', 'güveç', 'salata', 'salad',
  'kahvaltı', 'kahvalti', 'yemek', 'ana yemek'
];

const classifyItem = (item) => {
  if (!item) return 'FOOD';
  const text = `${item.categoryName || ''} ${item.name || ''} ${item.description || ''} ${item.ingredients?.join(' ') || ''}`.toLocaleLowerCase('tr');

  const hasDrink = DRINK_KEYWORDS.some((kw) => text.includes(kw));
  const hasSide = SIDE_KEYWORDS.some((kw) => text.includes(kw));
  const hasDessert = DESSERT_KEYWORDS.some((kw) => text.includes(kw));
  const hasMain = MAIN_KEYWORDS.some((kw) => text.includes(kw));

  if (hasDrink && !hasMain) return 'DRINK';
  if (hasSide && !hasMain) return 'SIDE';
  if (hasDessert && !hasMain) return 'DESSERT';
  if (hasMain) return 'FOOD';
  if (hasSide) return 'SIDE';
  if (hasDrink) return 'DRINK';
  if (hasDessert) return 'DESSERT';
  return 'FOOD';
};

const ProductDetailModal = ({ product, onClose, allProducts = [], onSelectProduct, themeKey, mode }) => {
  const [closing, setClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isGrid = themeKey === 'GRID';
  const activeMode = mode || (isGrid ? 'DARK' : 'LIGHT');

  const sheetRef = useRef(null);
  const scrollRef = useRef(null);
  const dragStartY = useRef(null);
  const isDragging = useRef(false);
  const isHandleDrag = useRef(false);
  const dragOffsetRef = useRef(0);

  const recommendations = useMemo(() => {
    if (!allProducts || allProducts.length <= 1 || !product) return [];

    const currentType = classifyItem(product);
    const availableItems = allProducts.filter((p) => p.id !== product.id && p.isAvailable !== false);

    // Burger, pizza, makarna vb. yemekler için yan ürün (patates) ve içecekleri öner
    let preferredTypes = [];
    if (currentType === 'FOOD') {
      preferredTypes = ['SIDE', 'DRINK', 'DESSERT'];
    } else if (currentType === 'DESSERT') {
      preferredTypes = ['DRINK'];
    } else if (currentType === 'DRINK') {
      preferredTypes = ['DESSERT', 'SIDE'];
    } else if (currentType === 'SIDE') {
      preferredTypes = ['DRINK', 'FOOD'];
    }

    const candidates = availableItems.filter((item) => {
      const type = classifyItem(item);
      return preferredTypes.includes(type);
    });

    // Eğer uygun eşlikçi/tamamlayıcı ürün yoksa hiçbir şey gösterme
    if (candidates.length === 0) {
      return [];
    }

    return candidates
      .sort((a, b) => {
        const typeA = classifyItem(a);
        const typeB = classifyItem(b);
        const priorityA = preferredTypes.indexOf(typeA);
        const priorityB = preferredTypes.indexOf(typeB);
        if (priorityA !== priorityB) return priorityA - priorityB;

        const hasImgA = a.image ? 1 : 0;
        const hasImgB = b.image ? 1 : 0;
        if (hasImgA !== hasImgB) return hasImgB - hasImgA;

        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      })
      .slice(0, 6);
  }, [allProducts, product]);

  const [hasMoreContent, setHasMoreContent] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setHasMoreContent(remaining > 28);
  };

  useEffect(() => {
    setClosing(false);
    setDragOffset(0);
    dragOffsetRef.current = 0;
    setIsTransitioning(false);
    dragStartY.current = null;
    isDragging.current = false;
    isHandleDrag.current = false;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    const el = scrollRef.current;
    if (!el) return;
    checkScroll();

    const timer = setTimeout(checkScroll, 90);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => checkScroll()) : null;
    ro?.observe(el);

    return () => {
      clearTimeout(timer);
      ro?.disconnect();
    };
  }, [product]);

  // Smooth kinetic mouse drag-to-scroll & fluid wheel support for recommendations carousel
  const recScrollRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const wheelRafRef = useRef(null);
  const momentumRafRef = useRef(null);
  const targetScrollLeftRef = useRef(0);

  const stopAllScrollAnimations = () => {
    if (wheelRafRef.current) {
      cancelAnimationFrame(wheelRafRef.current);
      wheelRafRef.current = null;
    }
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  };

  const handleRecPointerDown = (e) => {
    if (e.button !== 0) return;
    stopAllScrollAnimations();
    isPointerDownRef.current = true;
    pointerStartXRef.current = e.pageX;
    lastPointerXRef.current = e.pageX;
    lastPointerTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
    scrollStartLeftRef.current = recScrollRef.current ? recScrollRef.current.scrollLeft : 0;
    targetScrollLeftRef.current = scrollStartLeftRef.current;
    hasDraggedRef.current = false;
  };

  const handleRecPointerMove = (e) => {
    if (!isPointerDownRef.current || !recScrollRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const moveX = e.pageX - lastPointerXRef.current;

    // Moving average of velocity for smooth exit inertia
    const instantaneousV = moveX / dt;
    dragVelocityRef.current = dragVelocityRef.current * 0.35 + instantaneousV * 0.65;
    lastPointerXRef.current = e.pageX;
    lastPointerTimeRef.current = now;

    const totalDx = e.pageX - pointerStartXRef.current;
    if (Math.abs(totalDx) > 4) {
      hasDraggedRef.current = true;
      recScrollRef.current.classList.add('is-dragging');
    }
    if (hasDraggedRef.current) {
      recScrollRef.current.scrollLeft = scrollStartLeftRef.current - totalDx;
      targetScrollLeftRef.current = recScrollRef.current.scrollLeft;
    }
  };

  const handleRecPointerUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    const el = recScrollRef.current;
    if (el) {
      el.classList.remove('is-dragging');
    }

    // Apply smooth inertia glide if released while moving
    if (el && hasDraggedRef.current && Math.abs(dragVelocityRef.current) > 0.12) {
      stopAllScrollAnimations();
      let velocity = -dragVelocityRef.current * 16;
      const maxVel = 26;
      velocity = Math.max(-maxVel, Math.min(maxVel, velocity));

      const runMomentum = () => {
        if (!el || isPointerDownRef.current || Math.abs(velocity) < 0.25) {
          momentumRafRef.current = null;
          return;
        }
        el.scrollLeft += velocity;
        velocity *= 0.93; // Smooth decelerating glide
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft <= 0 || el.scrollLeft >= maxScroll) {
          momentumRafRef.current = null;
          return;
        }
        momentumRafRef.current = requestAnimationFrame(runMomentum);
      };

      momentumRafRef.current = requestAnimationFrame(runMomentum);
    }

    window.setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  useEffect(() => {
    const onWindowPointerUp = () => {
      if (isPointerDownRef.current) {
        handleRecPointerUp();
      }
    };
    window.addEventListener('pointerup', onWindowPointerUp);
    return () => {
      window.removeEventListener('pointerup', onWindowPointerUp);
      stopAllScrollAnimations();
    };
  }, []);

  useEffect(() => {
    const el = recScrollRef.current;
    if (!el) return;

    let targetScroll = el.scrollLeft;

    const runWheelAnimation = () => {
      if (!el) {
        wheelRafRef.current = null;
        return;
      }
      const maxScroll = el.scrollWidth - el.clientWidth;
      const clampedTarget = Math.max(0, Math.min(maxScroll, targetScroll));
      const diff = clampedTarget - el.scrollLeft;

      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = clampedTarget;
        wheelRafRef.current = null;
        return;
      }

      // 0.13 lerp factor produces a liquid-smooth gliding transition
      el.scrollLeft += diff * 0.13;
      wheelRafRef.current = requestAnimationFrame(runWheelAnimation);
    };

    const onWheel = (e) => {
      if (el.scrollWidth > el.clientWidth) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          const maxScroll = el.scrollWidth - el.clientWidth;
          const atLeft = el.scrollLeft <= 0 && e.deltaY < 0;
          const atRight = Math.ceil(el.scrollLeft + el.clientWidth) >= maxScroll - 1 && e.deltaY > 0;

          if (!atLeft && !atRight) {
            e.preventDefault();
            if (momentumRafRef.current) {
              cancelAnimationFrame(momentumRafRef.current);
              momentumRafRef.current = null;
            }

            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 28;
            else if (e.deltaMode === 2) delta *= 450;

            const basePos = wheelRafRef.current ? targetScroll : el.scrollLeft;
            targetScroll = Math.max(0, Math.min(maxScroll, basePos + delta * 1.05));

            if (!wheelRafRef.current) {
              wheelRafRef.current = requestAnimationFrame(runWheelAnimation);
            }
          }
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelRafRef.current) cancelAnimationFrame(wheelRafRef.current);
    };
  }, [recommendations]);

  if (!product) return null;

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 220);
  };

  // Dedicated handle drag (mouse & touch)
  const handleTopDragStart = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartY.current = e.clientY;
    isDragging.current = true;
    isHandleDrag.current = true;
    setIsTransitioning(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleHandlePointerMove = (e) => {
    if (!isHandleDrag.current || dragStartY.current === null || closing) return;
    const deltaY = e.clientY - dragStartY.current;
    if (deltaY > 0) {
      dragOffsetRef.current = deltaY;
      setDragOffset(deltaY);
    } else {
      dragOffsetRef.current = 0;
      setDragOffset(0);
    }
  };

  const handleHandlePointerUp = () => {
    if (!isHandleDrag.current) return;
    const currentOffset = dragOffsetRef.current;
    isHandleDrag.current = false;
    dragStartY.current = null;
    isDragging.current = false;

    if (currentOffset > 80) {
      handleClose();
    } else {
      setIsTransitioning(true);
      dragOffsetRef.current = 0;
      setDragOffset(0);
      window.setTimeout(() => setIsTransitioning(false), 240);
    }
  };

  // Sheet body touch swipe down when scrolled to top
  const handleSheetTouchStart = (e) => {
    if (e.touches.length !== 1 || closing) return;
    // Do not initiate modal pull-down if touch originates in recommendations carousel
    if (e.target.closest('.modal-recommendations-scroll')) {
      dragStartY.current = null;
      return;
    }
    const touch = e.touches[0];
    const scrollTop = scrollRef.current?.scrollTop ?? sheetRef.current?.scrollTop ?? 0;
    if (scrollTop <= 2) {
      dragStartY.current = touch.clientY;
      isDragging.current = false;
      setIsTransitioning(false);
    }
  };

  const handleSheetTouchMove = (e) => {
    if (dragStartY.current === null || closing) return;
    if (e.target.closest('.modal-recommendations-scroll')) {
      return;
    }
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY.current;
    const scrollTop = scrollRef.current?.scrollTop ?? sheetRef.current?.scrollTop ?? 0;

    if (deltaY > 0 && scrollTop <= 2) {
      isDragging.current = true;
      if (e.cancelable) {
        e.preventDefault();
      }
      dragOffsetRef.current = deltaY;
      setDragOffset(deltaY);
    } else if (deltaY < 0 && isDragging.current) {
      dragOffsetRef.current = 0;
      setDragOffset(0);
      isDragging.current = false;
    }
  };

  const handleSheetTouchEnd = () => {
    if (dragStartY.current === null) return;
    const currentOffset = dragOffsetRef.current;
    dragStartY.current = null;
    isDragging.current = false;

    if (currentOffset > 80) {
      handleClose();
    } else {
      setIsTransitioning(true);
      dragOffsetRef.current = 0;
      setDragOffset(0);
      window.setTimeout(() => setIsTransitioning(false), 240);
    }
  };

  return (
    <div
      className={`public-modal-backdrop ${closing ? 'is-closing' : ''} ${isGrid ? 'public-modal-backdrop--grid' : ''}`}
      data-theme={themeKey}
      data-mode={activeMode}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
      style={dragOffset > 0 ? { opacity: Math.max(0.15, 1 - dragOffset / 420) } : undefined}
    >
      <div
        ref={sheetRef}
        className={`public-modal ${isGrid ? 'public-modal--grid' : ''} ${product.image ? 'has-media' : 'no-media'}`}
        data-theme={themeKey}
        data-mode={activeMode}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        onTouchStart={handleSheetTouchStart}
        onTouchMove={handleSheetTouchMove}
        onTouchEnd={handleSheetTouchEnd}
        onTouchCancel={handleSheetTouchEnd}
        style={{
          transform: dragOffset ? `translateY(${dragOffset}px)` : undefined,
          transition: isTransitioning ? 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
        }}
      >
        <button
          type="button"
          className="public-modal__close"
          onClick={handleClose}
          aria-label="Kapat"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div ref={scrollRef} className="public-modal__scrollable" onScroll={checkScroll}>
          {product.image || !isGrid ? (
            <div className={`public-modal__header-media ${product.image ? 'has-image' : 'no-image'}`}>
              {!isGrid && (
                <div
                  className="sheet-handle-zone"
                  onPointerDown={handleTopDragStart}
                  onPointerMove={handleHandlePointerMove}
                  onPointerUp={handleHandlePointerUp}
                  onPointerCancel={handleHandlePointerUp}
                >
                  <div className="sheet-handle" role="button" tabIndex="0" aria-label="Aşağı kaydırarak kapat" />
                </div>
              )}

              {product.image && (
                <BlurImage
                  className="public-modal__image"
                  src={product.image}
                  alt={`${product.name} görseli`}
                />
              )}
            </div>
          ) : null}

          <div className={`public-modal__content ${!product.image ? 'public-modal__content--no-image' : ''}`}>
          {isGrid ? (
            <>
              <div className="public-modal__grid-head">
                <div className="public-modal__title-box">
                  <h2 id="product-detail-title">{product.name}</h2>
                  {product.isFeatured && <span className="featured-badge">Öne Çıkan</span>}
                </div>
                <div className="public-modal__prices">
                  {product.oldPrice !== null && <del>₺{Number(product.oldPrice).toFixed(0)}</del>}
                  <strong>₺{Number(product.price).toFixed(0)}</strong>
                </div>
              </div>

              {!product.isAvailable && <p className="modal-sold-out">Tükendi</p>}

              {product.description && (
                <p className="public-modal__description">{product.description}</p>
              )}

              {/* Stats / Badges bar */}
              {((product.calories !== null && product.calories !== undefined) || product.dietaryTags?.length > 0) && (
                <div className="modal-stats-bar">
                  {product.calories !== null && product.calories !== undefined && (
                    <span className="modal-stat-item">{product.calories} kcal</span>
                  )}
                  {product.calories !== null && product.calories !== undefined && product.dietaryTags?.length > 0 && (
                    <span className="modal-stat-divider" aria-hidden="true">•</span>
                  )}
                  {product.dietaryTags?.length > 0 && (
                    <span className="modal-stat-item">
                      {product.dietaryTags.map((t) => dietaryLabels[t] || t).join(', ')}
                    </span>
                  )}
                </div>
              )}

              {product.ingredients?.length > 0 && (
                <div className="detail-group">
                  <p className="detail-label">İçindekiler</p>
                  <div className="detail-inline">
                    <span className="detail-inline__icon" aria-hidden="true">{detailIcons.ingredient}</span>
                    <p>{product.ingredients.join(', ')}</p>
                  </div>
                </div>
              )}

              {product.allergens?.length > 0 && (
                <div className="detail-group">
                  <p className="detail-label">Alerjenler</p>
                  <div className="detail-inline">
                    <span className="detail-inline__icon" aria-hidden="true">{detailIcons.allergen}</span>
                    <p>{product.allergens.join(', ')}</p>
                  </div>
                </div>
              )}

              {/* Öneriler (Recommendations) Section */}
              {recommendations.length > 0 && (
                <div className="modal-recommendations-section">
                  <h3 className="modal-recommendations-title">Öneriler</h3>
                  <div
                    ref={recScrollRef}
                    className="modal-recommendations-scroll"
                    onPointerDown={handleRecPointerDown}
                    onPointerMove={handleRecPointerMove}
                    onPointerUp={handleRecPointerUp}
                    onPointerCancel={handleRecPointerUp}
                  >
                    {recommendations.map((rec) => {
                      const hasImage = Boolean(rec.image);
                      return (
                        <button
                          key={rec.id}
                          type="button"
                          className={`modal-rec-card ${hasImage ? 'has-image' : 'no-image'}`}
                          onClick={(e) => {
                            if (hasDraggedRef.current) {
                              e.preventDefault();
                              e.stopPropagation();
                              return;
                            }
                            if (scrollRef.current) {
                              scrollRef.current.scrollTop = 0;
                            }
                            onSelectProduct?.(rec);
                          }}
                          onDragStart={(e) => e.preventDefault()}
                          aria-label={`${rec.name} ürününü görüntüle`}
                        >
                          <div className="modal-rec-card__body">
                            <div className="modal-rec-card__top">
                              <strong className="modal-rec-card__name">{rec.name}</strong>
                              {(rec.shortDescription || rec.description) && (
                                <p className="modal-rec-card__desc">
                                  {rec.shortDescription || rec.description}
                                </p>
                              )}
                            </div>
                            <div className="modal-rec-card__price">
                              {rec.oldPrice !== null && rec.oldPrice !== undefined && (
                                <del>₺{Number(rec.oldPrice).toFixed(0)}</del>
                              )}
                              <strong>₺{Number(rec.price).toFixed(0)}</strong>
                            </div>
                          </div>
                          {hasImage && (
                            <div className="modal-rec-card__visual">
                              <BlurImage src={rec.image} alt={rec.name} loading="lazy" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="modal-grid-footer">
                <span>Powered by zuuqrmenu</span>
              </div>
            </>
          ) : (
            <>
              {product.isFeatured && <span className="featured-badge">Öne Çıkan</span>}
              <h2 id="product-detail-title">{product.name}</h2>
              <div className="public-modal__prices">
                {product.oldPrice !== null && <del>₺{Number(product.oldPrice).toFixed(2)}</del>}
                <strong>₺{Number(product.price).toFixed(2)}</strong>
              </div>
              {!product.isAvailable && <p className="modal-sold-out">Tükendi</p>}
              {product.description && <p className="public-modal__description">{product.description}</p>}
              {product.dietaryTags?.length > 0 && (
                <div className="detail-group">
                  <p className="detail-label">Özellikler</p>
                  <div className="detail-tags">
                    {product.dietaryTags.map((tag) => (
                      <span key={tag} className="detail-badge">
                        <span className="detail-badge__icon">✦</span>{dietaryLabels[tag] || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {product.ingredients?.length > 0 && (
                <div className="detail-group">
                  <p className="detail-label">İçindekiler</p>
                  <div className="detail-inline">
                    <span className="detail-inline__icon" aria-hidden="true">{detailIcons.ingredient}</span>
                    <p>{product.ingredients.join(', ')}</p>
                  </div>
                </div>
              )}
              {product.allergens?.length > 0 && (
                <div className="detail-group">
                  <p className="detail-label">Alerjenler</p>
                  <div className="detail-inline">
                    <span className="detail-inline__icon" aria-hidden="true">{detailIcons.allergen}</span>
                    <p>{product.allergens.join(', ')}</p>
                  </div>
                </div>
              )}
              {product.calories !== null && (
                <div className="detail-group">
                  <p className="detail-label">Kalori</p>
                  <div className="detail-inline">
                    <span className="detail-inline__icon" aria-hidden="true">{detailIcons.calories}</span>
                    <p>{product.calories} kcal</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        </div>

        <div
          className={`public-modal__scroll-fade ${hasMoreContent ? 'is-visible' : ''}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default ProductDetailModal;