import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ModalPortal from '../common/ModalPortal';
import { NAV_ICONS } from '../DashboardSidebar';
import { THEME_KEY } from '../settings/SettingsGeneralTab';
import '../../styles/account.css';

const stroke = { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const MOON = <svg {...stroke}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>;
const SUN = <svg {...stroke}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;

const readDark = () => document.body.getAttribute('data-dashboard-theme') === 'dark';

/**
 * Profile card pinned to the bottom of the sidebar. Click opens a small panel with the account actions:
 * subscription, account settings, light/dark switch and sign out. Works in the collapsed icon rail too.
 */
const AccountMenu = ({ name, subline, badge, collapsed, onSubscription, onSettings, onLogout }) => {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(readDark);
  const [pos, setPos] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const width = 280;
    const left = collapsed ? rect.right + 10 : Math.min(rect.left, window.innerWidth - width - 12);
    setPos({ left: Math.max(12, left), bottom: Math.max(12, window.innerHeight - rect.bottom) });
  }, [open, collapsed]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (panelRef.current?.contains(event.target) || buttonRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', () => setOpen(false), { once: true });
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark';
    try { localStorage.setItem(THEME_KEY, next); } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent('zuulab-dashboard-theme-change', { detail: next }));
    setDark(!dark);
  };

  const run = (action) => () => { setOpen(false); action?.(); };

  return (
    <div className="acc-menu">
      <button
        ref={buttonRef}
        type="button"
        className={`acc-card ${open ? 'is-open' : ''}`}
        onClick={() => { setDark(readDark()); setOpen((value) => !value); }}
        aria-haspopup="menu"
        aria-expanded={open}
        data-tip={name}
      >
        <span className="acc-card__avatar" aria-hidden="true">{(name || 'R').charAt(0).toUpperCase()}</span>
        <span className="acc-card__text">
          <b className="truncate">{name}</b>
          {badge ? <span className="acc-card__plan"><i aria-hidden="true" />{badge}</span> : subline && <span className="truncate">{subline}</span>}
        </span>
        <svg className="acc-card__chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 15 5-5 5 5" /></svg>
      </button>

      {open && (
        <ModalPortal>
          <div ref={panelRef} className="acc-pop" role="menu" style={{ left: pos?.left ?? -9999, bottom: pos?.bottom ?? 0, visibility: pos ? 'visible' : 'hidden' }}>
            <div className="acc-pop__who">
              <span className="acc-card__avatar" aria-hidden="true">{(name || 'R').charAt(0).toUpperCase()}</span>
              <div>
                <b className="truncate">{name}</b>
                {subline && <span className="truncate">{subline}</span>}
              </div>
            </div>
            {onSubscription && (
              <button type="button" role="menuitem" className="acc-pop__item" onClick={run(onSubscription)}>
                <span>{NAV_ICONS.billing}</span>Abonelik{badge && <em>{badge}</em>}
              </button>
            )}
            {onSettings && (
              <button type="button" role="menuitem" className="acc-pop__item" onClick={run(onSettings)}>
                <span>{NAV_ICONS.settings}</span>Hesap ayarları
              </button>
            )}
            <button type="button" role="menuitemcheckbox" aria-checked={dark} className="acc-pop__item acc-pop__item--switch" onClick={toggleTheme}>
              <span>{dark ? MOON : SUN}</span>{dark ? 'Koyu mod' : 'Açık mod'}
              <i className={`acc-switch ${dark ? 'is-on' : ''}`} aria-hidden="true" />
            </button>
            <div className="acc-pop__sep" />
            <button type="button" role="menuitem" className="acc-pop__item acc-pop__item--danger" onClick={run(onLogout)}>
              <span>{NAV_ICONS.logout}</span>Çıkış yap
            </button>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default AccountMenu;
