import axios from 'axios';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { getFirebaseIdToken } from './firebaseToken';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};
    const path = config.url || '';
    const isPublicEndpoint = path.startsWith('/public/');
    const isAnonymousAuth = path === '/auth/login';

    // Prevent browser disk-cache and cross-origin CORS cache collisions between subdomains
    if (config.method?.toLowerCase() === 'get' && !isPublicEndpoint) {
      config.params = { ...config.params, _t: Date.now() };
      config.headers['Cache-Control'] = 'no-cache';
      config.headers['Pragma'] = 'no-cache';
    }

    if (isPublicEndpoint || isAnonymousAuth) {
      return config;
    }

    // Firebase authenticated endpoints must always use Firebase ID token
    const isFirebaseEndpoint = path === '/auth/firebase-session' || path === '/auth/register-firebase' || path === '/auth/link-firebase';
    if (isFirebaseEndpoint) {
      const token = await getFirebaseIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }

    // 1. Check local JWT auth token and its 1-day (24h) expiry
    const expiresAt = localStorage.getItem('zuulab_auth_expires_at');
    const isExpired = expiresAt && Date.now() > Number(expiresAt);

    if (isExpired) {
      // 24 hours have passed -> completely purge session and sign out Firebase
      localStorage.removeItem('zuulab_auth_token');
      localStorage.removeItem('zuulab_auth_expires_at');
      localStorage.removeItem('zuulab_auth_user');
      localStorage.removeItem('zuulab_auth_restaurant');
      if (auth.currentUser) {
        signOut(auth).catch(() => {});
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zuulab-auth-expired'));
      }
      // Return without token so server rejects with 401
      return config;
    }

    const authToken = localStorage.getItem('zuulab_auth_token');
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      return config;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zuulab_auth_token');
      localStorage.removeItem('zuulab_auth_expires_at');
      localStorage.removeItem('zuulab_auth_user');
      localStorage.removeItem('zuulab_auth_restaurant');
      if (auth.currentUser) {
        signOut(auth).catch(() => {});
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zuulab-auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
