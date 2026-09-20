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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      if (isSessionExpired()) {
        clearSessionFromStorage();
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
        clearSessionFromStorage();
        setUser(null);
        setRestaurant(null);
        setError('Oturum süreniz doldu (1 gün). Lütfen tekrar giriş yapın.');
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
          // Local token was invalid or expired, clear it
          clearSessionFromStorage();
        }
      }

      // 2. Wait for Firebase auth state to be ready
      if (auth.authStateReady) {
        try {
          await auth.authStateReady();
        } catch {}
      }

      // 3. If Firebase user is authenticated, create/restore session
      if (auth.currentUser) {
        try {
          const session = await authService.firebaseSession();
          saveSessionToStorage(session);
          setUser(session.user);
          setRestaurant(session.restaurant);
          setError(null);
          setLoading(false);
          return;
        } catch (sessionErr) {
          console.warn('Firebase session restore failed:', sessionErr);
        }
      }

      // 4. Definitely logged out - do not call getMe() without token so old cookies cannot resurrect old sessions
      clearSessionFromStorage();
      setUser(null);
      setRestaurant(null);
    } catch (err) {
      clearSessionFromStorage();
      setUser(null);
      setRestaurant(null);
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextFirebaseUser) => {
      setFirebaseUser(nextFirebaseUser);
      // If user has active Firebase auth but no local JWT session, restore from firebase-session
      if (nextFirebaseUser && !localStorage.getItem('zuulab_auth_token') && !isSessionExpired()) {
        try {
          const session = await authService.firebaseSession();
          saveSessionToStorage(session);
          setUser(session.user || null);
          setRestaurant(session.restaurant || null);
        } catch {
          // Passively ignore restore errors
        }
      }
    });

    if (!authStateInitialized.current) {
      authStateInitialized.current = true;
      checkAuth();
    }
    return unsubscribe;
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
