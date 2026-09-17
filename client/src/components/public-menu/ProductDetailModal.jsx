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
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const dragOffsetRef = useRef(0);

  useEffect(() => {
    setClosing(false);
    setDragOffset(0);
    dragOffsetRef.current = 0;
    dragStartY.current = null;
  }, [product]);

  if (!product) return null;

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 220);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (sheetRef.current?.scrollTop === 0) dragStartY.current = event.clientY;
  };

  const handlePointerMove = (event) => {
    if (dragStartY.current === null || closing) return;
    const offset = event.clientY - dragStartY.current;
    const nextOffset = Math.max(0, offset);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const handlePointerUp = () => {
    if (dragStartY.current === null) return;
    const shouldClose = dragOffsetRef.current > 100;
    dragStartY.current = null;
    dragOffsetRef.current = 0;
    if (shouldClose) handleClose();
    else setDragOffset(0);
  };

  return (
    <div className={`public-modal-backdrop ${closing ? 'is-closing' : ''}`} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && handleClose()}>
      <div ref={sheetRef} className="public-modal public-sheet" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} style={dragOffset ? { transform: `translateY(${dragOffset}px)` } : undefined}>
        <button type="button" className="public-modal__close" onClick={handleClose} aria-label="Kapat">×</button>
        <div className="public-modal__content">
          <div className="sheet-handle" />
          {product.image && <img className="public-modal__image" src={product.image} alt="" />}
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