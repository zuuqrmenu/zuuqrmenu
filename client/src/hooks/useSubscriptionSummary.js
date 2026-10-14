import { useCallback, useEffect, useState } from 'react';
import { billingService } from '../services/billingService';

// RestaurantLayout remounts on every route change, so the last answer is kept here to avoid a flash of "no plan".
let cached = null;
let cachedAt = 0;
const TTL = 60 * 1000;

const summarise = (overview) => {
  const subscription = overview?.subscription;
  const active = subscription?.status === 'ACTIVE' && subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) > new Date();
  return { loaded: true, planName: active ? subscription.planName : null, active: Boolean(active) };
};

/** Current plan for the sidebar profile card: `planName` is null when there is no active paid plan. */
const useSubscriptionSummary = () => {
  const [summary, setSummary] = useState(cached || { loaded: false, planName: null, active: false });

  const refresh = useCallback(() => billingService.getOverview()
    .then((overview) => {
      cached = summarise(overview);
      cachedAt = Date.now();
      setSummary(cached);
    })
    .catch(() => setSummary((current) => (current.loaded ? current : { loaded: true, planName: null, active: false }))), []);

  useEffect(() => {
    if (!cached || Date.now() - cachedAt > TTL) refresh();
  }, [refresh]);

  return [summary, refresh];
};

export default useSubscriptionSummary;
