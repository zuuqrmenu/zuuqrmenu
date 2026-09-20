import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

const saveSessionToStorage = (session) => {
  if (session?.token) {
    localStorage.setItem('zuulab_auth_token', session.token);
    // Exact 1 day (24 hours) lifetime in milliseconds
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('zuulab_auth_expires_at', String(expiresAt));
  }
  if (session?.user) {
    localStorage.setItem('zuulab_auth_user', JSON.stringify(session.user));
  }
  if (session?.restaurant) {
    localStorage.setItem('zuulab_auth_restaurant', JSON.stringify(session.restaurant));
  }
};

const clearSessionFromStorage = () => {
  localStorage.removeItem('zuulab_auth_token');
  localStorage.removeItem('zuulab_auth_expires_at');
  localStorage.removeItem('zuulab_auth_user');
  localStorage.removeItem('zuulab_auth_restaurant');
};

const isSessionExpired = () => {
  const expiresAt = localStorage.getItem('zuulab_auth_expires_at');
  if (!expiresAt) return false;
  return Date.now() > Number(expiresAt);
};

const handleSessionExpiration = async () => {
  clearSessionFromStorage();
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (err) {
    console.warn('Firebase sign out error on expiration:', err);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (isSessionExpired()) {
        return null;
      }
      const cached = localStorage.getItem('zuulab_auth_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [restaurant, setRestaurant] = useState(() => {
    try {
      if (isSessionExpired()) return null;
      const cached = localStorage.getItem('zuulab_auth_restaurant');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const authStateInitialized = useRef(false);

  const checkAuth = async () => {
    try {
      if (isSessionExpired()) {
        await handleSessionExpiration();
        setUser(null);
        setRestaurant(null);
        setError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }

      const hasLocalToken = !!localStorage.getItem('zuulab_auth_token');

      // 1. Only check getMe() if we have an active local JWT session token
      if (hasLocalToken) {
        try {
          const data = await authService.getMe();
          if (data?.token) {
            saveSessionToStorage(data);
          } else if (data?.user) {
            localStorage.setItem('zuulab_auth_user', JSON.stringify(data.user));
            if (data.restaurant) localStorage.setItem('zuulab_auth_restaurant', JSON.stringify(data.restaurant));
          }
          setUser(data.user);
          setRestaurant(data.restaurant);
          setError(null);
          setLoading(false);
          return;
        } catch (getMeError) {
          // Local token was invalid or expired, clear it and sign out Firebase
          await handleSessionExpiration();
          setUser(null);
          setRestaurant(null);
          setLoading(false);
          return;
        }
      }

      // If no local token, ensure Firebase session is also signed out so state remains strictly synchronized
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {}
      }

      clearSessionFromStorage();
      setUser(null);
      setRestaurant(null);
    } catch (err) {
      await handleSessionExpiration();
      setUser(null);
      setRestaurant(null);
      setError(err.response?.data?.error || 'Kimlik doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextFirebaseUser) => {
      setFirebaseUser(nextFirebaseUser);
      // If Firebase user exists but session has expired, enforce immediate sign out
      if (nextFirebaseUser && isSessionExpired()) {
        await handleSessionExpiration();
        setUser(null);
        setRestaurant(null);
      }
    });

    if (!authStateInitialized.current) {
      authStateInitialized.current = true;
      checkAuth();
    }
    return unsubscribe;
  }, []);

  // Periodic expiration watcher + tab focus/visibility watcher + custom event listener
  useEffect(() => {
    const enforceExpiry = async () => {
      if (isSessionExpired()) {
        await handleSessionExpiration();
        setUser(null);
        setRestaurant(null);
        setError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      }
    };

    const handleAuthExpiredEvent = async () => {
      await handleSessionExpiration();
      setUser(null);
      setRestaurant(null);
      setError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
    };

    // Periodically verify session every 60 seconds
    const interval = setInterval(enforceExpiry, 60 * 1000);

    // Verify when user returns to tab
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        enforceExpiry();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', enforceExpiry);
    window.addEventListener('zuulab-auth-expired', handleAuthExpiredEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', enforceExpiry);
      window.removeEventListener('zuulab-auth-expired', handleAuthExpiredEvent);
    };
  }, []);

  const login = async (credentials) => {
    try {
      clearSessionFromStorage();
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch {}
      }
      const data = await authService.login(credentials);
      saveSessionToStorage(data);
      setUser(data.user);
      setRestaurant(data.restaurant);
      setError(null);
      return { success: true, user: data.user, restaurant: data.restaurant };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const setApplicationSession = (session) => {
    saveSessionToStorage(session);
    setUser(session?.user || null);
    setRestaurant(session?.restaurant || null);
    setError(null);
  };

  const logout = async () => {
    try {
      // Send logout to backend while token is still available in localStorage so request has authorization
      await Promise.allSettled([authService.logout(), signOut(auth)]);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSessionFromStorage();
      setUser(null);
      setRestaurant(null);
      setError(null);
      setFirebaseUser(null);
    }
  };

  const linkFirebase = async () => {
    try {
      return await authService.linkFirebase();
    } catch (linkError) {
      return { success: false, error: linkError.response?.data?.error || 'Firebase hesabı eşleştirilemedi.' };
    }
  };

  const createMenuIdentity = async (username) => {
    try {
      const data = await authService.createMenuIdentity(username);
      const updatedUser = { ...(user || {}), ...(data.user || {}) };
      setUser(updatedUser);
      localStorage.setItem('zuulab_auth_user', JSON.stringify(updatedUser));
      return { success: true, user: data.user };
    } catch (creationError) {
      return { success: false, error: creationError.response?.data?.error || 'Menü adresi oluşturulamadı.' };
    }
  };

  const value = {
    user,
    restaurant,
    loading,
    error,
    firebaseUser,
    login,
    setApplicationSession,
    logout,
    checkAuth,
    linkFirebase,
    createMenuIdentity,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isRestaurantUser: user?.role === 'RESTAURANT_USER',
    isRestaurantAccessible: restaurant?.status === 'ACTIVE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
