import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { currentUser } from "../../services/apiAuth.js";
import { isTokenExpired } from "../../services/axios.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // State for auth artifacts to ensure reactivity
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [sessionId, setSessionId] = useState(() =>
    localStorage.getItem("session_id"),
  );
  const [sessionNonce, setSessionNonce] = useState(0);

  // Check if we have a complete authentication session
  const hasValidAuthSession = (currentToken, currentSessionId) => {
    const activeToken = currentToken || token;
    const activeSessionId = currentSessionId || sessionId;

    // If we have a token but no session activity, set it now
    if (activeToken && !localStorage.getItem("session_activity")) {
      console.log(
        "[AuthContext] Token exists but no session activity, setting it now",
      );
      localStorage.setItem("session_activity", Date.now().toString());
    }

    const valid = !!(activeToken && activeSessionId && !isTokenExpired());
    return valid;
  };

  // Derive session validity
  const isSessionValid = hasValidAuthSession();

  // Listen for cross-tab authentication events
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "auth_event") {
        try {
          const authEvent = JSON.parse(event.newValue);

          switch (authEvent.type) {
            case "token_refreshed":
              console.log(
                "[AuthContext] Token refreshed in another tab, updating local state",
              );
              setToken(localStorage.getItem("token"));
              queryClient.invalidateQueries({ queryKey: ["currentUser"] });
              setSessionNonce((n) => n + 1);
              break;

            case "logout":
              console.log(
                "[AuthContext] Logout detected in another tab, clearing user data",
              );
              setToken(null);
              setSessionId(null);
              queryClient.setQueryData(["currentUser"], null);
              queryClient.removeQueries(["currentUser"]);
              setSessionNonce((n) => n + 1);
              navigate("/login");
              break;
          }
        } catch (error) {
          console.error(
            "[AuthContext] Error processing cross-tab auth event:",
            error,
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [queryClient, navigate]);

  // Listen for token-refreshed custom event (same-tab sync)
  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      console.log("[AuthContext] Token refreshed event received in same tab", event.detail);
      
      // Update React state with new tokens
      if (event.detail.token) {
        setToken(event.detail.token);
      }
      
      // Update session ID if it was refreshed
      const newSessionId = localStorage.getItem("session_id");
      if (newSessionId) {
        setSessionId(newSessionId);
      }
      
      // Invalidate user query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      
      // Update session nonce to trigger re-renders
      setSessionNonce((n) => n + 1);
    };

    window.addEventListener("token-refreshed", handleTokenRefreshed);
    return () => window.removeEventListener("token-refreshed", handleTokenRefreshed);
  }, [queryClient]);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: currentUser,
    // Only enable query if we have a complete auth session
    enabled: hasValidAuthSession(),
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.isAuthError || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Handle Auth Errors - Avoid aggressive redirection here
  // Redirects should be handled by ProtectedRoute or specific user actions
  useEffect(() => {
    if (error?.isAuthError || error?.response?.status === 401) {
      console.log("[AuthContext] Authentication error detected:", {
        error: error?.message,
        status: error?.response?.status,
        path: window.location.pathname,
      });

      // Clean up local storage if explicitly unauthorized
      if (error?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("session_id");
        localStorage.removeItem("session_activity");

        setToken(null);
        setSessionId(null);
        queryClient.removeQueries(["currentUser"]);
        setSessionNonce((n) => n + 1);
      }
    }
  }, [error, queryClient]);

  // Handle explicitly failed login attempts (error 500s from our new strict controller)
  useEffect(() => {
    if (
      error &&
      error.response?.status === 500 &&
      error.message.includes("Could not create user session")
    ) {
      console.error(
        "[AuthContext] Critical Login Failure: Server failed to create session.",
      );
      // Optionally show a toast or alert here via a UI library if available
    }
  }, [error]);

  // Centralized login/auth update function
  const setAuth = (authData) => {
    if (authData.token) {
      localStorage.setItem("token", authData.token);
      setToken(authData.token);
    }

    if (authData.session_id || authData.session?.id) {
      const sId = authData.session_id || authData.session?.id;
      localStorage.setItem("session_id", sId);
      setSessionId(sId);
    } else {
      console.warn(
        "[AuthContext] UpdateAuth called but NO session_id provided. This may cause redirect loops.",
        authData,
      );
    }

    if (authData.refreshToken || authData.refresh_token) {
      localStorage.setItem(
        "refreshToken",
        authData.refreshToken || authData.refresh_token,
      );
    }

    localStorage.setItem("session_activity", Date.now().toString());

    if (authData.user || authData.data) {
      const userData = authData.user || authData.data;
      queryClient.setQueryData(["currentUser"], userData);
    }

    setSessionNonce((n) => n + 1);
  };

  // Force refresh user data function
  const forceRefreshUser = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("[AuthContext] Failed to refresh user data:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("session_id");
    localStorage.removeItem("session_activity");
    localStorage.removeItem("user");

    // Notify other tabs about logout
    window.localStorage.setItem(
      "auth_event",
      JSON.stringify({
        type: "logout",
        timestamp: Date.now(),
      }),
    );

    // Clear React Query cache
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    queryClient.removeQueries({ queryKey: ["cart"] });

    setToken(null);
    setSessionId(null);
    setSessionNonce((n) => n + 1);
    navigate("/");
  };

  // Derive authentication state
  // Handle both flat and nested user structures defensively
  const normalizedUser = user?.user || user;
  
  // isAuthenticated depends only on session validity, not on user data being loaded
  // This breaks the circular dependency where isAuthenticated waited for user data
  const isAuthenticated = isSessionValid;
  
  // isUserLoaded tracks when user data is available
  const isUserLoaded = !!(normalizedUser && normalizedUser.id);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    isSessionValid,
    isUserLoaded,
    forceRefreshUser,
    setAuth,
    logout,
  };

  // Debug authentication state changes
  useEffect(() => {
    console.log("[AuthContext] Authentication state:", {
      hasUser: !!user,
      isAuthenticated,
      isSessionValid,
      isUserLoaded,
      isLoading,
      hasError: !!error,
      nonce: sessionNonce,
    });
  }, [user, isAuthenticated, isSessionValid, isUserLoaded, isLoading, error, sessionNonce]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
