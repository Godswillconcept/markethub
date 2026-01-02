import axios from "axios";

/**
 * Enhanced Axios Configuration for Stylay Client
 * Automatically handles different environments, ngrok tunneling, and improved token refresh
 */

// Get the API URL based on environment
const getApiUrl = () => {
  // First priority: Environment variable from Vite
  if (import.meta.env.VITE_API_URL) {
    console.log("debugging first", import.meta.env.VITE_API_URL);
    console.log("[Axios] Using VITE_API_URL:", import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Second priority: Detect if we're in production
  if (import.meta.env.PROD) {
    console.log("debugging second", import.meta.env.PROD);
    console.log("[Axios] Production mode detected, using relative API path for single-domain setup");
    // For single-domain production (server serves client), use relative URL
    return "/api/v1";
  }

  // Default: Development mode
  console.log("[Axios] Development mode, using localhost");
  return "http://localhost:5000/api/v1";
};

// Get the domain URL (for file uploads, etc.)
const getDomainUrl = () => {
  if (import.meta.env.VITE_DOMAIN_URL) {
    return import.meta.env.VITE_DOMAIN_URL;
  }
  console.log(import.meta.env.PROD);
  if (import.meta.env.PROD) {
    return window.location.origin;
  }

  return "http://localhost:5000";
};

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 1000; // 1 second base delay

// Create axios instance with dynamic configuration
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable credentials for CORS
  timeout: 30000, // 30 second timeout
});

// Log configuration on startup
console.log("[Axios Config]", {
  baseURL: api.defaults.baseURL,
  domainURL: getDomainUrl(),
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
});

/**
 * Process queued requests after token refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Refresh token with exponential backoff retry mechanism
 */
const refreshTokenWithRetry = async () => {
  if (isRefreshing) {
    return Promise.reject(new Error("Refresh already in progress"));
  }

  isRefreshing = true;

  const tryRefresh = async (attempt = 1) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const sessionId = localStorage.getItem("session_id");

      if (!refreshToken || !sessionId) {
        throw new Error("No refresh token or session ID available");
      }

      console.log(`[Axios] Attempting token refresh (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`);

      const response = await axios.post(
        `${getApiUrl()}/auth/refresh-token`,
        { 
          refresh_token: refreshToken,
          session_id: sessionId 
        },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          withCredentials: true,
        }
      );

      const { access, refresh } = response.data.data;

      // Save new tokens
      localStorage.setItem("token", access.token);
      if (refresh.token) {
        localStorage.setItem("refreshToken", refresh.token);
      }

      // Update session activity timestamp
      localStorage.setItem("session_activity", Date.now().toString());

      console.log("[Axios] ✅ Token refreshed successfully");
      
      // Notify other tabs about token refresh
      window.localStorage.setItem('auth_event', JSON.stringify({
        type: 'token_refreshed',
        timestamp: Date.now(),
        token: access.token
      }));

      return access.token;
    } catch (error) {
      console.error(`[Axios] ❌ Token refresh attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        // Exponential backoff: delay = base * 2^attempt
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`[Axios] Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return tryRefresh(attempt + 1);
      } else {
        // Max retries reached, clear auth and redirect
        console.error("[Axios] Max retry attempts reached, logging out...");
        
        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("session_id");
        localStorage.removeItem("session_activity");
        localStorage.removeItem("user");

        // Notify other tabs about logout
        window.localStorage.setItem('auth_event', JSON.stringify({
          type: 'logout',
          timestamp: Date.now()
        }));

        // Only redirect if not already on auth page
        const currentPath = window.location.pathname;
        const authPages = [
          "/login",
          "/auth/login",
          "/register",
          "/auth/register",
        ];
        
        if (!authPages.includes(currentPath)) {
          window.location.href = "/login";
        }

        throw new Error("Token refresh failed after maximum retry attempts");
      }
    }
  };

  return tryRefresh();
};

/**
 * Cross-tab synchronization for auth state
 */
const setupCrossTabSync = () => {
  // Listen for storage events from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'auth_event') {
      try {
        const authEvent = JSON.parse(event.newValue);
        
        switch (authEvent.type) {
          case 'token_refreshed':
            console.log('[Axios] Token refreshed in another tab, updating local state');
            if (authEvent.token) {
              localStorage.setItem("token", authEvent.token);
            }
            break;
            
          case 'logout':
            console.log('[Axios] Logout detected in another tab, cleaning up local state');
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("session_id");
            localStorage.removeItem("session_activity");
            localStorage.removeItem("user");
            
            // Redirect to login if not already there
            {
              const currentPath = window.location.pathname;
              const authPages = ["/login", "/auth/login", "/register", "/auth/register"];
              if (!authPages.includes(currentPath)) {
                window.location.href = "/login";
              }
            }
            break;
        }
      } catch (error) {
        console.error('[Axios] Error processing cross-tab auth event:', error);
      }
    }
  });
};

/**
 * Request Interceptor
 * Adds authentication token, session ID, and handles ngrok-specific headers
 */
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add session ID header if available
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      config.headers["X-Session-Id"] = sessionId;
    }

    // Add ngrok-specific header if using ngrok URL
    const baseURL = config.baseURL || api.defaults.baseURL;
    if (
      baseURL.includes("ngrok-free.dev") ||
      baseURL.includes("ngrok-free.app") ||
      baseURL.includes("ngrok.io") ||
      baseURL.includes("ngrok.app")
    ) {
      config.headers["ngrok-skip-browser-warning"] = "true";
      console.log("[Axios] Added ngrok bypass header");
    }

    // Update session activity timestamp on every request
    if (token) {
      localStorage.setItem("session_activity", Date.now().toString());
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("[Axios] Request Error:", error);
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles errors, token refresh with concurrent request handling, and automatic redirects
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(
        `[Axios] ✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const currentPath = window.location.pathname;

    // Handle Network/CORS errors
    if (error.code === "ERR_NETWORK" || !error.response) {
      console.error("[Axios] ❌ Network Error:", {
        message: error.message,
        code: error.code,
        baseURL: originalRequest?.baseURL,
        url: originalRequest?.url,
        method: originalRequest?.method,
      });

      // Check if it's a CORS error
      const isCorsError =
        error.message.includes("CORS") ||
        error.message.includes("Network Error") ||
        error.code === "ERR_NETWORK";

      if (isCorsError) {
        console.error("[Axios] 🚫 Possible CORS Issue Detected!");
        console.error("[Axios] Troubleshooting steps:");
        console.error("  1. Check if server is running");
        console.error(
          "  2. Verify CORS_ORIGIN in server .env includes:",
          window.location.origin,
        );
        console.error("  3. Check browser console for detailed CORS errors");
        console.error("  4. Verify API URL:", originalRequest?.baseURL);
      }

      // User-friendly error message
      const networkError = new Error(
        "Unable to connect to the server. Please check:\n" +
          "• Your internet connection\n" +
          "• Server is running\n" +
          "• API URL is correct: " +
          (originalRequest?.baseURL || "Unknown"),
      );
      networkError.isNetworkError = true;
      networkError.originalError = error;

      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - Token Refresh with concurrent request handling
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh on login/auth pages
      const authPages = [
        "/login",
        "/auth/login",
        "/register",
        "/auth/register",
      ];
      if (authPages.includes(currentPath)) {
        console.log("[Axios] 401 on auth page, not attempting refresh");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If refresh is already in progress, queue the request
      if (isRefreshing) {
        console.log("[Axios] Refresh in progress, queuing request");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      console.log("[Axios] 401 detected, attempting token refresh...");

      try {
        const newToken = await refreshTokenWithRetry();
        
        // Update the authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        console.log(
          "[Axios] ✅ Token refreshed successfully, retrying request",
        );

        // Process any queued requests
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        console.error("[Axios] ❌ Token refresh failed:", refreshError.message);
        
        // Process queued requests with the error
        processQueue(refreshError);

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - Permission Denied
    if (error.response?.status === 403) {
      console.error(
        "[Axios] ❌ 403 Forbidden:",
        error.response.data?.message || "Access denied",
      );

      const errorMessage =
        error.response.data?.message ||
        "You do not have permission to access this resource";

      return Promise.reject(new Error(errorMessage));
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("[Axios] ❌ 404 Not Found:", originalRequest?.url);

      const errorMessage =
        error.response.data?.message || "The requested resource was not found";

      return Promise.reject(new Error(errorMessage));
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error("[Axios] ❌ Server Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });

      const errorMessage = "Server error. Please try again later.";
      return Promise.reject(new Error(errorMessage));
    }

    // Log all errors in development
    if (import.meta.env.DEV) {
      console.error("[Axios] Error Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response?.data,
        headers: originalRequest?.headers,
      });
    }

    return Promise.reject(error);
  },
);

// Initialize cross-tab synchronization
if (typeof window !== 'undefined') {
  setupCrossTabSync();
}

// Export the configured axios instance as default
export default api;

// Export utility functions
export const getBaseUrl = getApiUrl;
export const getDomain = getDomainUrl;

/**
 * Update API URL dynamically (if needed)
 */
export const updateApiUrl = (newUrl) => {
  api.defaults.baseURL = newUrl;
  console.log("[Axios] Base URL updated to:", newUrl);
};

/**
 * Manual token refresh function for components that might need it
 */
export const forceTokenRefresh = async () => {
  if (!isRefreshing) {
    try {
      const newToken = await refreshTokenWithRetry();
      // Process any queued requests
      processQueue(null, newToken);
      return newToken;
    } catch (error) {
      processQueue(error);
      throw error;
    }
  }
};

/**
 * Check if token is expired based on session activity
 */
export const isTokenExpired = () => {
  const sessionActivity = localStorage.getItem("session_activity");
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.log('[isTokenExpired] No token found');
    return true;
  }
  
  // Check if we have a refresh token (which is long-lived)
  const refreshToken = localStorage.getItem("refreshToken");
  
  // If we have a refresh token, trust the API to handle 401s via interceptors
  // instead of prematurely expiring the session on the client side
  if (refreshToken) {
    console.log('[isTokenExpired] Refresh token exists, deferring to API validation');
    return false;
  }
  
  if (!sessionActivity) {
    console.log('[isTokenExpired] No session activity found');
    return true;
  }
  
  // Consider token expired if no activity for 30 minutes
  const THIRTY_MINUTES = 30 * 60 * 1000;
  const isExpired = (Date.now() - parseInt(sessionActivity)) > THIRTY_MINUTES;
  
  console.log('[isTokenExpired] Token check:', {
    sessionActivity,
    timeSinceActivity: Date.now() - parseInt(sessionActivity),
    thirtyMinutes: THIRTY_MINUTES,
    isExpired
  });
  
  return isExpired;
};
