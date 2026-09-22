import api from './api';

/**
 * Sends a chat message to ZuuAI via the backend API
 * @param {string} message - User message
 * @param {Object} [context] - Optional context
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const sendChatMessage = async (message, context) => {
  const response = await api.post(
    '/ai/chat',
    { message, context },
    { timeout: 35000 }
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

export default {
  sendChatMessage,
  getAiQuota,
};
