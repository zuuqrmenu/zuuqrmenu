import { useEffect, useRef, lazy, Suspense } from 'react';
import { initGA, trackPageView } from './utils/analytics';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isPanelSubdomain, isMainDomain, isLocalhost, redirectToPanelIfNeeded, getPanelUrl, isPanelPath, isPublicMenuPath } from './utils/domainHelpers';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const PublicMenu = lazy(() => import('./pages/PublicMenu'));
const RestaurantSettings = lazy(() => import('./pages/RestaurantSettings'));
const QrManagement = lazy(() => import('./pages/QrManagement'));
const Analytics = lazy(() => import('./pages/Analytics'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MenuShowcase = lazy(() => import('./pages/MenuShowcase'));

// Initialise GA4 once when the module is first loaded
initGA();

const RouteLoading = () => (
  <div className="route-loading">
    <div className="route-loading__content">
      <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="route-loading__logo" />
      <span className="route-loading__spinner" aria-label="Yükleniyor" />
      <p>Menünüz hazırlanıyor...</p>
    </div>
  </div>
);

const HostRouterGuard = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. If on main domain in production, redirect dashboard, admin, and auth requests to panel.zuuqrmenu.com
    if (isMainDomain() && !isLocalhost()) {
      if (isPanelPath(location.pathname)) {
        window.location.replace(`https://panel.zuuqrmenu.com${location.pathname}${location.search}`);
        return;
      }
    }

    // 2. If on panel.zuuqrmenu.com in production, redirect public showcase & public menus to main site
    if (isPanelSubdomain() && !isLocalhost()) {
      if (isPublicMenuPath(location.pathname)) {
        window.location.replace(`https://www.zuuqrmenu.com${location.pathname}${location.search}`);
        return;
      }
    }
  }, [location.pathname, location.search]);

  return null;
};

const LoginRoute = () => {
  const { loading, isAuthenticated, isRestaurantUser, isAdmin, isRestaurantAccessible } = useAuth();
  if (isMainDomain() && !isLocalhost()) {
    return <RouteLoading />;
  }
  if (loading) return <RouteLoading />;
  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isRestaurantUser) return isRestaurantAccessible ? <Navigate to="/dashboard" replace /> : <Navigate to="/pending-approval" replace />;
  }
  return <Login />;
};

const RegisterRoute = () => {
  const { loading, isAuthenticated, isRestaurantUser, isAdmin, isRestaurantAccessible } = useAuth();
  if (isMainDomain() && !isLocalhost()) {
    return <RouteLoading />;
  }
  if (loading) return <RouteLoading />;
  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isRestaurantUser) return isRestaurantAccessible ? <Navigate to="/dashboard" replace /> : <Navigate to="/pending-approval" replace />;
  }
  return <Register />;
};

const DashboardThemeController = () => {
  const location = useLocation();

  useEffect(() => {
    const storedTheme = localStorage.getItem('zuulab.dashboard.theme') || 'system';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (preference) => {
      const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
      if (!isDashboard) {
        document.body.removeAttribute('data-dashboard-theme');
        return;
      }
      const systemDark = mediaQuery.matches;
      const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
      document.body.setAttribute('data-dashboard-theme', resolved);
    };
    applyTheme(storedTheme);
    const onThemeChange = (event) => applyTheme(event.detail || 'system');
    const onSystemThemeChange = () => {
      if ((localStorage.getItem('zuulab.dashboard.theme') || 'system') === 'system') applyTheme('system');
    };
    window.addEventListener('zuulab-dashboard-theme-change', onThemeChange);
    mediaQuery.addEventListener?.('change', onSystemThemeChange);
    return () => {
      window.removeEventListener('zuulab-dashboard-theme-change', onThemeChange);
      mediaQuery.removeEventListener?.('change', onSystemThemeChange);
    };
  }, [location.pathname]);

  return null;
};

// Tracks SPA route changes as GA4 page_view events
const GAPageTracker = () => {
  const location = useLocation();
  const prevPath = useRef(null);

  useEffect(() => {
    // Skip if path hasn't changed (e.g. only hash/query changed)
    if (prevPath.current === location.pathname) return;
    prevPath.current = location.pathname;
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
};

const AdminRoute = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (isMainDomain() && !isLocalhost()) {
    return <RouteLoading />;
  }
  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" replace />;
};

const RestaurantRoute = ({ menu = false, settings = false, analytics = false, qr = false }) => {
  const location = useLocation();
  const { loading, isAuthenticated, isRestaurantUser, isRestaurantAccessible } = useAuth();

  useEffect(() => {
    redirectToPanelIfNeeded(location.pathname + location.search);
  }, [location.pathname, location.search]);

  if (isMainDomain() && !isLocalhost()) {
    return <RouteLoading />;
  }

  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isRestaurantUser) return <Navigate to="/admin" replace />;
  return isRestaurantAccessible ? (qr ? <QrManagement /> : analytics ? <Analytics /> : settings ? <RestaurantSettings /> : menu ? <MenuManagement /> : <RestaurantDashboard />) : <Navigate to="/pending-approval" replace />;
};

const PendingRoute = () => {
  const { loading, isAuthenticated, isRestaurantUser, isRestaurantAccessible } = useAuth();
  if (isMainDomain() && !isLocalhost()) {
    return <RouteLoading />;
  }
  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isRestaurantUser) return <Navigate to="/admin" replace />;
  return isRestaurantAccessible ? <Navigate to="/dashboard" replace /> : <PendingApproval />;
};

const HomeRoute = () => {
  const { loading, isAuthenticated, isAdmin, isRestaurantUser, isRestaurantAccessible } = useAuth();
  if (loading) return <RouteLoading />;

  // On panel.zuuqrmenu.com root, send straight to dashboard or login instead of landing
  if (isPanelSubdomain()) {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isRestaurantUser) return isRestaurantAccessible ? <Navigate to="/dashboard" replace /> : <Navigate to="/pending-approval" replace />;
    return <Navigate to="/login" replace />;
  }

  // On main site (www.zuuqrmenu.com), ALWAYS show the Landing Page
  return <LandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <HostRouterGuard />
        <DashboardThemeController />
        <GAPageTracker />
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<RegisterRoute />} />
            <Route path="/pending-approval" element={<PendingRoute />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin/restaurants" element={<AdminRoute />} />
            <Route path="/dashboard" element={<RestaurantRoute />} />
            <Route path="/dashboard/menu" element={<RestaurantRoute menu />} />
            <Route path="/dashboard/settings" element={<RestaurantRoute settings />} />
            <Route path="/dashboard/analytics" element={<RestaurantRoute analytics />} />
            <Route path="/dashboard/qr" element={<RestaurantRoute qr />} />
            <Route path="/:username/menu" element={<PublicMenu />} />
            <Route path="/menu" element={<MenuShowcase />} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
