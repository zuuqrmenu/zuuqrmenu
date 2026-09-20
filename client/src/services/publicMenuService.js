import api from './api';

const menuCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute in-memory cache for instant navigation

export const publicMenuService = {
  clearCache: (username) => {
    if (username) {
      menuCache.delete(username.toLowerCase());
    } else {
      menuCache.clear();
    }
  },

  getCachedMenu: (username) => {
    if (!username) return null;
    const key = username.toLowerCase();
    const entry = menuCache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
    return null;
  },

  prefetchMenu: (username) => {
    if (!username) return;
    const key = username.toLowerCase();
    const entry = menuCache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) return;
    api.get(`/public/menu/${encodeURIComponent(username)}`)
      .then((res) => {
        menuCache.set(key, { data: res.data, timestamp: Date.now() });
      })
      .catch(() => {});
  },

  getMenu: async (username, force = false) => {
    if (!username) throw new Error('Username is required');
    const key = username.toLowerCase();
    const entry = menuCache.get(key);
    if (!force && entry && Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.data;
    }
    const response = await api.get(`/public/menu/${encodeURIComponent(username)}`);
    menuCache.set(key, { data: response.data, timestamp: Date.now() });
    return response.data;
  },

  submitReview: async (username, review) => (await api.post(`/public/reviews/${encodeURIComponent(username)}`, review)).data,
  trackEvent: async (username, event) => (await api.post(`/public/analytics/events/${encodeURIComponent(username)}`, event)).data,
};