import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentUser } from "../../services/apiAuth.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

/**
 * Safely parse JSON from localStorage
 */
function safeParseLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Failed to parse localStorage key "${key}":`, error);
    localStorage.removeItem(key);
    return null;
  }
}

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
  const token = localStorage.getItem("token");

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: currentUser,
    // If we have a token, try to load user from local storage first to prevent flash
    initialData: () => (token ? safeParseLocalStorage("user") : null),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, 
  });

  // Sync valid API data to localStorage
  useEffect(() => {
    if (user && !error) {
      safeSetLocalStorage("user", user);
    }
  }, [user, error]);

  // Handle Auth Errors
  useEffect(() => {
    if (error?.isAuthError) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      queryClient.removeQueries(["user"]);
      toast.error("Your session has expired. Please log in again.");
      navigate("/login");
    }
  }, [error, queryClient, navigate]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
}
