import axios from 'axios';
import { auth } from '../config/firebase';
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
    const isAnonymousAuth = path === '/auth/login' || path === '/auth/register-firebase';

    if (isPublicEndpoint || isAnonymousAuth) {
      return config;
    }

    // 1. Check local JWT auth token and its 1-day (24h) expiry
    const authToken = localStorage.getItem('zuulab_auth_token');
    const expiresAt = localStorage.getItem('zuulab_auth_expires_at');

    if (authToken) {
      if (expiresAt && Date.now() > Number(expiresAt)) {
        // Token has expired after 1 day
        localStorage.removeItem('zuulab_auth_token');
        localStorage.removeItem('zuulab_auth_expires_at');
        localStorage.removeItem('zuulab_auth_user');
        localStorage.removeItem('zuulab_auth_restaurant');
      } else {
        config.headers.Authorization = `Bearer ${authToken}`;
        return config;
      }
    }

    // 2. Fallback to Firebase ID token if available (e.g. initial login / session restore)
    if (!auth.currentUser && auth.authStateReady) {
      try {
        await auth.authStateReady();
      } catch {}
    }

    if (auth.currentUser) {
      const token = await getFirebaseIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;
