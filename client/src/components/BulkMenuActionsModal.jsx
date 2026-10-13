import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { menuService } from '../services/menuService';
import '../styles/dashboard-pages.css';

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

const ACTIONS = [
  { id: 'CLEAR_DESCRIPTIONS', title: 'Açıklamaları temizle', desc: 'Ürün adı ve fiyatı kalır, açıklama metinleri silinir.', tone: 'warn', Icon: EraserTextIcon },
  { id: 'DELETE_PRODUCTS', title: 'Ürünleri sil', desc: 'Kategoriler kalır, içlerindeki ürünler silinir.', tone: 'danger', Icon: TrashIcon },
  { id: 'DELETE_CATEGORIES', title: 'Kategorileri sil', desc: 'Kategoriler ve içindeki tüm ürünler silinir.', tone: 'danger', Icon: FolderDeleteIcon },
];

const countFor = (products, categoryId) => products.filter((p) => String(p.categoryId?._id || p.categoryId) === String(categoryId)).length;

const BulkMenuActionsModal = ({ open, categories = [], products = [], onClose, onSuccess, onError }) => {
  // Safest action first: nobody should land on "delete everything" by default.
  const [actionType, setActionType] = useState('CLEAR_DESCRIPTIONS');
  const [scope, setScope] = useState('ALL'); // 'ALL' | 'SELECTED'
  const [selectedIds, setSelectedIds] = useState([]);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [typed, setTyped] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const action = ACTIONS.find((a) => a.id === actionType);
  const isDelete = actionType !== 'CLEAR_DESCRIPTIONS';
  const deletesCategories = actionType === 'DELETE_CATEGORIES';
  const allScope = scope === 'ALL';

  const chosen = allScope ? categories : categories.filter((c) => selectedIds.includes(String(c._id)));
  const productTotal = chosen.reduce((sum, c) => sum + countFor(products, c._id), 0);
  const affectedLabel = deletesCategories
    ? `${chosen.length} kategori, ${productTotal} ürün`
    : `${productTotal} ürün`;
  const needsTyping = isDelete && allScope;
  const canContinue = (allScope ? categories.length > 0 : chosen.length > 0) && (deletesCategories || productTotal > 0 || allScope);
  const canExecute = !processing && (!needsTyping || typed.trim().toLocaleUpperCase('tr-TR') === 'SİL');

  const handleClose = (callback) => {
    if (isClosing || processing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsConfirmStep(false);
      setTyped('');
      if (typeof callback === 'function') callback();
      else onClose?.();
    }, 200);
  };

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape' || processing) return;
      if (isConfirmStep) setIsConfirmStep(false);
      else handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isClosing, isConfirmStep, processing]);

  if (!open) return null;

  const toggleCategory = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  };

  const handleExecute = async () => {
    if (!canExecute) return;
    setProcessing(true);
    try {
      const call = actionType === 'DELETE_CATEGORIES'
        ? menuService.bulkDeleteCategories
        : actionType === 'DELETE_PRODUCTS'
          ? menuService.bulkDeleteProducts
          : menuService.bulkClearDescriptions;

      let message;
      if (allScope) {
        const result = await call({ all: true });
        message = result?.message;
      } else {
        for (const category of chosen) {
          // one request per category; stops at the first failure so nothing is half-reported
          // eslint-disable-next-line no-await-in-loop
          await call({ categoryId: category._id, all: false });
        }
        message = deletesCategories
          ? `${chosen.length} kategori ve ${productTotal} ürün silindi.`
          : actionType === 'DELETE_PRODUCTS'
            ? `${productTotal} ürün silindi.`
            : `${productTotal} ürünün açıklaması temizlendi.`;
      }
      handleClose(() => onSuccess?.(message || 'İşlem tamamlandı.'));
    } catch (err) {
      onError?.(err.response?.data?.error || 'İşlem gerçekleştirilemedi.');
    } finally {
      setProcessing(false);
    }
  };

  return createPortal(
    <div
      className={`bk-backdrop ${isClosing ? 'is-closing' : ''}`}
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && !processing && handleClose()}
    >
      <div className={`bk-card ${isClosing ? 'is-closing' : ''}`} role="dialog" aria-modal="true" aria-labelledby="bk-title">
        <header className="bk-head">
          <div>
            <h3 id="bk-title">{isConfirmStep ? 'Son bir kontrol' : 'Toplu işlemler'}</h3>
            <p>{isConfirmStep ? 'İşlemi uygulamadan önce özeti inceleyin.' : 'Menünüzdeki içeriği tek seferde düzenleyin.'}</p>
          </div>
          <button type="button" className="bk-x" onClick={() => handleClose()} disabled={processing} aria-label="Kapat">×</button>
        </header>

        {!isConfirmStep ? (
          <div className="bk-body">
            <section aria-labelledby="bk-s1">
              <h4 id="bk-s1" className="bk-step"><span>1</span> Ne yapmak istiyorsunuz?</h4>
              <div className="bk-actions" role="radiogroup" aria-label="İşlem türü">
                {ACTIONS.map(({ id, title, desc, tone, Icon }) => (
                  <button key={id} type="button" role="radio" aria-checked={actionType === id} className={`bk-action bk-action--${tone} ${actionType === id ? 'is-on' : ''}`} onClick={() => setActionType(id)}>
                    <span className="bk-action__icon"><Icon size={18} /></span>
                    <b>{title}</b>
                    <small>{desc}</small>
                  </button>
                ))}
              </div>
            </section>

            <section aria-labelledby="bk-s2">
              <h4 id="bk-s2" className="bk-step"><span>2</span> Nerede uygulansın?</h4>
              <div className="bk-seg" role="radiogroup" aria-label="Kapsam">
                <button type="button" role="radio" aria-checked={allScope} className={allScope ? 'is-on' : ''} onClick={() => setScope('ALL')}><GlobeIcon size={16} /> Tüm menü</button>
                <button type="button" role="radio" aria-checked={!allScope} className={!allScope ? 'is-on' : ''} onClick={() => setScope('SELECTED')}><FolderIcon size={16} /> Seçtiğim kategoriler</button>
              </div>

              {!allScope && (
                categories.length === 0 ? (
                  <p className="bk-empty">Menünüzde henüz kategori yok.</p>
                ) : (
                  <div className="bk-list">
                    <div className="bk-list__bar">
                      <span>{chosen.length} / {categories.length} seçili</span>
                      <button type="button" onClick={() => setSelectedIds(chosen.length === categories.length ? [] : categories.map((c) => String(c._id)))}>
                        {chosen.length === categories.length ? 'Seçimi temizle' : 'Hepsini seç'}
                      </button>
                    </div>
                    <ul>
                      {categories.map((cat) => {
                        const id = String(cat._id);
                        const on = selectedIds.includes(id);
                        return (
                          <li key={id}>
                            <label className={on ? 'is-on' : ''}>
                              <input type="checkbox" checked={on} onChange={() => toggleCategory(id)} />
                              <span className="bk-check" aria-hidden="true" />
                              <span className="bk-list__name">{cat.name}</span>
                              <span className="bk-list__count">{countFor(products, cat._id)} ürün</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )
              )}
            </section>

            <div className={`bk-impact ${isDelete ? 'is-danger' : 'is-warn'}`} aria-live="polite">
              <span>Etkilenecek</span>
              <b>{allScope ? (deletesCategories ? `${categories.length} kategori, ${products.length} ürün` : `${products.length} ürün`) : affectedLabel}</b>
            </div>
          </div>
        ) : (
          <div className="bk-body">
            <div className={`bk-confirm ${isDelete ? 'is-danger' : 'is-warn'}`}>
              <h4>{action.title}</h4>
              <p>
                {allScope ? 'Tüm menüde' : `${chosen.length} kategoride`}: <b>{allScope ? (deletesCategories ? `${categories.length} kategori, ${products.length} ürün` : `${products.length} ürün`) : affectedLabel}</b> etkilenecek.
                {isDelete ? ' Bu işlem geri alınamaz.' : ' Ürün adı ve fiyatlar korunur.'}
              </p>
            </div>
            {needsTyping && (
              <label className="bk-type">
                <span>Devam etmek için <b>SİL</b> yazın</span>
                <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus autoComplete="off" spellCheck={false} placeholder="SİL" />
              </label>
            )}
          </div>
        )}

        <footer className="bk-foot">
          {!isConfirmStep ? (
            <>
              <button type="button" className="bk-btn" onClick={() => handleClose()}>Vazgeç</button>
              <button type="button" className={`bk-btn bk-btn--primary ${isDelete ? 'is-danger' : ''}`} disabled={!canContinue} onClick={() => setIsConfirmStep(true)}>Devam et</button>
            </>
          ) : (
            <>
              <button type="button" className="bk-btn" onClick={() => { setIsConfirmStep(false); setTyped(''); }} disabled={processing}>Geri dön</button>
              <button type="button" className={`bk-btn bk-btn--primary ${isDelete ? 'is-danger' : ''}`} disabled={!canExecute} onClick={handleExecute}>
                {processing ? 'Uygulanıyor…' : isDelete ? 'Sil' : 'Temizle'}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default BulkMenuActionsModal;
