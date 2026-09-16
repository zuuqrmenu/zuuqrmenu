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
    const path = config.url || '';
    const isAuthEndpoint = path.startsWith('/auth/') && !['/auth/link-firebase', '/auth/firebase-session', '/auth/register-firebase'].includes(path);
    const isPublicEndpoint = path.startsWith('/public/');
    if (!isAuthEndpoint && !isPublicEndpoint && auth.currentUser) {
      const token = await getFirebaseIdToken();
      if (token) {
        config.headers = config.headers || {};
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
