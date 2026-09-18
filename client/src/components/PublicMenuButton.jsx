import { useState } from 'react';
import { getPublicMenuUrl } from '../utils/publicMenuUrl';

const PublicMenuButton = ({ username, label = 'Menüyü Görüntüle', compact = false, brand = false, highlighted = false, onHighlightDismiss = null }) => {
  const [error, setError] = useState('');
  const url = getPublicMenuUrl(username);

  const handleClick = (event) => {
    setError('');
    if (onHighlightDismiss) onHighlightDismiss();
    if (!url) {
      event.preventDefault();
      setError('Public menü bağlantısı şu anda kullanılamıyor.');
    }
  };

  return (
    <div className={compact ? 'text-right' : ''}>
      <a
        href={url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-xl font-semibold transition hover:-translate-y-0.5 hover:shadow-sm ${highlighted ? 'public-menu-button--highlighted' : ''} ${compact ? `border px-3 py-2 text-sm ${brand ? 'public-menu-button--brand' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}` : 'bg-slate-900 px-4 py-2.5 text-sm text-white hover:bg-slate-700'}`}
      >
        <span aria-hidden="true">↗</span>
        {label}
      </a>
      {error && <p className="mt-2 max-w-xs text-xs text-rose-600">{error}</p>}
    </div>
  );
};

export default PublicMenuButton;