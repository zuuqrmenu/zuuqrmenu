import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from './SeoHead';
import ZuuAIAssistant from './ZuuAIAssistant';
import DashboardSidebar, { useSidebarCollapsed } from './DashboardSidebar';
import AccountMenu from './account/AccountMenu';
import SubscriptionModal from './account/SubscriptionModal';
import AccountSettingsModal from './account/AccountSettingsModal';
import useSubscriptionSummary from '../hooks/useSubscriptionSummary';
import '../styles/dashboard-theme.css';

const RestaurantLayout = ({ children }) => {
  const { user, restaurant, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useSidebarCollapsed();
  const [accountDialog, setAccountDialog] = useState(null); // 'subscription' | 'settings' | null
  const [subscription, refreshSubscription] = useSubscriptionSummary();
  const planLabel = subscription.loaded ? (subscription.planName || 'Paket yok') : null;

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
    <div className={`dashboard-shell min-h-screen bg-slate-50 text-slate-900 ${collapsed ? 'is-sidebar-collapsed' : ''}`}>
      <SeoHead title="Restoran Paneli | zuuqrmenu" description="zuuqrmenu restoran yönetim paneli." canonical="https://panel.zuuqrmenu.com/dashboard" robots="noindex,nofollow,noarchive" />

      {/* Desktop Sidebar (Only visible on lg and above) */}
      <DashboardSidebar
        title="Restoran Paneli"
        identity={restaurant?.name || 'Restoranınız'}
        subline={user?.email}
        items={[
          { label: 'Genel bakış', to: '/dashboard', end: true, icon: 'overview' },
          { label: 'Menü yönetimi', to: '/dashboard/menu', icon: 'menu' },
          { label: 'Firma ayarları', to: '/dashboard/settings', icon: 'settings' },
          { label: 'QR kod', to: '/dashboard/qr', icon: 'qr' },
          { label: 'İstatistikler', to: '/dashboard/analytics', icon: 'stats' },
        ]}
        footerItems={[]}
        onLogout={logout}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        accountSlot={(
          <AccountMenu
            name={restaurant?.name || 'Restoranınız'}
            subline={user?.email}
            badge={planLabel}
            collapsed={collapsed}
            onSubscription={() => setAccountDialog('subscription')}
            onSettings={() => setAccountDialog('settings')}
            onLogout={logout}
          />
        )}
      />
      {accountDialog === 'subscription' && <SubscriptionModal onClose={() => { setAccountDialog(null); refreshSubscription(); }} />}
      {accountDialog === 'settings' && <AccountSettingsModal onClose={() => setAccountDialog(null)} />}

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
                to="/dashboard/settings"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
                </span>
                <span>Firma ayarları</span>
              </NavLink>

              <NavLink
                to="/dashboard/qr"
                className={({ isActive }) => `dashboard-mobile-drawer-link ${isActive ? 'is-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                </span>
                <span>QR Kod</span>
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
            </div>

            <div className="dashboard-mobile-drawer__footer">
              <button
                type="button"
                className="dashboard-mobile-drawer-link"
                onClick={() => { setMobileMenuOpen(false); setAccountDialog('subscription'); }}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6.5 15h4" /></svg>
                </span>
                <span>{planLabel ? `Abonelik · ${planLabel}` : 'Abonelik'}</span>
              </button>
              <button
                type="button"
                className="dashboard-mobile-drawer-link"
                onClick={() => { setMobileMenuOpen(false); setAccountDialog('settings'); }}
              >
                <span className="dashboard-mobile-drawer-link__icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>
                </span>
                <span>Hesap ayarları</span>
              </button>

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
      <main className="dashboard-main">
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

      {/* Persistent Floating ZuuAI Assistant */}
      <ZuuAIAssistant />
    </div>
  );
};

export default RestaurantLayout;