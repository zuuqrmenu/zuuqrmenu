import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const authStateInitialized = useRef(false);

  const checkAuth = async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      setRestaurant(data.restaurant);
      setError(null);
    } catch (err) {
      setUser(null);
      setRestaurant(null);
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextFirebaseUser) => {
      setFirebaseUser(nextFirebaseUser);
    });
    if (!authStateInitialized.current) {
      authStateInitialized.current = true;
      checkAuth();
    }
    return unsubscribe;
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
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
    setUser(session?.user || null);
    setRestaurant(session?.restaurant || null);
    setError(null);
  };

  const logout = async () => {
    try {
      await Promise.allSettled([authService.logout(), signOut(auth)]);
      setUser(null);
      setRestaurant(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
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
      setUser((current) => ({ ...current, ...(data.user || {}) }));
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
