/**
 * Server-side Image Optimization Utilities
 * Injects dynamic Cloudinary transformations for automatic WebP/AVIF delivery and compression.
 */

/**
 * Transforms Cloudinary and Unsplash URLs to deliver optimized, compressed WebP images.
 *
 * @param {string} url - Original image URL
 * @param {Object} options - Options
 * @param {number} [options.width=900] - Max width
 * @param {string} [options.quality='auto:good'] - Quality setting
 * @param {string} [options.format='auto'] - Target format ('auto' negotiates WebP/AVIF with browser)
 * @returns {string} Transformed image URL
 */
export const optimizeCloudinaryUrl = (url, { width = 1200, quality = 'auto:best', format = 'auto' } = {}) => {
  if (!url || typeof url !== 'string') return url;

  // Cloudinary URLs
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // Check if it already has transformations like /upload/f_auto,q_auto.../
    if (/\/upload\/(?:[a-z]_[^/]+,?)+\//.test(url)) {
      return url;
    }
    const transform = `f_${format},q_${quality},w_${width},c_limit`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  // Unsplash URLs
  if (url.includes('unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('q', '75');
      return parsed.toString();
    } catch (_) {
      return url;
    }
  }

  return url;
};

export default optimizeCloudinaryUrl;
