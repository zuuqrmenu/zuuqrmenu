import { useEffect, useRef, useState } from 'react';

const dietaryLabels = {
  VEGAN: 'Vegan', VEGETARIAN: 'Vejetaryen', GLUTEN_FREE: 'Glutensiz',
  SPICY: 'Acılı', MILD: 'Acısız', HALAL: 'Helal',
};

const detailIcons = {
  calories: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 2.8c.2 3-1.8 4.6-3.2 6.2-1.1 1.2-1.8 2.4-1.8 4.1a4.8 4.8 0 0 0 9.6 0c0-2.2-1.2-4.3-3.2-6.3.1 2-1 3.2-2.1 4-.2-2.1.2-4.8.7-8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  allergen: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 17H3L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M12 9v4m0 3h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  ingredient: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M5 8c2.5 0 4.4 1.1 7 3 2.6-1.9 4.5-3 7-3M5 16c2.5 0 4.4-1.1 7-3 2.6 1.9 4.5 3 7 3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>,
};

const ProductDetailModal = ({ product, onClose }) => {
  const [closing, setClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const isDragging = useRef(false);
  const isHandleDrag = useRef(false);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    setClosing(false);
    setDragOffset(0);
    dragOffsetRef.current = 0;
    setIsTransitioning(false);
    dragStartY.current = null;
    isDragging.current = false;
    isHandleDrag.current = false;
  }, [product]);

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
    const touch = e.touches[0];
    const scrollTop = sheetRef.current?.scrollTop || 0;
    if (scrollTop <= 2) {
      dragStartY.current = touch.clientY;
      isDragging.current = false;
      setIsTransitioning(false);
    }
  };

  const handleSheetTouchMove = (e) => {
    if (dragStartY.current === null || closing) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStartY.current;
    const scrollTop = sheetRef.current?.scrollTop || 0;

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
      className={`public-modal-backdrop ${closing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && handleClose()}
      style={dragOffset > 0 ? { opacity: Math.max(0.15, 1 - dragOffset / 420) } : undefined}
    >
      <div
        ref={sheetRef}
        className="public-modal public-sheet"
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
        <button type="button" className="public-modal__close" onClick={handleClose} aria-label="Kapat">×</button>
        <div className="public-modal__content">
          <div
            className="sheet-handle-zone"
            onPointerDown={handleTopDragStart}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            onPointerCancel={handleHandlePointerUp}
          >
            <div className="sheet-handle" role="button" tabIndex="0" aria-label="Aşağı kaydırarak kapat" />
          </div>
          {product.image && <img className="public-modal__image" src={product.image} alt={`${product.name} görseli`} />}
          {product.isFeatured && <span className="featured-badge">Öne Çıkan</span>}
          <h2 id="product-detail-title">{product.name}</h2>
          <div className="public-modal__prices">
            {product.oldPrice !== null && <del>₺{Number(product.oldPrice).toFixed(2)}</del>}
            <strong>₺{Number(product.price).toFixed(2)}</strong>
          </div>
          {!product.isAvailable && <p className="modal-sold-out">Tükendi</p>}
          {product.description && <p className="public-modal__description">{product.description}</p>}
          {product.dietaryTags?.length > 0 && <div className="detail-group"><p className="detail-label">Özellikler</p><div className="detail-tags">{product.dietaryTags.map((tag) => <span key={tag} className="detail-badge"><span className="detail-badge__icon">✦</span>{dietaryLabels[tag] || tag}</span>)}</div></div>}
          {product.ingredients?.length > 0 && <div className="detail-group"><p className="detail-label">İçindekiler</p><div className="detail-inline"><span className="detail-inline__icon" aria-hidden="true">{detailIcons.ingredient}</span><p>{product.ingredients.join(', ')}</p></div></div>}
          {product.allergens?.length > 0 && <div className="detail-group"><p className="detail-label">Alerjenler</p><div className="detail-inline"><span className="detail-inline__icon" aria-hidden="true">{detailIcons.allergen}</span><p>{product.allergens.join(', ')}</p></div></div>}
          {product.calories !== null && <div className="detail-group"><p className="detail-label">Kalori</p><div className="detail-inline"><span className="detail-inline__icon" aria-hidden="true">{detailIcons.calories}</span><p>{product.calories} kcal</p></div></div>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;