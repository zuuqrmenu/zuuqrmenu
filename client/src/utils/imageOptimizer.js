/**
 * Client-side Image Optimization Utilities
 * Converts images to modern WebP format and optimizes Cloudinary/Unsplash CDN URLs.
 */

/**
 * Format bytes into human readable string (KB/MB)
 */
export const formatFileSize = (bytes) => {
  if (!bytes || Number.isNaN(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Compresses an image File to WebP format using HTML5 Canvas.
 * Automatically scales down large camera photos to a max dimension of 1200px,
 * preserving aspect ratio and applying high-fidelity 0.88 WebP quality.
 *
 * @param {File} file - The original image file
 * @param {Object} options - Options
 * @param {number} [options.maxDimension=1200] - Max width or height in pixels
 * @param {number} [options.quality=0.88] - WebP quality from 0.0 to 1.0 (0.88 is visually lossless)
 * @returns {Promise<{ file: File, previewUrl: string, originalSize: number, optimizedSize: number, savingsPercent: number }>}
 */
export const compressImageToWebp = (file, { maxDimension = 1200, quality = 0.88 } = {}) => {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      return resolve({
        file,
        previewUrl: file ? URL.createObjectURL(file) : '',
        originalSize: file?.size || 0,
        optimizedSize: file?.size || 0,
        savingsPercent: 0,
      });
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const naturalWidth = image.naturalWidth || image.width || 1000;
      const naturalHeight = image.naturalHeight || image.height || 1000;

      const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
      const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
      const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        return resolve({
          file,
          previewUrl: URL.createObjectURL(file),
          originalSize: file.size,
          optimizedSize: file.size,
          savingsPercent: 0,
        });
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve({
              file,
              previewUrl: URL.createObjectURL(file),
              originalSize: file.size,
              optimizedSize: file.size,
              savingsPercent: 0,
            });
          }

          const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'image';
          const webpFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          const savings = Math.max(0, Math.round(((file.size - webpFile.size) / file.size) * 100));

          resolve({
            file: webpFile,
            previewUrl: URL.createObjectURL(webpFile),
            originalSize: file.size,
            optimizedSize: webpFile.size,
            savingsPercent: savings,
          });
        },
        'image/webp',
        quality
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        file,
        previewUrl: URL.createObjectURL(file),
        originalSize: file.size,
        optimizedSize: file.size,
        savingsPercent: 0,
      });
    };

    image.src = objectUrl;
  });
};

/**
 * Optimizes an image URL on-the-fly:
 * - Cloudinary: Injects f_auto,q_auto:good,w_...,c_limit for automatic WebP/AVIF delivery and responsive sizing.
 * - Unsplash: Injects auto=format&q=75&w=...
 *
 * @param {string} url - Original image URL
 * @param {Object} options - Options
 * @param {number} [options.width=800] - Desired width
 * @param {string} [options.quality='auto:good'] - Cloudinary quality mode
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, { width = 1000, quality = 'auto:best' } = {}) => {
  if (!url || typeof url !== 'string') return url;

  // Cloudinary image URL transformation
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    // If it already has transformation params after /upload/, leave as is
    if (/\/upload\/(?:[a-z]_[^/]+,?)+\//.test(url)) {
      return url;
    }
    const transform = `f_auto,q_${quality},w_${width},c_limit`;
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  // Unsplash image optimization
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
