// hooks/useLogin.js
import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "../../services/apiAuth.js";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext.jsx";

export default function useLogin() {
  const { setAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (response) => {
      console.log("✅ Login response:", response);

      // Use setAuth from AuthContext for reactive state updates
      setAuth({
        token: response.token,
        session_id: response.session?.id,
        refreshToken: response.refreshToken,
        user: response.data
      });

      // 🔄 CRITICAL FIX: Remove immediate cart clearing - integrate cart sync instead
      // localStorage.removeItem("cart"); // REMOVED: This was destroying cart data

      // Trigger cart synchronization after successful login
      if (typeof window !== 'undefined') {
        // Import cart sync manager dynamically to avoid circular dependencies
        import("../../managers/CartSyncManager.js").then(({ cartSyncManager }) => {
          // Check if there's local cart data to sync
          const localCart = cartSyncManager.getLocalCart();

          if (localCart.items && localCart.items.length > 0) {
            console.log(`Found ${localCart.items.length} items in local cart, starting sync...`);

            // Show sync progress notification
            toast.loading("Syncing your cart...", { id: "cart-sync" });

            // Trigger cart synchronization
            cartSyncManager.synchronizeCart()
              .then((syncResult) => {
                if (syncResult.success) {
                  console.log("Cart sync completed successfully:", syncResult);
                  toast.success(
                    `Cart synced! ${syncResult.syncedItems} items merged with server cart`,
                    { id: "cart-sync" }
                  );
                  // clear local cart data
                  localStorage.removeItem("cart");
                } else if (syncResult.error) {
                  console.warn("Cart sync failed:", syncResult.error);
                  toast.error(
                    `Cart sync failed: ${syncResult.error}`,
                    { id: "cart-sync" }
                  );
                }
              })
              .catch((syncError) => {
                console.error("Cart sync error:", syncError);
                toast.error(
                  "Failed to sync cart with server",
                  { id: "cart-sync" }
                );
              });
          } else {
            console.log("No local cart data to sync");
          }
        }).catch((importError) => {
          console.error("Failed to import cart sync manager:", importError);
        });
      }

      toast.success("Login successful");
    },
    onError: (error) => {
      console.error('❌ Login error:', error);
      
      // Handle different error types
      let errorMessage = 'Login failed';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Check for specific authentication errors
      if (error?.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error?.response?.status === 403) {
        errorMessage = "Account is not active. Please verify your email.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      toast.error(errorMessage);
    },
  });

  return {
    login: mutation.mutate, // Keep this as .mutate (NOT mutateAsync)
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

//   localStorage.setItem("token", data.token);
//   localStorage.setItem("user", JSON.stringify(data.user));
