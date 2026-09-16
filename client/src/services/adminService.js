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
};