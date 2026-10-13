import { Link } from 'react-router-dom';
import '../../styles/dashboard-pages.css';

/**
 * Shared page vocabulary for the restaurant and admin panels.
 * Every redesigned page is built from these so spacing, type and motion stay identical.
 */

export const Icon = ({ name, size = 20 }) => {
  const p = { viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (name) {
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'layers': return <svg {...p}><path d="m12 2 10 5-10 5L2 7l10-5Z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></svg>;
    case 'qr': return <svg {...p}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><path d="M15 15h2v2h-2zM19 19h2M19 15h2M15 19h.01" /></svg>;
    case 'palette': return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="8.5" cy="10" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="15.5" cy="10" r="1" /><path d="M12 21a2.5 2.5 0 0 1 0-5h1.5a2 2 0 0 0 2-2" /></svg>;
    case 'copy': return <svg {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>;
    case 'check': return <svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
    case 'external': return <svg {...p}><path d="M7 17 17 7M8 7h9v9" /></svg>;
    case 'chevron': return <svg {...p}><path d="m9 6 6 6-6 6" /></svg>;
    case 'download': return <svg {...p}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>;
    case 'print': return <svg {...p}><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" /><path d="M6 14h12v7H6z" /></svg>;
    case 'eye': return <svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'tag': return <svg {...p}><path d="M12 2H3v9l9.3 9.3a2 2 0 0 0 2.8 0l6.2-6.2a2 2 0 0 0 0-2.8L12 2Z" /><path d="M7.5 7.5h.01" /></svg>;
    case 'users': return <svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" /></svg>;
    case 'clock': return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'spark': return <svg {...p}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>;
    case 'home': return <svg {...p}><path d="M4 21V9l8-6 8 6v12" /><path d="M9 21v-6h6v6" /></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    case 'refresh': return <svg {...p}><path d="M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.5L20 15M20 20v-5h-5" /></svg>;
    case 'shield': return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
    case 'bolt': return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
    default: return null;
  }
};

export const PageHeader = ({ kicker, title, lede, actions, status }) => (
  <header className="dp-header">
    <div className="dp-header__text">
      <p className="dp-kicker">{kicker}{status}</p>
      <h1 className="dp-title">{title}</h1>
      {lede && <p className="dp-lede">{lede}</p>}
    </div>
    {actions && <div className="dp-actions">{actions}</div>}
  </header>
);

export const Card = ({ title, sub, actions, children, className = '', as: Tag = 'section', ...rest }) => (
  <Tag className={`dp-card ${className}`} {...rest}>
    {(title || actions) && (
      <div className="dp-card__head">
        <div>
          {title && <h2 className="dp-card__title">{title}</h2>}
          {sub && <p className="dp-card__sub">{sub}</p>}
        </div>
        {actions && <div className="dp-card__actions">{actions}</div>}
      </div>
    )}
    {children}
  </Tag>
);

export const Stat = ({ icon, label, value, hint, delta, progress }) => (
  <article className="dp-stat">
    <div className="dp-stat__top">
      <span className="dp-stat__icon"><Icon name={icon} size={18} /></span>
      {delta !== undefined && delta !== null && (
        <span className={`dp-chip ${delta >= 0 ? 'dp-chip--up' : 'dp-chip--down'}`}>{delta >= 0 ? '+' : ''}{delta}%</span>
      )}
    </div>
    <p className="dp-stat__label">{label}</p>
    <p className="dp-stat__value">{value}</p>
    {progress !== undefined && <div className="dp-bar" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} /></div>}
    {hint && <p className="dp-stat__hint">{hint}</p>}
  </article>
);

export const Button = ({ to, href, variant = 'ghost', icon, className = '', children, ...rest }) => {
  const cls = `dp-btn dp-btn--${variant} ${className}`.trim();
  const content = <>{icon && <Icon name={icon} size={16} />}<span>{children}</span></>;
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>{content}</a>;
  return <button type="button" className={cls} {...rest}>{content}</button>;
};

export const Chip = ({ tone = 'neutral', children }) => <span className={`dp-chip dp-chip--${tone}`}>{children}</span>;

export const Segmented = ({ options, value, onChange, label }) => (
  <div className="dp-seg" role="group" aria-label={label}>
    {options.map(([id, text]) => (
      <button key={id} type="button" className={value === id ? 'is-active' : ''} aria-pressed={value === id} onClick={() => onChange(id)}>{text}</button>
    ))}
  </div>
);

export const ActionRow = ({ to, icon, title, desc }) => (
  <Link to={to} className="dp-action">
    <span className="dp-action__icon"><Icon name={icon} size={18} /></span>
    <span className="dp-action__text"><b>{title}</b><small>{desc}</small></span>
    <span className="dp-action__go"><Icon name="chevron" size={16} /></span>
  </Link>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="dp-empty">
    <p className="dp-empty__title">{title}</p>
    {text && <p className="dp-empty__text">{text}</p>}
    {action}
  </div>
);

export const Notice = ({ tone = 'ok', children }) => <p className={`dp-notice dp-notice--${tone}`} role={tone === 'bad' ? 'alert' : 'status'}>{children}</p>;
