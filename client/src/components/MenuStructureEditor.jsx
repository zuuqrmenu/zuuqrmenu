import { useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ProductModal } from './ProductManager';
import { menuService } from '../services/menuService';

const getId = (item) => String(item?._id || item?.id);
const getCategoryId = (product) => String(product?.categoryId?._id || product?.categoryId);

const buildColumns = (categories, products) => categories.map((category) => ({
  category,
  products: products
    .filter((product) => getCategoryId(product) === getId(category))
    .sort((first, second) => (first.displayOrder || 0) - (second.displayOrder || 0) || first.name.localeCompare(second.name)),
}));

const DragHandle = ({ label }) => <span className="menu-structure-drag-handle" title={label} aria-hidden="true">⋮⋮</span>;
export const ProductIcon = ({ name }) => {
  const paths = {
    edit: <><path d="m4 16.5-.8 4.3 4.3-.8L19.2 8.3a2.4 2.4 0 0 0-3.4-3.4L4 16.5Z" /><path d="m14.5 6.5 3 3" /></>,
    pause: <><rect x="5" y="4" width="4" height="16" rx="1" /><rect x="15" y="4" width="4" height="16" rx="1" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    trash: <><path d="M4 7h16M10 11v5M14 11v5" /><path d="m6 7 .7 13h10.6L18 7M9 7V4h6v3" /></>,
    more: <><circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>;
};

const OverflowActionMenu = ({ label, items, disabled = false, menuId, openMenuId, onOpenMenu }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const closeOtherMenus = (event) => {
      if (event.detail !== menuRef.current) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnPointerDown);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('menu-structure-overflow-open', closeOtherMenus);
    return () => {
      document.removeEventListener('pointerdown', closeOnPointerDown);
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('menu-structure-overflow-open', closeOtherMenus);
    };
  }, [open]);

  return (
    <div ref={menuRef} className={`menu-structure-overflow ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="menu-structure-overflow__trigger"
        aria-label={label}
        aria-expanded={open}
        title={label}
        disabled={disabled}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => {
            if (!current) document.dispatchEvent(new CustomEvent('menu-structure-overflow-open', { detail: menuRef.current }));
            return !current;
          });
        }}
      >
        <ProductIcon name="more" />
      </button>
      {open && <div className="menu-structure-overflow__menu" role="menu">
        {items.map((item) => (
          <button
            type="button"
            role="menuitem"
            key={item.label}
            className={`menu-structure-overflow__item ${item.tone ? `is-${item.tone}` : ''}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => { event.stopPropagation(); setOpen(false); item.onSelect(); }}
          >
            <ProductIcon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>}
    </div>
  );
};

const SortableProduct = ({ product, disabled, onEdit, onToggleAvailability, onToggleFeatured, onDelete, openMenuId, onOpenMenu }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `product:${getId(product)}` });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <article ref={setNodeRef} style={style} className={`menu-structure-product ${isDragging ? 'is-dragging' : ''}`}>
      <button type="button" className="menu-structure-product__handle" {...attributes} {...listeners} aria-label={`${product.name} ürününü taşı`}><DragHandle label="Ürünü taşı" /></button>
      {product.image ? <img className="menu-structure-product__image" src={product.image} alt="" /> : <span className="menu-structure-product__image menu-structure-product__image--empty" aria-hidden="true">✦</span>}
      <div className="menu-structure-product__content"><div className="menu-structure-product__title-row"><h4>{product.name}</h4><span className={product.isAvailable ? 'is-available' : 'is-unavailable'}>{product.isAvailable ? 'Mevcut' : 'Tükendi'}</span>{product.isFeatured && <span className="is-featured">Öne Çıkan</span>}</div><p>₺{Number(product.price).toFixed(2)}</p>{product.shortDescription && <small>{product.shortDescription}</small>}</div>
      <OverflowActionMenu menuId={`product:${getId(product)}`} openMenuId={openMenuId} onOpenMenu={onOpenMenu} label={`${product.name} işlemleri`} disabled={disabled} items={[{ label: 'Düzenle', icon: 'edit', onSelect: () => onEdit(product) }, { label: product.isAvailable ? 'Pasifleştir' : 'Aktifleştir', icon: product.isAvailable ? 'pause' : 'play', tone: product.isAvailable ? 'neutral' : 'success', onSelect: () => onToggleAvailability(product) }, { label: product.isFeatured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar', icon: 'star', tone: product.isFeatured ? 'featured' : 'gold', onSelect: () => onToggleFeatured(product) }, { label: 'Sil', icon: 'trash', tone: 'danger', onSelect: () => onDelete(product) }]} />
    </article>
  );
};

const SortableCategory = ({ column, actionId, onEdit, onToggle, onDelete, onAddProduct, openMenuId, onOpenMenu }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `category:${getId(column.category)}` });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `category-drop:${getId(column.category)}` });
  const setRefs = (node) => { setNodeRef(node); setDropRef(node); };

  return (
    <section ref={setRefs} style={{ transform: CSS.Transform.toString(transform), transition }} className={`menu-structure-category ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-drop-target' : ''}`}>
      <header className="menu-structure-category__header"><div className="menu-structure-category__identity"><button type="button" className="menu-structure-category__handle" {...attributes} {...listeners} aria-label={`${column.category.name} kategorisini taşı`}><DragHandle label="Kategoriyi taşı" /></button><div><h3>{column.category.name}</h3>{column.category.description && <p>{column.category.description}</p>}<small>{column.products.length} ürün</small></div></div><OverflowActionMenu menuId={`category:${getId(column.category)}`} openMenuId={openMenuId} onOpenMenu={onOpenMenu} label={`${column.category.name} işlemleri`} disabled={!!actionId} items={[{ label: 'Düzenle', icon: 'edit', onSelect: () => onEdit(column.category) }, { label: column.category.isActive ? 'Pasifleştir' : 'Aktifleştir', icon: column.category.isActive ? 'pause' : 'play', tone: column.category.isActive ? 'neutral' : 'success', onSelect: () => onToggle(column.category) }, { label: 'Sil', icon: 'trash', tone: 'danger', onSelect: () => onDelete(column.category) }]} openMenuId={openMenuId} onOpenMenu={onOpenMenu} />
      </header>
      <div ref={setDropRef} className={`menu-structure-category__products ${isOver ? 'is-drop-target' : ''}`}><SortableContext items={column.products.map((product) => `product:${getId(product)}`)} strategy={verticalListSortingStrategy}>{column.products.map((product) => <SortableProduct key={getId(product)} product={product} disabled={!!actionId} openMenuId={openMenuId} onOpenMenu={onOpenMenu} onEdit={onAddProduct.edit} onToggleAvailability={onAddProduct.toggleAvailability} onToggleFeatured={onAddProduct.toggleFeatured} onDelete={onAddProduct.delete} />)}</SortableContext>{column.products.length === 0 && <p className="menu-structure-empty">Bu kategoride henüz ürün yok.</p>}</div>
    </section>
  );
};

const MenuStructureEditor = ({ categories, products, actionId, onEditCategory, onToggleCategory, onDeleteCategory, onAddCategory, onMessage, onRefresh }) => {
  const [columns, setColumns] = useState(() => buildColumns(categories, products));
  const [activeId, setActiveId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalCategory, setProductModalCategory] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const dragStartColumns = useRef(columns);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => setColumns(buildColumns(categories, products)), [categories, products]);

  const productMap = useMemo(() => new Map(columns.flatMap((column) => column.products.map((product) => [getId(product), product]))), [columns]);
  const activeProduct = activeId?.startsWith('product:') ? productMap.get(activeId.slice(8)) : null;
  const activeCategory = activeId?.startsWith('category:') ? columns.find((column) => getId(column.category) === activeId.slice(9))?.category : null;

  const persistCategoryOrder = async (nextColumns, previousColumns) => {
    try {
      await Promise.all(nextColumns.map((column, index) => menuService.updateCategory(getId(column.category), { displayOrder: index })));
      onMessage('Kategori sırası güncellendi.');
    } catch (error) {
      setColumns(previousColumns);
      onMessage(error.response?.data?.error || 'Kategori sırası güncellenemedi.', true);
    }
  };

  const persistProductOrder = async (nextColumns, previousColumns, affectedCategoryIds) => {
    try {
      const updates = nextColumns.filter((column) => affectedCategoryIds.has(getId(column.category))).flatMap((column) => column.products.map((product, index) => menuService.updateProduct(getId(product), { categoryId: getId(column.category), displayOrder: index })));
      await Promise.all(updates);
      onMessage('Ürün sırası güncellendi.');
    } catch (error) {
      setColumns(previousColumns);
      onMessage(error.response?.data?.error || 'Ürün sırası güncellenemedi.', true);
    }
  };

  const findProductLocation = (currentColumns, id) => currentColumns.reduce((found, column, columnIndex) => {
    const productIndex = column.products.findIndex((product) => getId(product) === id);
    return productIndex === -1 ? found : { columnIndex, productIndex };
  }, null);

  const moveProduct = (currentColumns, activeProductId, overId) => {
    const source = findProductLocation(currentColumns, activeProductId);
    if (!source) return currentColumns;
    const targetProductId = overId.startsWith('product:') ? overId.slice(8) : null;
    const targetCategoryId = overId.startsWith('category-drop:') ? overId.slice(15) : overId.startsWith('category:') ? overId.slice(9) : targetProductId ? getCategoryId(currentColumns.flatMap((column) => column.products).find((product) => getId(product) === targetProductId)) : null;
    if (!targetCategoryId) return currentColumns;
    const targetColumnIndex = currentColumns.findIndex((column) => getId(column.category) === targetCategoryId);
    if (targetColumnIndex === -1 || targetColumnIndex === source.columnIndex) return currentColumns;
    const targetProductIndex = targetProductId ? currentColumns[targetColumnIndex].products.findIndex((product) => getId(product) === targetProductId) : currentColumns[targetColumnIndex].products.length;
    const nextColumns = currentColumns.map((column) => ({ ...column, products: [...column.products] }));
    const [movingProduct] = nextColumns[source.columnIndex].products.splice(source.productIndex, 1);
    nextColumns[targetColumnIndex].products.splice(Math.max(0, targetProductIndex), 0, movingProduct);
    return nextColumns;
  };

  const getTargetCategoryId = (currentColumns, overId) => {
    if (overId.startsWith('category-drop:')) return overId.slice(15);
    if (overId.startsWith('category:')) return overId.slice(9);
    if (overId.startsWith('product:')) {
      const target = currentColumns.flatMap((column) => column.products).find((product) => getId(product) === overId.slice(8));
      return target ? getCategoryId(target) : null;
    }
    return null;
  };

  const reorderWithinCategory = (currentColumns, activeProductId, overId) => {
    const source = findProductLocation(currentColumns, activeProductId);
    const targetCategoryId = getTargetCategoryId(currentColumns, overId);
    if (!source || !targetCategoryId || getId(currentColumns[source.columnIndex].category) !== targetCategoryId) return currentColumns;
    const targetIndex = overId.startsWith('product:') ? currentColumns[source.columnIndex].products.findIndex((product) => getId(product) === overId.slice(8)) : currentColumns[source.columnIndex].products.length - 1;
    if (targetIndex < 0 || targetIndex === source.productIndex) return currentColumns;
    return currentColumns.map((column, index) => index === source.columnIndex ? { ...column, products: arrayMove(column.products, source.productIndex, targetIndex) } : column);
  };

  const handleDragStart = ({ active }) => { dragStartColumns.current = columns; setActiveId(String(active.id)); };
  const handleDragOver = ({ active, over }) => {
    if (!over || !String(active.id).startsWith('product:')) return;
    const activeProductId = String(active.id).slice(8);
    const overId = String(over.id);
    setColumns((current) => {
      const source = findProductLocation(current, activeProductId);
      const targetCategoryId = getTargetCategoryId(current, overId);
      if (!source || !targetCategoryId) return current;
      const sourceCategoryId = getId(current[source.columnIndex].category);
      const originalLocation = findProductLocation(dragStartColumns.current, activeProductId);
      const originalCategoryId = originalLocation ? getId(dragStartColumns.current[originalLocation.columnIndex].category) : sourceCategoryId;
      if (sourceCategoryId === targetCategoryId) return originalCategoryId === sourceCategoryId ? current : reorderWithinCategory(current, activeProductId, overId);
      return moveProduct(current, activeProductId, overId);
    });
  };
  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const activeKey = String(active.id);
    if (activeKey.startsWith('category:')) {
      const fromIndex = columns.findIndex((column) => `category:${getId(column.category)}` === activeKey);
      const overCategoryId = String(over.id).startsWith('category-drop:') ? String(over.id).slice(15) : String(over.id).slice(9);
      const toIndex = columns.findIndex((column) => getId(column.category) === overCategoryId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
      const previous = columns;
      const next = [...columns];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setColumns(next);
      await persistCategoryOrder(next, previous);
      return;
    }
    if (!activeKey.startsWith('product:')) return;
    const previous = dragStartColumns.current;
    const next = columns;
    const affected = new Set();
    const originalLocation = findProductLocation(previous, activeKey.slice(8));
    if (originalLocation) affected.add(getId(previous[originalLocation.columnIndex].category));
    const location = findProductLocation(next, activeKey.slice(8));
    if (location) affected.add(getId(next[location.columnIndex].category));
    const overKey = String(over.id);
    const destination = overKey.startsWith('category-drop:') || overKey.startsWith('category:')
      ? (overKey.startsWith('category-drop:') ? overKey.slice(15) : overKey.slice(9))
      : findProductLocation(next, overKey.slice(8))?.columnIndex;
    if (typeof destination === 'string') affected.add(destination);
    const targetCategoryId = getTargetCategoryId(next, String(over.id));
    const originalCategoryId = originalLocation ? getId(previous[originalLocation.columnIndex].category) : null;
    const currentCategoryId = location ? getId(next[location.columnIndex].category) : null;
    const resolvedNext = originalCategoryId === targetCategoryId && currentCategoryId === originalCategoryId
      ? reorderWithinCategory(next, activeKey.slice(8), String(over.id))
      : currentCategoryId === targetCategoryId ? next : moveProduct(next, activeKey.slice(8), String(over.id));
    setColumns(resolvedNext);
    await persistProductOrder(resolvedNext, previous, affected);
  };

  const handleProductMessage = async (message, isError = false) => { onMessage(message, isError); if (!isError) await onRefresh(); };
  const productActions = {
    open: (category) => { setEditingProduct(null); setProductModalCategory(category); },
    edit: (product) => { setEditingProduct(product); setProductModalCategory(null); },
    toggleAvailability: async (product) => { try { const result = await menuService.toggleAvailability(getId(product)); handleProductMessage(result.message); } catch (error) { onMessage(error.response?.data?.error || 'Mevcudiyet güncellenemedi.', true); } },
    toggleFeatured: async (product) => { try { const result = await menuService.toggleFeatured(getId(product)); handleProductMessage(result.message); } catch (error) { onMessage(error.response?.data?.error || 'Öne çıkarma güncellenemedi.', true); } },
    delete: (product) => setDeleteConfirmation({ type: 'product', item: product }),
  };

  const requestCategoryDelete = (category) => setDeleteConfirmation({ type: 'category', item: category });
  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const { type, item } = deleteConfirmation;
    setDeleteConfirmation(null);
    if (type === 'category') {
      await onDeleteCategory(item);
      return;
    }
    try {
      const result = await menuService.deleteProduct(getId(item));
      await handleProductMessage(result.message);
    } catch (error) {
      onMessage(error.response?.data?.error || 'Ürün silinemedi.', true);
    }
  };

  const hasCategories = columns.length > 0;
  const openHeaderProductModal = () => {
    if (!hasCategories) {
      onMessage('Önce kategori eklemelisiniz.', true);
      return;
    }
    productActions.open(columns[0].category);
  };

  return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={() => setActiveId(null)}><section className="menu-structure-section"><header className="menu-structure-section__header"><div><p className="menu-publish-card__eyebrow">Menü</p><h3>Menü İçeriği</h3><p>{categories.length} kategori menünüzde yer alıyor.</p></div><div className="menu-structure-section__actions"><button type="button" className="menu-structure-add-category" onClick={onAddCategory}>+ Kategori Ekle</button><button type="button" className={`menu-structure-add-product ${!hasCategories ? 'is-disabled' : ''}`} aria-disabled={!hasCategories} onMouseEnter={() => !hasCategories && onMessage('Önce kategori eklemelisiniz.', true)} onClick={openHeaderProductModal}>+ Ürün Ekle</button></div></header><div className="menu-structure-board"><SortableContext items={columns.map((column) => `category:${getId(column.category)}`)} strategy={verticalListSortingStrategy}>{columns.map((column) => <SortableCategory key={getId(column.category)} column={column} actionId={actionId} onEdit={onEditCategory} onToggle={onToggleCategory} onDelete={requestCategoryDelete} onAddProduct={productActions} />)}</SortableContext>{columns.length === 0 && <div className="menu-structure-empty menu-structure-empty--board">Henüz kategori yok. Menü yapınızı oluşturmak için bir kategori ekleyin.</div>}</div></section><DragOverlay>{activeProduct ? <div className="menu-structure-drag-preview">{activeProduct.name}</div> : activeCategory ? <div className="menu-structure-drag-preview">{activeCategory.name}</div> : null}</DragOverlay>{(editingProduct || productModalCategory) && <ProductModal product={editingProduct} categoryId={getId(productModalCategory || editingProduct?.categoryId)} categories={categories} onClose={() => { setEditingProduct(null); setProductModalCategory(null); }} onSaved={(message) => { setEditingProduct(null); setProductModalCategory(null); handleProductMessage(message); }} />}{deleteConfirmation && <div className="publish-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDeleteConfirmation(null)}><div className="publish-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-confirmation-title"><h2 id="delete-confirmation-title">{deleteConfirmation.type === 'product' ? 'Ürün silinecek' : 'Kategori silinecek'}</h2><p>{deleteConfirmation.type === 'product' ? 'Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.' : 'Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}</p><div className="publish-dialog__actions"><button type="button" className="publish-dialog__cancel" onClick={() => setDeleteConfirmation(null)}>Vazgeç</button><button type="button" className="publish-dialog__confirm publish-dialog__confirm--danger" onClick={confirmDelete}>Sil</button></div></div></div>}</DndContext>;
};

export default MenuStructureEditor;