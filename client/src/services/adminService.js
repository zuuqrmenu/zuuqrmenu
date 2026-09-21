import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getRestaurants: async () => {
    const response = await api.get('/admin/restaurants');
    return response.data;
  },

  updateStatus: async (restaurantId, action) => {
    const response = await api.patch(`/admin/restaurants/${restaurantId}/${action}`);
    return response.data;
  },

  updateRestaurant: async (restaurantId, payload) => {
    const response = await api.patch(`/admin/restaurants/${restaurantId}`, payload);
    return response.data;
  },

  deleteRestaurant: async (restaurantId) => {
    const response = await api.delete(`/admin/restaurants/${restaurantId}`);
    return response.data;
  },

  getExternalServicesUsage: async ({ refresh = false, service = '' } = {}) => {
    const params = new URLSearchParams();
    if (refresh) params.append('refresh', 'true');
    if (service) params.append('service', service);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/admin/external-services${qs}`);
    return response.data;
  },
};