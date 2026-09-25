import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { menuService } from '../services/menuService';

const FolderDeleteIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const TrashIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EraserTextIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="11" x2="12" y2="11" />
  </svg>
);

const GlobeIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const FolderIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const BulkMenuActionsModal = ({
  open,
  categories = [],
  products = [],
  onClose,
  onSuccess,
  onError,
}) => {
  // Action type: 'DELETE_CATEGORIES' | 'DELETE_PRODUCTS' | 'CLEAR_DESCRIPTIONS'
  const [actionType, setActionType] = useState('DELETE_CATEGORIES');
  // Scope: 'ALL' | 'CATEGORY'
  const [scope, setScope] = useState('ALL');
  // Selected category for category-based scope
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => (categories[0]?._id || ''));
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  const handleClose = (callback) => {
    if (isClosing || processing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsConfirmStep(false);
      if (typeof callback === 'function') callback();
      else onClose?.();
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !processing) {
        if (isConfirmStep) {
          setIsConfirmStep(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing, isConfirmStep, processing]);

  if (!open) return null;

  const isDeleteCategoriesAction = actionType === 'DELETE_CATEGORIES';
  const isDeleteProductsAction = actionType === 'DELETE_PRODUCTS';
  const isClearDescriptionsAction = actionType === 'CLEAR_DESCRIPTIONS';
  const isCategoryScope = scope === 'CATEGORY';

  const selectedCategory = categories.find((c) => String(c._id) === String(selectedCategoryId));
  const categoryProductsCount = selectedCategory
    ? products.filter((p) => String(p.categoryId?._id || p.categoryId) === String(selectedCategory._id)).length
    : 0;

  const handleExecute = async () => {
    setProcessing(true);
    try {
      let result;
      const catId = isCategoryScope ? selectedCategoryId : undefined;
      const isAll = !isCategoryScope;

      if (isDeleteCategoriesAction) {
        result = await menuService.bulkDeleteCategories({
          categoryId: catId,
          all: isAll,
        });
      } else if (isDeleteProductsAction) {
        result = await menuService.bulkDeleteProducts({
          categoryId: catId,
          all: isAll,
        });
      } else {
        result = await menuService.bulkClearDescriptions({
          categoryId: catId,
          all: isAll,
        });
      }

      handleClose(() => {
        onSuccess?.(result?.message || 'İşlem başarıyla tamamlandı.');
      });
    } catch (err) {
      onError?.(err.response?.data?.error || 'İşlem gerçekleştirilirken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  return createPortal(
    <div
      className={`bulk-actions-modal-backdrop ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !processing && handleClose()}
    >
      <div
        className={`bulk-actions-modal-card ${isClosing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-actions-title"
      >
        {/* Header */}
        <div className="bulk-actions-modal-header">
          <div className="bulk-actions-modal-header-left">
            <div className={`bulk-actions-header-icon ${!isClearDescriptionsAction ? 'is-danger' : 'is-warning'}`}>
              {isDeleteCategoriesAction ? (
                <FolderDeleteIcon size={20} />
              ) : isDeleteProductsAction ? (
                <TrashIcon size={20} />
              ) : (
                <EraserTextIcon size={20} />
              )}
            </div>
            <div>
              <h3 id="bulk-actions-title" className="bulk-actions-modal-title">
                {isConfirmStep ? 'İşlemi Onaylayın' : 'Toplu Menü İşlemleri'}
              </h3>
              <p className="bulk-actions-modal-desc">
                {isConfirmStep
                  ? 'Lütfen yapılacak işlemi dikkatlice kontrol edin'
                  : 'Kategorileri, ürünleri veya ürün açıklamalarını toplu olarak yönetin'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={processing}
            onClick={() => handleClose()}
            className="bulk-actions-modal-close"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        {/* Step 1: Selection View */}
        {!isConfirmStep ? (
          <div className="bulk-actions-body">
            {/* 1. Primary Action Type Selector (3 Options) */}
            <div className="bulk-actions-section">
              <label className="bulk-actions-section-title">1. Yapılacak İşlemi Seçin</label>
              <div className="bulk-actions-type-stack">
                {/* Option 1: Kategorileri Sil (İlk Sırada) */}
                <button
                  type="button"
                  onClick={() => setActionType('DELETE_CATEGORIES')}
                  className={`bulk-action-type-btn is-danger ${isDeleteCategoriesAction ? 'is-active' : ''}`}
                >
                  <div className="bulk-action-type-btn__icon">
                    <FolderDeleteIcon size={20} />
                  </div>
                  <div className="bulk-action-type-btn__content">
                    <span className="bulk-action-type-btn__title">Kategorileri Sil</span>
                    <span className="bulk-action-type-btn__desc">Kategorileri ve bağlı tüm ürünlerini menüden silin</span>
                  </div>
                  <span className={`bulk-action-type-btn__radio ${isDeleteCategoriesAction ? 'is-checked' : ''}`} />
                </button>

                {/* Option 2: Ürünleri Sil */}
                <button
                  type="button"
                  onClick={() => setActionType('DELETE_PRODUCTS')}
                  className={`bulk-action-type-btn is-danger ${isDeleteProductsAction ? 'is-active' : ''}`}
                >
                  <div className="bulk-action-type-btn__icon">
                    <TrashIcon size={20} />
                  </div>
                  <div className="bulk-action-type-btn__content">
                    <span className="bulk-action-type-btn__title">Ürünleri Sil</span>
                    <span className="bulk-action-type-btn__desc">Kategorileri koruyarak ürünleri menüden silin</span>
                  </div>
                  <span className={`bulk-action-type-btn__radio ${isDeleteProductsAction ? 'is-checked' : ''}`} />
                </button>

                {/* Option 3: Açıklamaları Sil */}
                <button
                  type="button"
                  onClick={() => setActionType('CLEAR_DESCRIPTIONS')}
                  className={`bulk-action-type-btn is-warning ${isClearDescriptionsAction ? 'is-active' : ''}`}
                >
                  <div className="bulk-action-type-btn__icon">
                    <EraserTextIcon size={20} />
                  </div>
                  <div className="bulk-action-type-btn__content">
                    <span className="bulk-action-type-btn__title">Açıklamaları Sil</span>
                    <span className="bulk-action-type-btn__desc">Ürünlerin metin açıklamalarını temizleyin</span>
                  </div>
                  <span className={`bulk-action-type-btn__radio ${isClearDescriptionsAction ? 'is-checked' : ''}`} />
                </button>
              </div>
            </div>

            {/* 2. Scope Selector */}
            <div className="bulk-actions-section">
              <label className="bulk-actions-section-title">2. Kapsam Seçin</label>
              <div className="bulk-actions-scope-selector">
                <button
                  type="button"
                  onClick={() => setScope('ALL')}
                  className={`bulk-actions-scope-pill ${scope === 'ALL' ? 'is-active' : ''}`}
                >
                  <GlobeIcon size={16} />
                  <span>
                    {isDeleteCategoriesAction
                      ? `Tüm Kategoriler (${categories.length})`
                      : `Tüm Menü (${products.length} ürün)`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setScope('CATEGORY')}
                  className={`bulk-actions-scope-pill ${scope === 'CATEGORY' ? 'is-active' : ''}`}
                >
                  <FolderIcon size={16} />
                  <span>
                    {isDeleteCategoriesAction ? 'Seçili Kategori' : 'Kategori Bazlı'}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Category Selector (Only if scope is CATEGORY) */}
            {isCategoryScope && (
              <div className="bulk-actions-section bulk-category-box animate-fadeIn">
                <label htmlFor="bulk-category-select" className="bulk-category-label">
                  Hedef Kategori:
                </label>
                {categories.length === 0 ? (
                  <p className="bulk-category-empty">
                    Menünüzde henüz bir kategori bulunmuyor.
                  </p>
                ) : (
                  <select
                    id="bulk-category-select"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="bulk-category-select"
                  >
                    {categories.map((cat) => {
                      const count = products.filter(
                        (p) => String(p.categoryId?._id || p.categoryId) === String(cat._id)
                      ).length;
                      return (
                        <option key={cat._id} value={cat._id}>
                          {cat.name} ({count} ürün)
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}

            {/* 4. Summary Preview Box */}
            <div className="bulk-actions-summary">
              <div className="bulk-actions-summary-row">
                <span className="bulk-actions-summary-label">Seçilen İşlem:</span>
                <span className={`bulk-actions-summary-value font-bold ${!isClearDescriptionsAction ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {isDeleteCategoriesAction
                    ? (isCategoryScope ? 'Seçili Kategori ve Ürünlerini Silme' : 'Tüm Kategorileri ve Ürünleri Silme')
                    : isDeleteProductsAction
                    ? (isCategoryScope ? 'Kategori Bazlı Ürün Silme' : 'Tüm Menüdeki Ürünleri Silme')
                    : (isCategoryScope ? 'Kategori Bazlı Açıklama Temizleme' : 'Tüm Ürün Açıklamalarını Temizleme')}
                </span>
              </div>
              <div className="bulk-actions-summary-row">
                <span className="bulk-actions-summary-label">Etkilenecek Öğe:</span>
                <span className="bulk-actions-summary-value font-medium">
                  {isDeleteCategoriesAction ? (
                    isCategoryScope
                      ? `1 kategori ("${selectedCategory?.name || 'Seçili'}") + ${categoryProductsCount} ürün`
                      : `${categories.length} kategori + ${products.length} ürün`
                  ) : (
                    isCategoryScope
                      ? `${categoryProductsCount} ürün ("${selectedCategory?.name || 'Seçili'}")`
                      : `${products.length} ürün (Tüm Menü)`
                  )}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bulk-actions-modal-footer">
              <button
                type="button"
                onClick={() => handleClose()}
                className="bulk-actions-cancel-btn"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={isCategoryScope && !selectedCategoryId}
                onClick={() => setIsConfirmStep(true)}
                className={`bulk-actions-next-btn ${!isClearDescriptionsAction ? 'is-danger-btn' : 'is-warning-btn'}`}
              >
                Devam Et →
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Confirmation View */
          <div className="bulk-actions-body animate-fadeIn">
            <div className={`bulk-action-confirm-box ${!isClearDescriptionsAction ? 'is-danger' : 'is-warning'}`}>
              <div className="bulk-action-confirm-box__icon">
                {!isClearDescriptionsAction ? '⚠️' : 'ℹ️'}
              </div>
              <div className="bulk-action-confirm-box__content">
                <h4 className="bulk-action-confirm-box__title">
                  {isDeleteCategoriesAction ? (
                    isCategoryScope
                      ? `"${selectedCategory?.name}" Kategorisini ve Bağlı Ürünlerini Sil`
                      : 'Tüm Kategorileri ve Bağlı Bütün Ürünleri Sil'
                  ) : isDeleteProductsAction ? (
                    isCategoryScope
                      ? `"${selectedCategory?.name}" Kategorisindeki Ürünleri Sil`
                      : 'Tüm Menüdeki Ürünleri Sil'
                  ) : (
                    isCategoryScope
                      ? `"${selectedCategory?.name}" Ürünlerinin Açıklamalarını Sil`
                      : 'Tüm Ürünlerin Açıklamalarını Sil'
                  )}
                </h4>
                <p className="bulk-action-confirm-box__text">
                  {isDeleteCategoriesAction ? (
                    isCategoryScope
                      ? `"${selectedCategory?.name}" kategorisi ve altındaki ${categoryProductsCount} adet ürün menünüzden kalıcı olarak silinecektir. Bu işlem geri alınamaz!`
                      : `Menünüzdeki toplam ${categories.length} kategori ve ${products.length} ürün kalıcı olarak silinecektir. Bu işlem geri alınamaz!`
                  ) : isDeleteProductsAction ? (
                    isCategoryScope
                      ? `Kategori yapısı korunarak "${selectedCategory?.name}" altındaki ${categoryProductsCount} ürün silinecektir.`
                      : `Kategorileriniz korunarak menünüzdeki ${products.length} ürün kalıcı olarak silinecektir.`
                  ) : (
                    isCategoryScope
                      ? `"${selectedCategory?.name}" altındaki ${categoryProductsCount} ürünün açıklama metinleri temizlenecektir.`
                      : `Menüdeki ${products.length} ürünün tüm açıklama metinleri temizlenecektir. Ürün adları ve fiyatları korunur.`
                  )}
                </p>
              </div>
            </div>

            <p className="bulk-actions-confirm-note">
              Onayladığınızda değişiklikler veritabanına uygulanacak ve menü içeriğiniz anında güncellenecektir.
            </p>

            <div className="bulk-actions-modal-footer">
              <button
                type="button"
                disabled={processing}
                onClick={() => setIsConfirmStep(false)}
                className="bulk-actions-cancel-btn"
              >
                ← Geri Dön
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleExecute}
                className={`bulk-actions-confirm-btn ${!isClearDescriptionsAction ? 'is-danger' : 'is-warning'}`}
              >
                {processing ? (
                  <>
                    <span className="bulk-action-spinner" />
                    <span>Uygulanıyor...</span>
                  </>
                ) : (
                  <span>Onayla ve Uygula</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default BulkMenuActionsModal;


