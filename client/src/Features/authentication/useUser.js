import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUser } from "../../services/apiAuth.js";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { isTokenExpired } from "../../services/axios.js";

/**
 * Safely set data to localStorage
 */
function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to set localStorage key "${key}":`, error);
  }
}

export function useUser() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSessionValid, setIsSessionValid] = useState(false);

  const token = localStorage.getItem("token");
  const sessionId = localStorage.getItem("session_id");

  // Check if we have a complete authentication session
  const hasValidAuthSession = () => {
    return !!(token && sessionId && !isTokenExpired());
  };

  // Set initial session validity
  useEffect(() => {
    setIsSessionValid(hasValidAuthSession());
  }, [token, sessionId]);

  // Listen for cross-tab authentication events
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'auth_event') {
        try {
          const authEvent = JSON.parse(event.newValue);

          switch (authEvent.type) {
            case 'token_refreshed':
              console.log('[useUser] Token refreshed in another tab, invalidating user query');
              queryClient.invalidateQueries({ queryKey: ["currentUser"] });
              setIsSessionValid(true);
              break;

            case 'logout':
              console.log('[useUser] Logout detected in another tab, clearing user data');
              queryClient.setQueryData(["currentUser"], null);
              queryClient.removeQueries(["currentUser"]);
              setIsSessionValid(false);
              navigate("/login");
              break;
          }
        } catch (error) {
          console.error('[useUser] Error processing cross-tab auth event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient, navigate]);

  const { data: user, isLoading, error, refetch } = useQuery({
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
    // Don't use initialData to prevent stale data issues
    initialData: undefined,
  });

  // Sync valid API data to localStorage
  useEffect(() => {
    if (user && !error) {
      safeSetLocalStorage("user", user);
    }
  }, [user, error]);

  // Handle Auth Errors
  useEffect(() => {
    if (error?.isAuthError || error?.response?.status === 401) {
      console.log('[useUser] Authentication error detected, cleaning up');
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("session_id");
      localStorage.removeItem("session_activity");
      queryClient.removeQueries(["currentUser"]);
      setIsSessionValid(false);
      toast.error("Your session has expired. Please log in again.");
      navigate("/login");
    }
  }, [error, queryClient, navigate]);

  // Force refresh user data function
  const forceRefreshUser = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('[useUser] Failed to refresh user data:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && isSessionValid,
    isSessionValid,
    forceRefreshUser,
  };
}
