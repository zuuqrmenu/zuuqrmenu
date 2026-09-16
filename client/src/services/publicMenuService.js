import api from './api';

export const publicMenuService = {
  getMenu: async (username) => {
    const response = await api.get(`/public/menu/${encodeURIComponent(username)}`);
    return response.data;
  },

  submitReview: async (username, review) => (await api.post(`/public/reviews/${encodeURIComponent(username)}`, review)).data,
  trackEvent: async (username, event) => (await api.post(`/public/analytics/events/${encodeURIComponent(username)}`, event)).data,
};