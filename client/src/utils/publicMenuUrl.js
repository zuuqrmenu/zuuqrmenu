import { getPublicMenuAbsoluteUrl } from './domainHelpers';

export const getPublicMenuUrl = (username) => {
  if (typeof username !== 'string' || !/^[a-z0-9-]+$/.test(username)) return null;
  return getPublicMenuAbsoluteUrl(username);
};