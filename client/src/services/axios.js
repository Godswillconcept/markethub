import axios from "axios";

/**
 * Enhanced Axios Configuration for Stylay Client
 * Automatically handles different environments and ngrok tunneling
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
    // return 'https://stylay.cleverapps.io';
    return "https://unflaking-actionable-man.ngrok-free.dev";
  }

  return "http://localhost:5000";
};

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
 * Request Interceptor
 * Adds authentication token and handles ngrok-specific headers
 */
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
 * Handles errors, token refresh, and automatic redirects
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

    // Handle 401 Unauthorized - Token Refresh
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
      console.log("[Axios] 401 detected, attempting token refresh...");

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Attempt to refresh the token
        const response = await axios.post(
          `${getApiUrl()}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
          },
        );

        const { token, refreshToken: newRefreshToken } = response.data;

        // Save new tokens
        localStorage.setItem("token", token);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update the authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        console.log(
          "[Axios] ✅ Token refreshed successfully, retrying request",
        );

        return api(originalRequest);
      } catch (refreshError) {
        // Token refresh failed, clear auth and redirect to login
        console.error("[Axios] ❌ Token refresh failed:", refreshError.message);

        // Clear all auth data
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Only redirect if not already on auth page
        const authPages = [
          "/login",
          "/auth/login",
          "/register",
          "/auth/register",
        ];
        if (!authPages.includes(currentPath)) {
          console.log("[Axios] Redirecting to login...");
          window.location.href = "/login";
        }

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
