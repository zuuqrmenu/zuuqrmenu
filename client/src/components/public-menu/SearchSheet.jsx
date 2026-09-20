import { useEffect, useState } from 'react';

const SearchSheet = ({ value, onChange, results, onSelect, onClose, themeKey, mode }) => {
  const [closing, setClosing] = useState(false);
  const activeMode = mode || (themeKey === 'GRID' ? 'DARK' : 'LIGHT');

  const handleClose = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 190);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`public-search-backdrop ${closing ? 'is-closing' : ''}`}
      data-theme={themeKey}
      data-mode={activeMode}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && handleClose()}
    >
      <div
        className={`public-search-panel ${value ? 'has-results' : ''} ${closing ? 'is-closing' : ''}`}
        data-theme={themeKey}
        data-mode={activeMode}
        role="dialog"
        aria-modal="true"
        aria-label="Ürün arama"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="search-row">
          <div className="search-input-wrap">
            <span className="search-input-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              autoFocus
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Ürün ara..."
              aria-label="Ürün ara"
            />
            {value && (
              <button
                type="button"
                className="search-clear"
                onClick={() => onChange('')}
                aria-label="Aramayı temizle"
              >
                Sil
              </button>
            )}
          </div>
          <button
            type="button"
            className="search-close"
            onClick={handleClose}
            aria-label="Aramayı kapat"
          >
            ✕
          </button>
        </div>

        {value && (
          <div className="search-results">
            {results.length ? (
              results.map((product) => (
                <button
                  type="button"
                  key={product.id}
                  className="search-result-item"
                  onClick={() => onSelect(product)}
                >
                  <span className="search-result-name">{product.name}</span>
                  <strong className="search-result-price">₺{Number(product.price).toFixed(2)}</strong>
                </button>
              ))
            ) : (
              <p className="search-no-results">Aramanızla eşleşen ürün bulunamadı.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSheet;