import api from './api';

export const analyticsService = {
  getOverview: async ({ startDate, endDate }) => (await api.get('/analytics/overview', { params: { startDate, endDate } })).data,
};