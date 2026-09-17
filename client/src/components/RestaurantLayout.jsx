import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeoHead from './SeoHead';

const RestaurantLayout = ({ children }) => {
  const { user, restaurant, logout } = useAuth();
  const location = useLocation();
  const mobileNavRef = useRef(null);
  const navItems = [
    { label: 'Genel Bakış', to: '/dashboard', end: true },
    { label: 'Menü', to: '/dashboard/menu', end: false },
    { label: 'QR Kod', to: '/dashboard/qr', end: false },
  ];

  const settingsItem = { label: 'Ayarlar', to: '/dashboard/settings', end: false };

  const desktopLinkClass = ({ isActive }) => `dashboard-nav-link ${isActive ? 'is-active' : ''}`;

  useEffect(() => {
    if (!mobileNavRef.current) return undefined;
    const activeLink = mobileNavRef.current.querySelector('.mobile-nav-item.is-active');
    if (!activeLink) return undefined;
    const navRect = mobileNavRef.current.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();
    const offset = activeRect.left - navRect.left + activeRect.width / 2 - navRect.width / 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mobileNavRef.current.scrollTo({
      left: mobileNavRef.current.scrollLeft + offset,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    return undefined;
  }, [location.pathname]);

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50 text-slate-900">
      <SeoHead title="Restoran Paneli | zuuqrmenu" description="zuuqrmenu restoran yönetim paneli." canonical="https://zuuqrmenu.com/dashboard" robots="noindex,nofollow,noarchive" />
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 hidden w-64 lg:flex lg:flex-col">
        <div className="dashboard-brand"><span className="dashboard-brand__logo-wrap"><img src="/logo.svg" alt="zuuqrmenu" className="dashboard-brand__logo dashboard-brand__logo--light" /><img src="/logo_darkmode.svg" alt="" className="dashboard-brand__logo dashboard-brand__logo--dark" /></span><div><h1>Restoran Paneli</h1></div></div>
        <div className="dashboard-restaurant"><p className="truncate">{restaurant?.name}</p><span className="truncate">{user?.email}</span></div>
        <nav className="dashboard-sidebar__nav">
          <div className="dashboard-sidebar__primary">
            {navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>{item.label}</NavLink>)}
            <NavLink to="/dashboard/analytics" className={desktopLinkClass}>İstatistikler</NavLink>
          </div>
          <div className="dashboard-sidebar__bottom"><NavLink to={settingsItem.to} end={settingsItem.end} className={desktopLinkClass}>{settingsItem.label}</NavLink><button onClick={logout} className="dashboard-logout">Çıkış Yap</button></div>
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="dashboard-header"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="lg:hidden"><div className="dashboard-mobile-brand"><span className="dashboard-mobile-brand__logo-wrap"><img src="/logo.svg" alt="zuuqrmenu" className="dashboard-mobile-brand__logo dashboard-mobile-brand__logo--light" /><img src="/logo_darkmode.svg" alt="" className="dashboard-mobile-brand__logo dashboard-mobile-brand__logo--dark" /></span><div><span>{restaurant?.name}</span></div></div></div><div className="hidden lg:block" /><button onClick={logout} className="dashboard-mobile-logout lg:hidden">Çıkış</button></div><nav ref={mobileNavRef} className="mobile-dashboard-nav mt-4 lg:hidden" aria-label="Ana menü"> <div className="mobile-dashboard-nav__inner">{navItems.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}>{item.label}</NavLink>)}<NavLink to="/dashboard/analytics" className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}>İstatistikler</NavLink><NavLink to={settingsItem.to} className={({ isActive }) => `mobile-nav-item ${isActive ? 'is-active' : ''}`}>{settingsItem.label}</NavLink></div></nav></header>
        {children}
      </main>
    </div>
  );
};

export default RestaurantLayout;