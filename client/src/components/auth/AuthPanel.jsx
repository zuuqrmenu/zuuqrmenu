const MENU = [
  ['Başlangıçlar', [['Humus', '180'], ['Paçanga Böreği', '240'], ['Patlıcan Söğürme', '190']]],
  ['Ana yemekler', [['Fırında Somon', '520'], ['Köfte Izgara', '360'], ['Dört Peynirli Pizza', '340']]],
  ['Tatlılar', [['San Sebastian', '230'], ['Tiramisu', '210'], ['Çikolatalı Sufle', '190']]],
  ['İçecekler', [['Türk Kahvesi', '90'], ['Çilekli Limonata', '110']]],
];

/** One printed-menu column. Rendered twice back to back so the loop is seamless. */
const MenuColumn = () => (
  <div className="reg-flow__col">
    {MENU.map(([title, rows]) => (
      <div key={title} className="reg-flow__group">
        <p className="reg-flow__title">{title}</p>
        {rows.map(([name, price]) => (
          <p key={name} className="reg-flow__row"><span>{name}</span><i /><b>{price}</b></p>
        ))}
      </div>
    ))}
  </div>
);

/** Quiet backdrop: a soft light drifting behind a menu that slowly scrolls up. Decorative only. */
const MenuFlow = () => (
  <div className="reg-art" aria-hidden="true">
    <div className="reg-art__glow" />
    <div className="reg-flow">
      <div className="reg-flow__track">
        <MenuColumn />
        <MenuColumn />
      </div>
    </div>
  </div>
);

/** Shared left side of the login / register screens. Purely presentational. */
export const AuthPanel = ({ href, headline, sub, points, note }) => (
  <aside className="reg-panel" aria-label="zuuqrmenu">
    <a href={href} className="reg-panel__logo-link">
      <img src="/logo_darkmode.svg" alt="zuuqrmenu ana sayfa" className="reg-panel__logo" />
    </a>

    <div className="reg-panel__body">
      <h2 className="reg-panel__headline">{headline}</h2>
      <p className="reg-panel__sub">{sub}</p>
      <ul className="reg-panel__features">
        {points.map(([title, text]) => (
          <li className="reg-panel__feature" key={title}>
            <span><b>{title}</b><small>{text}</small></span>
          </li>
        ))}
      </ul>
    </div>

    <MenuFlow />

    <p className="reg-panel__note">{note}</p>
  </aside>
);

/** Official four-colour Google "G". */
export const GoogleMark = () => (
  <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.8 6.7-17.4z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

/** Password input with a show/hide toggle. */
export const PasswordInput = ({ show, onToggle, ...inputProps }) => (
  <div className="reg-input-wrap">
    <input {...inputProps} type={show ? 'text' : 'password'} className="reg-input" />
    <button type="button" className="reg-input-wrap__toggle" onClick={onToggle} aria-pressed={show}>
      {show ? 'Gizle' : 'Göster'}
    </button>
  </div>
);
