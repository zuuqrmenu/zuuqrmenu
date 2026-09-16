import api from './api';

export const authService = {
  registerFirebase: async (userData) => (await api.post('/auth/register-firebase', userData)).data,

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profile) => (await api.put('/auth/profile', profile)).data,
  createMenuIdentity: async (username) => (await api.post('/auth/menu-setup', { username })).data,
  reauthenticate: async (credentials) => (await api.post('/auth/reauthenticate', credentials)).data,
  updateEmail: async (payload) => (await api.put('/auth/email', payload)).data,
  changePassword: async (passwords) => (await api.put('/auth/change-password', passwords)).data,
  linkFirebase: async () => (await api.post('/auth/link-firebase')).data,
  firebaseSession: async () => (await api.post('/auth/firebase-session')).data,
};
