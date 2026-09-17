import { useState } from 'react';

const SearchSheet = ({ value, onChange, results, onSelect, onClose }) => {
	const [closing, setClosing] = useState(false);

	const handleClose = () => {
		if (closing) return;
		setClosing(true);
		window.setTimeout(onClose, 180);
	};

	return <div className={`public-search-panel ${closing ? 'is-closing' : ''}`}><div className="search-row"><div className="search-input-wrap"><input autoFocus value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ürün ara..." aria-label="Ürün ara" />{value && <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Aramayı temizle">Sil</button>}</div><button type="button" className="search-close" onClick={handleClose} aria-label="Aramayı kapat">×</button></div>{value && <div className="search-results">{results.length ? results.map((product) => <button type="button" key={product.id} onClick={() => onSelect(product)}><span>{product.name}</span><strong>₺{Number(product.price).toFixed(2)}</strong></button>) : <p>Aramanızla eşleşen ürün bulunamadı.</p>}</div>}</div>;
};

export default SearchSheet;