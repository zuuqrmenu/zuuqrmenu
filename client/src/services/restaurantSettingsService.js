import api from './api';

export const restaurantSettingsService = {
  get: async () => (await api.get('/restaurant/settings')).data,
  update: async (settings) => (await api.patch('/restaurant/settings', settings)).data,
  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return (await api.post('/restaurant/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  uploadCover: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return (await api.post('/restaurant/settings/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  uploadStore: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return (await api.post('/restaurant/settings/store', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  removeLogo: async () => (await api.delete('/restaurant/settings/logo')).data,
  removeCover: async () => (await api.delete('/restaurant/settings/cover')).data,
  removeStore: async () => (await api.delete('/restaurant/settings/store')).data,
};