import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from './SeoHead';
import ZuuAIAssistant from './ZuuAIAssistant';

const AdminLayout = ({ children, title = 'Yönetim Paneli | zuuqrmenu' }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const desktopLinkClass = ({ isActive }) => `dashboard-nav-link ${isActive ? 'is-active' : ''}`;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50 text-slate-900">
      <SeoHead
        title={title}
        description="zuuqrmenu sistem yönetim paneli."
        canonical="https://zuuqrmenu.com/admin"
        robots="noindex,nofollow,noarchive"
      />

      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 hidden w-64 lg:flex lg:flex-col">
        <div className="dashboard-brand">
          <span className="dashboard-brand__logo-wrap">
            <img src="/logo.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--light" />
            <img src="/logo_darkmode.svg" alt="" className="dashboard-brand__logo dashboard-brand__logo--dark" />
          </span>
          <div>
            <h1>Yönetim Paneli</h1>
          </div>
        </div>

        <div className="dashboard-restaurant">
          <p className="truncate">{user?.name || 'Sistem Yöneticisi'}</p>
          <span className="truncate">{user?.email || 'admin@zuuqrmenu.com'} · Yönetici</span>
        </div>

        <nav className="dashboard-sidebar__nav">
          <div className="dashboard-sidebar__primary">
            <NavLink to="/admin" end className={desktopLinkClass}>
              Genel Bakış
            </NavLink>
            <NavLink to="/admin/restaurants" className={desktopLinkClass}>
              Restoranlar
            </NavLink>
            <NavLink to="/admin/resources" className={desktopLinkClass}>
              Kaynak Kontrol
            </NavLink>
          </div>

          <div className="dashboard-sidebar__bottom">
            <NavLink to="/admin/settings" className={desktopLinkClass}>
              Ayarlar
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="dashboard-logout"
            >
              Çıkış Yap
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Drawer Overlay & Sheet */}
      <div
        className={`dashboard-mobile-drawer-overlay lg:hidden ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className="dashboard-mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
        <aside className="dashboard-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobil Yönetim Menüsü">
          <div className="dashboard-mobile-drawer__header">
            <div className="dashboard-mobile-drawer__brand">
              <span className="dashboard-brand__logo-wrap">
                <img src="/logo.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--light" />
                <img src="/logo_darkmode.svg" alt="" className="dashboard-brand__logo dashboard-brand__logo--dark" />
              </span>
            </div>
            <button
              type="button"
              className="dashboard-mobile-drawer__close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Menüyü kapat"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="dashboard-mobile-drawer__restaurant">
            <div className="dashboard-mobile-drawer__restaurant-avatar">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="dashboard-mobile-drawer__restaurant-info">
              <p className="truncate">{user?.name || 'Sistem Yöneticisi'}</p>
              <span className="truncate">{user?.email || 'admin@zuuqrmenu.com'}</span>
            </div>
          </div>

          <nav className="dashboard-mobile-drawer__nav">
            <div className="dashboard-mobile-drawer__nav-group">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                </span>
                <span>Genel Bakış</span>
              </NavLink>

              <NavLink
                to="/admin/restaurants"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <span>Restoranlar</span>
              </NavLink>

              <NavLink
                to="/admin/resources"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                  </svg>
                </span>
                <span>Kaynak Kontrol</span>
              </NavLink>
            </div>

            <div className="dashboard-mobile-drawer__footer">
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span>Ayarlar</span>
              </NavLink>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="dashboard-mobile-drawer-logout"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Çıkış Yap</span>
              </button>
            </div>
          </nav>
        </aside>
      </div>

      {/* Main Content Shell */}
      <main className="lg:pl-64">
        {/* Mobile Header Topbar */}
        <header className="dashboard-header lg:hidden">
          <div className="dashboard-mobile-header">
            <button
              type="button"
              className="dashboard-hamburger-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü aç"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
            <div className="dashboard-mobile-center-logo">
              <span className="dashboard-brand__logo-wrap">
                <img src="/logo.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--light" />
                <img src="/logo_darkmode.svg" alt="" className="dashboard-brand__logo dashboard-brand__logo--dark" />
              </span>
            </div>
            <div className="dashboard-mobile-header-spacer" aria-hidden="true" />
          </div>
        </header>

        {children}
      </main>
      <ZuuAIAssistant adminMode />
    </div>
  );
};

export default AdminLayout;
