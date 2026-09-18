/**
 * Google Analytics 4 utility
 *
 * Initialises the gtag.js script once and exposes a `trackPageView` helper.
 * No PII is collected – only the page path and title are sent.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialised = false;

/**
 * Injects the gtag.js loader script and configures the GA4 stream.
 * Called once on app startup. Safe to call multiple times – subsequent
 * calls are ignored.
 */
export function initGA() {
  if (!GA_ID || initialised) return;

  // Create the async gtag loader script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // Bootstrap the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // arguments object must be pushed as-is (gtag convention)
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());

  // Initialise the stream with send_page_view: false so we control
  // page views ourselves via trackPageView to avoid duplicates.
  gtag('config', GA_ID, { send_page_view: false });

  initialised = true;
}

/**
 * Sends a page_view event to GA4.
 *
 * @param {string} path  - The current URL path (e.g. "/coffee-house/menu")
 * @param {string} title - The document title at the time of navigation
 */
export function trackPageView(path, title) {
  if (!GA_ID || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Sends a custom or standard GA4 event.
 *
 * @param {string} eventName - GA4 event name (e.g. 'login', 'sign_up', 'download_qr')
 * @param {Record<string, any>} [params] - Non-sensitive event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (!GA_ID || !window.gtag) return;

  window.gtag('event', eventName, params);
}

