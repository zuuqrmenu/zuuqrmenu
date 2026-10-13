import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const STORAGE_KEY = 'zuulab.dashboard.sidebar';

const ICON_PROPS = { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const NAV_ICONS = {
  overview: <svg {...ICON_PROPS}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>,
  menu: <svg {...ICON_PROPS}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5Z" /><path d="M8 7h8M8 11h8" /></svg>,
  qr: <svg {...ICON_PROPS}><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><path d="M15 15h2v2h-2zM19 19h2M19 15h2M15 19h.01" /></svg>,
  billing: <svg {...ICON_PROPS}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" /></svg>,
  stats: <svg {...ICON_PROPS}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>,
  restaurants: <svg {...ICON_PROPS}><path d="M4 21V9l8-6 8 6v12" /><path d="M9 21v-6h6v6" /></svg>,
  resources: <svg {...ICON_PROPS}><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" /><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></svg>,
  settings: <svg {...ICON_PROPS}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>,
  logout: <svg {...ICON_PROPS}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>,
};

/** Remembers the collapsed state per browser; applies it to the shell through the returned class name. */
export const useSidebarCollapsed = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'collapsed'; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? 'collapsed' : 'expanded'); } catch { /* storage unavailable */ }
  }, [collapsed]);
  return [collapsed, setCollapsed];
};

/**
 * Desktop sidebar shared by the restaurant and admin panels.
 * Collapsed = 76px icon rail; every item keeps its label in the DOM (visually hidden) and shows a tooltip on hover/focus.
 */
const DashboardSidebar = ({ title, identity, subline, items, footerItems, onLogout, collapsed, onToggle }) => {
  const link = ({ isActive }) => `dashboard-nav-link ${isActive ? 'is-active' : ''}`;
  const renderItem = (item) => (
    <NavLink key={item.to} to={item.to} end={item.end} className={link} data-tip={item.label}>
      <span className="dashboard-nav-link__icon">{NAV_ICONS[item.icon]}</span>
      <span className="dashboard-nav-link__label">{item.label}</span>
    </NavLink>
  );

  return (
    <aside className={`dashboard-sidebar fixed inset-y-0 left-0 hidden lg:flex lg:flex-col ${collapsed ? 'is-collapsed' : ''}`} aria-label="Panel gezinmesi">
      <div className="dashboard-brand">
        <span className="dashboard-brand__logo-wrap">
          <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--dark" />
          <img src="/KSLT_FAVICON.png" alt="" className="dashboard-brand__mini" />
        </span>
        <h1>{title}</h1>
      </div>

      <button
        type="button"
        className="dashboard-sidebar__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        data-tip={collapsed ? 'Genişlet' : 'Daralt'}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>

      <div className="dashboard-restaurant" title={`${identity} ${subline || ''}`}>
        <span className="dashboard-restaurant__avatar" aria-hidden="true">{(identity || 'R').charAt(0).toUpperCase()}</span>
        <div className="dashboard-restaurant__text">
          <p className="truncate">{identity}</p>
          {subline && <span className="truncate">{subline}</span>}
        </div>
      </div>

      <nav className="dashboard-sidebar__nav">
        <div className="dashboard-sidebar__primary">{items.map(renderItem)}</div>
        <div className="dashboard-sidebar__bottom">
          {footerItems.map(renderItem)}
          <button type="button" onClick={onLogout} className="dashboard-logout dashboard-nav-link" data-tip="Çıkış yap">
            <span className="dashboard-nav-link__icon">{NAV_ICONS.logout}</span>
            <span className="dashboard-nav-link__label">Çıkış yap</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
