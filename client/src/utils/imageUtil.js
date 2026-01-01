/**
 * Utility functions for handling image URLs
 */

/**
 * Converts a relative image path to an absolute URL
 * @param {string} path - The relative path to the image (e.g., "/products/image.jpg" or "/uploads/thumbnail.jpg")
 * @returns {string} The absolute URL to the image
 */
export function getImageUrl(path) {
  try {
    // Add debugging logs
    console.log('[getImageUrl] Input path:', path);
    console.log('[getImageUrl] VITE_DOMAIN_URL:', import.meta.env.VITE_DOMAIN_URL);
    
    // Ensure 'path' is a string. If not, convert it to an empty string or handle as appropriate.
    if (typeof path !== 'string') {
      console.warn('getImageUrl received non-string path:', path);
      path = '';
    }

    // Trim whitespace and handle empty paths
    path = path?.trim();
    if (!path) {
      console.warn('getImageUrl received empty or null path, using fallback image');
      // Return a random image from lorem picsum if path is empty or was originally null/undefined
      return `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`;
    }

    // If the path is already absolute, return it as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('[getImageUrl] Path is already absolute, returning as-is:', path);
      return path;
    }

    // Ensure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Get the domain URL from environment variables
    const domainUrl = import.meta.env.VITE_DOMAIN_URL;

    if (!domainUrl) {
      console.error('VITE_DOMAIN_URL is not defined in environment variables, using fallback image');
      // Fallback to a random placeholder image
      return `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`;
    }

    // Combine domain URL with the normalized path
    const fullUrl = `${domainUrl}${normalizedPath}`;
    console.log('[getImageUrl] Generated URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error in getImageUrl:', error);
    // Return a fallback image in case of any unexpected errors
    return `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`;
  }
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