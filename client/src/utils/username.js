export const normalizeUsername = (value = '') => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[ıİ]/g, 'i')
  .replace(/[ğĞ]/g, 'g')
  .replace(/[üÜ]/g, 'u')
  .replace(/[şŞ]/g, 's')
  .replace(/[öÖ]/g, 'o')
  .replace(/[çÇ]/g, 'c')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 40)
  .replace(/-+$/g, '');
