/**
 * Domain & Subdomain Helper Utilities
 * Supports separating public landing (zuuqrmenu.com) and dashboard panel (panel.zuuqrmenu.com)
 */

export const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
};

export const isPanelSubdomain = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'panel.zuuqrmenu.com';
};

export const isMainDomain = () => {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return host === 'zuuqrmenu.com' || host === 'www.zuuqrmenu.com';
};

/**
 * Returns absolute or relative URL for Panel
 * On production: returns https://panel.zuuqrmenu.com{path}
 * On localhost: returns {path}
 */
export const getPanelUrl = (path = '/dashboard') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (isLocalhost()) {
    return normalizedPath;
  }
  return `https://panel.zuuqrmenu.com${normalizedPath}`;
};

/**
 * Returns absolute or relative URL for Main Public Site
 * On production: returns https://www.zuuqrmenu.com{path}
 * On localhost: returns {path}
 */
export const getMainSiteUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (isLocalhost()) {
    return normalizedPath;
  }
  return `https://www.zuuqrmenu.com${normalizedPath}`;
};

/**
 * Returns full absolute URL for a public restaurant menu.
 * Always targets the main public site domain: https://www.zuuqrmenu.com/{username}/menu
 * In localhost, uses localhost origin.
 */
export const getPublicMenuAbsoluteUrl = (username) => {
  if (!username) return '';
  const path = `/${encodeURIComponent(username)}/menu`;
  if (isLocalhost()) {
    return typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
  }
  return `https://www.zuuqrmenu.com${path}`;
};

/**
 * Checks if a pathname belongs strictly to the panel application
 */
export const isPanelPath = (pathname = '') => {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/pending-approval'
  );
};

/**
 * Checks if a pathname belongs strictly to a public customer menu or showcase.
 * Explicitly excludes panel routes like /dashboard/menu.
 */
export const isPublicMenuPath = (pathname = '') => {
  if (isPanelPath(pathname)) return false;
  if (pathname === '/menu') return true;
  return /^\/[^/]+\/menu\/?$/.test(pathname);
};

/**
 * Safely redirects to panel if running in production on main domain
 */
export const redirectToPanelIfNeeded = (targetPath = '/dashboard') => {
  if (typeof window === 'undefined') return false;
  if (isLocalhost()) return false;

  const currentHost = window.location.hostname;
  if (currentHost === 'zuuqrmenu.com' || currentHost === 'www.zuuqrmenu.com') {
    const normalized = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
    window.location.replace(`https://panel.zuuqrmenu.com${normalized}`);
    return true;
  }
  return false;
};

