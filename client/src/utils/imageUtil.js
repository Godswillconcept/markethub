/**
 * Utility functions for handling image URLs
 */

/**
 * Converts a relative image path to an absolute URL
 * @param {string} path - The relative path to the image (e.g., "/products/image.jpg" or "/uploads/thumbnail.jpg")
 * @returns {string} The absolute URL to the image
 */
export function getImageUrl(path) {
  // Ensure 'path' is a string. If not, convert it to an empty string or handle as appropriate.
  if (typeof path !== 'string') {
    // Option 1: Treat non-string paths as invalid/empty, leading to the random image fallback
    path = ''; 
    // Option 2: If you want to explicitly throw an error for unexpected types:
    // throw new Error('getImageUrl expects a string path, but received ' + typeof path);
  }

  if (!path) {
    // Return a random image from lorem picsum if path is empty or was originally null/undefined
    const randomImage = `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`;
    return randomImage;
  }

  // If the path is already absolute, return it as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Ensure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Get the domain URL from environment variables
  const domainUrl = import.meta.env.VITE_DOMAIN_URL;

  if (!domainUrl) {
    console.warn('VITE_DOMAIN_URL is not defined in environment variables');
    return path;
  }

  // Combine domain URL with the normalized path
  return `${domainUrl}${normalizedPath}`;
}


/**
 * Converts a relative thumbnail path to an absolute URL
 * @param {string} path - The relative path to the thumbnail
 * @returns {string} The absolute URL to the thumbnail
 */
export function getThumbnailUrl(path) {
  return getImageUrl(path);
}

/**
 * Converts multiple image paths to absolute URLs
 * @param {string[]} paths - Array of relative image paths
 * @returns {string[]} Array of absolute image URLs
 */
export function getImageUrls(paths) {
  if (!Array.isArray(paths)) {
    return [];
  }

  return paths.map(getImageUrl);
}