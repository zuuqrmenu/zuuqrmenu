import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from './SeoHead';

const RestaurantLayout = ({ children }) => {
  const { user, restaurant, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Genel Bakış', to: '/dashboard', end: true },
    { label: 'Menü', to: '/dashboard/menu', end: false },
    { label: 'QR Kod', to: '/dashboard/qr', end: false },
  ];

  const settingsItem = { label: 'Ayarlar', to: '/dashboard/settings', end: false };

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
      <SeoHead title="Restoran Paneli | zuuqrmenu" description="zuuqrmenu restoran yönetim paneli." canonical="https://zuuqrmenu.com/dashboard" robots="noindex,nofollow,noarchive" />

      {/* Desktop Sidebar (Only visible on lg and above) */}
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 hidden w-64 lg:flex lg:flex-col">
        <div className="dashboard-brand">
          <span className="dashboard-brand__logo-wrap">
            <img src="/logo.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--light" />
            <img src="/logo_darkmode.svg" alt="" className="dashboard-brand__logo dashboard-brand__logo--dark" />
          </span>
          <div><h1>Restoran Paneli</h1></div>
        </div>
        <div className="dashboard-restaurant">
          <p className="truncate">{restaurant?.name}</p>
          <span className="truncate">{user?.email}</span>
        </div>
        <nav className="dashboard-sidebar__nav">
          <div className="dashboard-sidebar__primary">
            {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>{item.label}</NavLink>)}
            <NavLink to="/dashboard/analytics" className={desktopLinkClass}>İstatistikler</NavLink>
          </div>
          <div className="dashboard-sidebar__bottom">
            <NavLink to={settingsItem.to} end={settingsItem.end} className={desktopLinkClass}>{settingsItem.label}</NavLink>
            <button onClick={logout} className="dashboard-logout">Çıkış Yap</button>
          </div>
        </nav>
      </aside>

      {/* Mobile Drawer Overlay & Sheet (Only on mobile / tablet < 1024px) */}
      <div
        className={`dashboard-mobile-drawer-overlay lg:hidden ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div
          className="dashboard-mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
        <aside className="dashboard-mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobil Menü">
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
              {(restaurant?.name || 'R').charAt(0).toUpperCase()}
            </div>
            <div className="dashboard-mobile-drawer__restaurant-info">
              <p className="truncate">{restaurant?.name || 'Restoranınız'}</p>
              <span className="truncate">{user?.email}</span>
            </div>
          </div>

          <nav className="dashboard-mobile-drawer__nav">
            <div className="dashboard-mobile-drawer__nav-group">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                </span>
                <span>Genel Bakış</span>
              </NavLink>

              <NavLink
                to="/dashboard/menu"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" /></svg>
                </span>
                <span>Menü Yönetimi</span>
              </NavLink>

              <NavLink
                to="/dashboard/qr"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                </span>
                <span>QR Kod Yönetimi</span>
              </NavLink>

              <NavLink
                to="/dashboard/analytics"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                </span>
                <span>İstatistikler</span>
              </NavLink>

              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
                </span>
                <span>Ayarlar</span>
              </NavLink>
            </div>

            <div className="dashboard-mobile-drawer__footer">
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); logout(); }}
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

      {/* Main Content Area */}
      <main className="lg:pl-64">
        <header className="dashboard-header lg:hidden">
          {/* Mobile Header: Hamburger on Left, Logo in Center, Balanced Spacer on Right */}
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

            <NavLink to="/dashboard" className="dashboard-mobile-center-logo" aria-label="Ana Sayfa">
              <span className="dashboard-brand__logo-wrap">
                <img src="/logo.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--light" />
                <img src="/logo_darkmode.svg" alt="" className="dashboard-brand__logo dashboard-brand__logo--dark" />
              </span>
            </NavLink>

            <div className="dashboard-mobile-header-spacer" aria-hidden="true" />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default RestaurantLayout;