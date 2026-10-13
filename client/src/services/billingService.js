import api from './api';

export const billingService = {
  getOverview: async () => (await api.get('/billing')).data,
  createCheckout: async (payload) => (await api.post('/billing/checkout', payload)).data,
  getOrder: async (merchantOid) => (await api.get(`/billing/orders/${encodeURIComponent(merchantOid)}`)).data,
};
