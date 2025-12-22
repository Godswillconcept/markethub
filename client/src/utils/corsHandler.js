// CORS Error Handling Utility

/**
 * Detects if an error is related to CORS issues
 * @param {Error} error - The error object from axios or fetch
 * @returns {boolean} - True if the error is CORS-related
 */
export const isCORSError = (error) => {
  if (!error) return false;
  
  // Check for network errors that might be CORS-related
  if (error.code === 'ERR_NETWORK') return true;
  
  // Check error message for CORS indicators
  const corsIndicators = [
    'CORS',
    'cross-origin',
    'Access to XMLHttpRequest',
    'Access to fetch',
    'has been blocked by CORS policy',
    'No \'Access-Control-Allow-Origin\' header'
  ];
  
  const errorMessage = error.message || error.toString();
  return corsIndicators.some(indicator => 
    errorMessage.toLowerCase().includes(indicator.toLowerCase())
  );
};

/**
 * Provides user-friendly error messages for CORS issues
 * @param {Error} error - The original error
 * @returns {string} - User-friendly error message
 */
export const getCORSErrorMessage = (error) => {
  if (isCORSError(error)) {
    return 'Unable to connect to the server. This might be due to network restrictions or server configuration. Please try again later or contact support if the problem persists.';
  }
  
  return error.message || 'An unexpected error occurred';
};

/**
 * Checks if the current environment might have CORS issues
 * @returns {boolean} - True if running in an environment that might have CORS issues
 */
export const isCORSProneEnvironment = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // CORS issues are more likely in these scenarios:
  // 1. HTTPS to HTTP requests (mixed content)
  // 2. Different ports in development
  // 3. Ngrok or tunnel services
  
  return (
    hostname === 'localhost' || 
    hostname.includes('ngrok') || 
    hostname.includes('tunnel') ||
    (protocol === 'https:' && window.location.port !== '443')
  );
};

/**
 * Gets appropriate API base URL based on environment
 * @returns {string} - The appropriate API base URL
 */
export const getAppropriateApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isDev = import.meta.env.DEV;
  
  if (isDev && !envUrl.includes('ngrok')) {
    // In development, prefer localhost to avoid CORS issues
    return 'http://localhost:5000/api/v1';
  }
  
  return envUrl || 'http://localhost:5000/api/v1';
};

/**
 * Validates if an API response has proper CORS headers (client-side check)
 * Note: This is limited as CORS headers are not accessible via JavaScript for security reasons
 * @param {Response} response - Fetch API response object
 * @returns {boolean} - True if response appears to be from a valid CORS request
 */
export const validateCORSResponse = (response) => {
  // Note: We can't actually check CORS headers from JavaScript for security reasons
  // This is a placeholder for any client-side validation logic you might want to add
  return response && response.status >= 200 && response.status < 300;
};