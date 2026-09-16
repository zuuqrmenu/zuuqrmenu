import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PendingApproval from './pages/PendingApproval';
import AdminDashboard from './pages/AdminDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import MenuManagement from './pages/MenuManagement';
import PublicMenu from './pages/PublicMenu';
import RestaurantSettings from './pages/RestaurantSettings';
import Appearance from './pages/Appearance';
import QrManagement from './pages/QrManagement';
import Analytics from './pages/Analytics';
import LandingPage from './pages/LandingPage';

const RouteLoading = () => (
  <div className="route-loading">
    <div className="route-loading__content">
      <img src="/logo_darkmode.svg" alt="zuuqrmenu" className="route-loading__logo" />
      <span className="route-loading__spinner" aria-label="Yükleniyor" />
      <p>Menünüz hazırlanıyor...</p>
    </div>
  </div>
);

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

const AdminRoute = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" replace />;
};

const RestaurantRoute = ({ menu = false, settings = false, appearance = false, analytics = false, qr = false }) => {
  const { loading, isAuthenticated, isRestaurantUser, isRestaurantAccessible } = useAuth();
  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isRestaurantUser) return <Navigate to="/admin" replace />;
  return isRestaurantAccessible ? (qr ? <QrManagement /> : analytics ? <Analytics /> : appearance ? <Appearance /> : settings ? <RestaurantSettings /> : menu ? <MenuManagement /> : <RestaurantDashboard />) : <Navigate to="/pending-approval" replace />;
};

const PendingRoute = () => {
  const { loading, isAuthenticated, isRestaurantUser, isRestaurantAccessible } = useAuth();
  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isRestaurantUser) return <Navigate to="/admin" replace />;
  return isRestaurantAccessible ? <Navigate to="/dashboard" replace /> : <PendingApproval />;
};

const HomeRoute = () => {
  const { loading, isAuthenticated, isAdmin, isRestaurantUser, isRestaurantAccessible } = useAuth();
  if (loading) return <RouteLoading />;
  if (!isAuthenticated) return <LandingPage />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isRestaurantUser) return isRestaurantAccessible ? <Navigate to="/dashboard" replace /> : <Navigate to="/pending-approval" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <DashboardThemeController />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending-approval" element={<PendingRoute />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/admin/restaurants" element={<AdminRoute />} />
          <Route path="/dashboard" element={<RestaurantRoute />} />
          <Route path="/dashboard/menu" element={<RestaurantRoute menu />} />
          <Route path="/dashboard/settings" element={<RestaurantRoute settings />} />
          <Route path="/dashboard/appearance" element={<RestaurantRoute appearance />} />
          <Route path="/dashboard/analytics" element={<RestaurantRoute analytics />} />
          <Route path="/dashboard/qr" element={<RestaurantRoute qr />} />
          <Route path="/:username/menu" element={<PublicMenu />} />
          <Route path="/" element={<HomeRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
