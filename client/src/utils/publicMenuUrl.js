export const getPublicMenuUrl = (username) => {
  if (typeof username !== 'string' || !/^[a-z0-9-]+$/.test(username)) return null;
  return new URL(`/${encodeURIComponent(username)}/menu`, window.location.origin).toString();
};