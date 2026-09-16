import api from './api';

export const restaurantProfileService = {
  get: async () => (await api.get('/restaurant/profile')).data,
  update: async (profile) => (await api.put('/restaurant/profile', profile)).data,
};
