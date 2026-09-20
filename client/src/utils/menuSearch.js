/**
 * Normalizes Turkish and international characters for tolerant searching.
 * e.g., 'Sütlaç' -> 'sutlac', 'Çay' -> 'cay', 'İçecek' -> 'icecek'
 */
export const normalizeTurkish = (text) => {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
};

/**
 * Searches and ranks products based on relevance.
 *
 * Scoring:
 * - 1000: Exact match on product name
 * - 500: Product name starts with query (e.g. 'T' -> 'Tavuk', 'Tost')
 * - 300: Any word in product name starts with query (e.g. 'T' -> 'Kaşarlı Tost')
 * - 150: Product name contains query as substring (e.g. 'Ğ' -> 'Paçanga Böreği')
 * - 100: Category name starts with query (e.g. 'T' -> 'Tatlılar')
 * - 60: Category name contains query
 * - 30: Description contains a word starting with query (only for queries >= 2 chars)
 * - 10: Description contains query (only for queries >= 2 chars)
 *
 * Single-character queries (e.g. 'T', 'Ğ') are strictly restricted to name/category
 * to prevent common letters from matching every food description.
 */
export const searchProducts = (products = [], searchQuery = '') => {
  const query = (searchQuery || '').trim().toLocaleLowerCase('tr');
  if (!query) return [];

  const normQuery = normalizeTurkish(query);
  const isSingleChar = query.length === 1;

  const scored = [];

  for (const product of products) {
    if (!product) continue;

    const name = (product.name || '').trim();
    if (!name) continue;

    const nameLower = name.toLocaleLowerCase('tr');
    const nameNorm = normalizeTurkish(name);

    const catName = (product.categoryName || '').trim();
    const catLower = catName.toLocaleLowerCase('tr');
    const catNorm = normalizeTurkish(catName);

    let score = 0;

    // 1. Exact match on name
    if (nameLower === query || nameNorm === normQuery) {
      score = 1000;
    }
    // 2. Name starts with query
    else if (nameLower.startsWith(query) || nameNorm.startsWith(normQuery)) {
      score = 500;
    }
    // 3. Word in name starts with query
    else {
      const nameWords = nameLower.split(/\s+/);
      const nameNormWords = nameNorm.split(/\s+/);

      if (
        nameWords.some((w) => w.startsWith(query)) ||
        nameNormWords.some((w) => w.startsWith(normQuery))
      ) {
        score = 300;
      }
      // 4. Name contains query
      else if (nameLower.includes(query) || nameNorm.includes(normQuery)) {
        score = 150;
      }
      // 5. Category starts with query
      else if (catLower.startsWith(query) || catNorm.startsWith(normQuery)) {
        score = 100;
      }
      // 6. Category contains query
      else if (catLower.includes(query) || catNorm.includes(normQuery)) {
        score = 60;
      }
      // 7. Search in descriptions only if query length >= 2
      else if (!isSingleChar) {
        const desc = [product.description, product.shortDescription]
          .filter((d) => typeof d === 'string' && d.trim())
          .join(' ')
          .trim();

        if (desc) {
          const descLower = desc.toLocaleLowerCase('tr');
          const descNorm = normalizeTurkish(desc);
          const descWords = descLower.split(/\s+/);
          const descNormWords = descNorm.split(/\s+/);

          if (
            descWords.some((w) => w.startsWith(query)) ||
            descNormWords.some((w) => w.startsWith(normQuery))
          ) {
            score = 30;
          } else if (descLower.includes(query) || descNorm.includes(normQuery)) {
            score = 10;
          }
        }
      }
    }

    if (score > 0) {
      scored.push({ product, score });
    }
  }

  // Sort by score DESC, then shorter name, then alphabetical
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.product.name.length !== b.product.name.length) {
      return a.product.name.length - b.product.name.length;
    }
    return a.product.name.localeCompare(b.product.name, 'tr');
  });

  return scored.map((item) => item.product);
};

export default searchProducts;
