// Single source of truth for sellable plans. Prices are in TRY (KDV dahil), same as the landing page.
export const PLANS = {
  starter: { id: 'starter', name: 'Başlangıç', monthly: 299, yearly: 2199 },
  professional: { id: 'professional', name: 'Profesyonel', monthly: 399, yearly: 2999 },
};

export const BILLING_PERIODS = {
  monthly: { months: 1, label: 'Aylık' },
  yearly: { months: 12, label: 'Yıllık' },
};

export const getPlanPrice = (planId, period) => {
  const plan = PLANS[planId];
  if (!plan || !BILLING_PERIODS[period]) return null;
  return { plan, amount: period === 'yearly' ? plan.yearly : plan.monthly };
};
