import api from './api';

export const menuService = {
  getOverview: async () => {
    const response = await api.get('/menu/overview');
    return response.data;
  },

  updateStatus: async (status) => (await api.patch('/menu/status', { status })).data,

  getCategories: async () => {
    const response = await api.get('/menu/categories');
    return response.data;
  },

  createCategory: async (category) => {
    const response = await api.post('/menu/categories', category);
    return response.data;
  },

  updateCategory: async (categoryId, category) => {
    const response = await api.patch(`/menu/categories/${categoryId}`, category);
    return response.data;
  },

  toggleCategory: async (categoryId) => {
    const response = await api.patch(`/menu/categories/${categoryId}/toggle`);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/menu/categories/${categoryId}`);
    return response.data;
  },

  getProducts: async () => {
    const response = await api.get('/menu/products');
    return response.data;
  },

  createProduct: async (product) => {
    const response = await api.post('/menu/products', product);
    return response.data;
  },

  updateProduct: async (productId, product) => {
    const response = await api.patch(`/menu/products/${productId}`, product);
    return response.data;
  },

  toggleAvailability: async (productId) => {
    const response = await api.patch(`/menu/products/${productId}/toggle-availability`);
    return response.data;
  },

  toggleFeatured: async (productId) => {
    const response = await api.patch(`/menu/products/${productId}/toggle-featured`);
    return response.data;
  },

  deleteProduct: async (productId) => {
    const response = await api.delete(`/menu/products/${productId}`);
    return response.data;
  },

  uploadProductImage: async (productId, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/menu/products/${productId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeProductImage: async (productId) => {
    const response = await api.delete(`/menu/products/${productId}/image`);
    return response.data;
  },

  bulkDeleteCategories: async (payload) => {
    const response = await api.post('/menu/bulk-delete-categories', payload);
    return response.data;
  },

  bulkDeleteProducts: async (payload) => {
    const response = await api.post('/menu/bulk-delete-products', payload);
    return response.data;
  },

  bulkClearDescriptions: async (payload) => {
    const response = await api.post('/menu/bulk-clear-descriptions', payload);
    return response.data;
  },
};