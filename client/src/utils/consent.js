const KEY = 'zuulab.cookie-consent';

/** Returns 'all', 'necessary' or null when the visitor has not chosen yet. */
export const getCookieConsent = () => {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'all' || value === 'necessary' ? value : null;
  } catch {
    return null;
  }
};

export const setCookieConsent = (value) => {
  try {
    localStorage.setItem(KEY, value);
  } catch { /* storage blocked: the choice just won't persist */ }
  window.dispatchEvent(new CustomEvent('zuulab-cookie-consent', { detail: value }));
};

export const hasAnalyticsConsent = () => getCookieConsent() === 'all';
