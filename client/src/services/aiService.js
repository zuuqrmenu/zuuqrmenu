import api from './api';

/**
 * Sends a chat message to ZuuAI via the backend API
 * @param {string} message - User message
 * @param {Object} [context] - Optional context
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const sendChatMessage = async (message, context, images = []) => {
  const response = await api.post(
    '/ai/chat',
    { message, context, images },
    { timeout: 270000 }
  );
  return response.data;
};

/**
 * Retrieves the current user's ZuuAI message quota and usage
 * @returns {Promise<{ success: boolean, data: { dailyUsed: number, dailyLimit: number, dailyRemaining: number, monthlyUsed: number, monthlyLimit: number, monthlyRemaining: number, isAdmin: boolean } }>}
 */
export const getAiQuota = async () => {
  const response = await api.get('/ai/usage');
  return response.data;
};

export const sendAdminChatMessage = async (message, context, images = []) => {
  const response = await api.post(
    '/admin/ai/chat',
    { message, context, images },
    { timeout: 270000 }
  );
  return response.data;
};

export const getAdminAiSettings = async () => {
  const response = await api.get('/admin/ai/settings');
  return response.data;
};

export const analyzeMenuImages = async (images) => {
  const response = await api.post('/ai/menu-analyze', { images }, { timeout: 600000 });
  return response.data;
};

export const getMenuAnalysisStatus = async () => {
  const response = await api.get('/ai/menu-analyze/status');
  return response.data;
};

export const suggestProductDetails = async (payload) => {
  const response = await api.post('/ai/product-suggest', payload, { timeout: 90000 });
  return response.data;
};

export const batchGenerateProductDescriptions = async (categories) => {
  const response = await api.post(
    '/ai/batch-product-descriptions',
    { categories },
    { timeout: 300000 }
  );
  return response.data;
};

export default {
  sendChatMessage,
  getAiQuota,
  sendAdminChatMessage,
  getAdminAiSettings,
  analyzeMenuImages,
  getMenuAnalysisStatus,
  suggestProductDetails,
  batchGenerateProductDescriptions,
};
