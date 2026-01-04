import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "../authentication/useUser.js";
import {
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeFromCart as removeFromCartApi,
  clearCart as clearCartApi,
  getCart,
} from "../../services/apiCart";
import { useCartSync } from "./useCartSync.js";
import {
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
  selectCartItems,
} from "./slice";
import { retryWithBackoff, trackError } from "./errorHandling.js";

export function useUnifiedCart() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const isAuthenticated = !!user;
  const localCartItems = useSelector(selectCartItems);
  const { syncCart, isSyncing } = useCartSync();

  // Prevent duplicate sync operations when hook is used in multiple components
  const syncRef = useRef({
    hasSyncedOnLogin: false,
    hasMergedOnLogout: false,
    lastAuthState: isAuthenticated,
    lastLocalItemsCount: localCartItems.length,
    lastServerItemsCount: 0,
  });

  // Operation queue for rapid successive actions
  const operationQueue = useRef([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [queueSignal, setQueueSignal] = useState(0);

  // Optimistic update states
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map());
  // Offline detection and failed operations
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const failedOperationsQueue = useRef([]);
  const [operationHistory, setOperationHistory] = useState([]);
  const [currentErrors, setCurrentErrors] = useState(new Map());

  // Process failed operations when back online
  const processFailedOperations = useCallback(async () => {
    if (failedOperationsQueue.current.length > 0 && isOnline) {
      const operations = [...failedOperationsQueue.current];
      failedOperationsQueue.current = [];

      for (const operation of operations) {
        try {
          await operation.fn();
          // Remove from errors if successful
          setCurrentErrors((prev) => {
            const next = new Map(prev);
            next.delete(operation.id);
            return next;
          });
          toast.success("Operation completed successfully");
        } catch (error) {
          // Re-queue if still failing
          failedOperationsQueue.current.push(operation);
          trackError(error, operation.type, { operationId: operation.id });
        }
      }
    }
  }, [isOnline]);

  // Process operation queue
  useEffect(() => {
    const processQueue = async () => {
      if (operationQueue.current.length > 0 && !isProcessingQueue) {
        setIsProcessingQueue(true);
        const operation = operationQueue.current.shift();
        try {
          await operation();
        } catch (error) {
          console.error("Operation failed:", error);
        } finally {
          setIsProcessingQueue(false);
        }
      }
    };
    processQueue();
  }, [queueSignal, isProcessingQueue]);

  // Function to add operations to queue
  const queueOperation = useCallback((operation) => {
    operationQueue.current.push(operation);
    setQueueSignal((prev) => prev + 1);
  }, []);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process failed operations when back online
      processFailedOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [processFailedOperations]);

  // Undo operation
  const undoOperation = useCallback(
    async (operationId) => {
      const operation = operationHistory.find((op) => op.id === operationId);
      if (!operation || !operation.undo) return;

      try {
        await operation.undo();
        setOperationHistory((prev) =>
          prev.filter((op) => op.id !== operationId),
        );
        toast.success("Operation undone");
      } catch (error) {
        console.error("Undo failed:", error);
        toast.error("Failed to undo operation");
      }
    },
    [operationHistory],
  );
  // Fetch server cart if authenticated
  const { data: serverCart, isLoading: isServerLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter due to cart volatility)
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  console.log(serverCart);

  // Add to cart mutation with optimistic updates
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity, selected_variants = [] }) =>
      retryWithBackoff(() =>
        addToCartApi(productId, quantity, selected_variants),
      ),
    onMutate: async ({ productId, quantity, selected_variants = [] }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(["cart"]);

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistically update the cache
      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        const newItem = {
          id: `temp-${productId}-${Date.now()}`,
          product_id: productId,
          quantity,
          selected_variants,
          price: 0, // Will be updated from server
          image: "",
          name: "",
        };
        return {
          ...old,
          data: {
            ...old.data,
            items: [...(old.data?.items || []), newItem],
          },
        };
      });

      // Track optimistic update
      const optimisticId = `add-${productId}-${Date.now()}`;
      setOptimisticUpdates((prev) =>
        new Map(prev).set(optimisticId, { type: "add", productId, quantity }),
      );

      return { previousCart, optimisticId };
    },
    onSuccess: (data, variables, context) => {
      // Clear optimistic update tracking
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      toast.success("Added to cart");
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.refetchQueries({ queryKey: ["cart"] });
    },
  });

  // Update cart item mutation with optimistic updates
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItemApi(itemId, quantity),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries(["cart"]);
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items:
              old.data?.items?.map((item) =>
                item.id === itemId ? { ...item, quantity } : item,
              ) || [],
          },
        };
      });

      const optimisticId = `update-${itemId}-${Date.now()}`;
      setOptimisticUpdates((prev) =>
        new Map(prev).set(optimisticId, { type: "update", itemId, quantity }),
      );

      return { previousCart, optimisticId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      toast.success("Quantity updated");
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      console.error("Error updating cart item:", error);
      toast.error("Failed to update cart item");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.refetchQueries({ queryKey: ["cart"] });
    },
  });

  // Remove from cart mutation with optimistic updates
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId) => removeFromCartApi(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries(["cart"]);
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: old.data?.items?.filter((item) => item.id !== itemId) || [],
          },
        };
      });

      const optimisticId = `remove-${itemId}-${Date.now()}`;
      setOptimisticUpdates((prev) =>
        new Map(prev).set(optimisticId, { type: "remove", itemId }),
      );

      return { previousCart, optimisticId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      toast.success("Item removed from cart");
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.refetchQueries({ queryKey: ["cart"] });
    },
  });

  // Clear cart mutation with optimistic updates
  const clearCartMutation = useMutation({
    mutationFn: () => clearCartApi(),
    onMutate: async () => {
      await queryClient.cancelQueries(["cart"]);
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            items: [],
          },
        };
      });

      const optimisticId = `clear-${Date.now()}`;
      setOptimisticUpdates((prev) =>
        new Map(prev).set(optimisticId, { type: "clear" }),
      );

      return { previousCart, optimisticId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      toast.success("Cart cleared");
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      if (context?.optimisticId) {
        setOptimisticUpdates((prev) => {
          const next = new Map(prev);
          next.delete(context.optimisticId);
          return next;
        });
      }
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      await queryClient.refetchQueries({ queryKey: ["cart"] });
    },
  });

  // State reconciliation on authentication changes - prevent duplicate syncs
  useEffect(() => {
    const authChanged = isAuthenticated !== syncRef.current.lastAuthState;

    if (!authChanged) {
      syncRef.current.lastAuthState = isAuthenticated;
      return;
    }

    // Prevent concurrent syncs
    if (syncRef.current.isSyncInProgress) {
      console.log("Sync already in progress, skipping...");
      return;
    }

    const performAuthSync = async () => {
      syncRef.current.isSyncInProgress = true;

      try {
        if (
          isAuthenticated &&
          localCartItems.length > 0 &&
          !syncRef.current.hasSyncedOnLogin
        ) {
          // LOGIN FLOW: Sync local cart to server
          console.log("🔄 Login detected: Syncing local cart to server...");

          syncRef.current.hasSyncedOnLogin = true;
          syncRef.current.hasMergedOnLogout = false;

          try {
            // Perform sync
            const syncResult = await syncCart(localCartItems);
            console.log("✅ Cart sync successful:", syncResult);

            // CRITICAL FIX: Clear both Redux and localStorage
            dispatch(clearCartAction());
            localStorage.removeItem("cart"); // ← THE KEY FIX

            // Invalidate and refetch server cart
            await queryClient.invalidateQueries(["cart"]);
            await queryClient.invalidateQueries(["cartSummary"]);
            await queryClient.refetchQueries(["cart"]);

            toast.success(`Cart synced! ${localCartItems.length} items merged.`);
          } catch (error) {
            console.error("❌ Cart sync failed:", error);
            syncRef.current.hasSyncedOnLogin = false; // Allow retry
            toast.error("Failed to sync cart. Please try again.");
          }
        }
      } finally {
        syncRef.current.lastAuthState = isAuthenticated;
        syncRef.current.isSyncInProgress = false;
      }
    };

    performAuthSync();
  }, [
    isAuthenticated,
    localCartItems,
    serverCart,
    dispatch,
    queryClient,
    syncCart,
  ]);
  // Determine current cart items based on auth state
  const cartItems = useMemo(() => {
    if (isAuthenticated) {
      return (serverCart?.data?.items || []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        quantity: item.quantity,
        price: parseFloat(item.price || 0),
        name: item.product?.name || "Unknown Product",
        thumbnail: item.product?.thumbnail || "/default-product.jpg",
        color: item.selected_variants?.find((v) => v.name === "Color")?.value,
        size: item.selected_variants?.find((v) => v.name === "Size")?.value,
        selected_variants: item.selected_variants || [],
        total_price: item.total_price,
      }));
    }
    return localCartItems;
  }, [isAuthenticated, serverCart?.data?.items, localCartItems]);

  // Calculate cart count and total
  const cartCount = useMemo(() => {
    console.log("cart count", serverCart?.data?.items.length);
    console.log("serverCart", serverCart?.data);
    console.log("serverCart items", serverCart?.data?.items);
    console.log("localCartItems", localCartItems.length);
    return serverCart?.data?.items.length || localCartItems.length;
  }, [serverCart?.data?.items.length, localCartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Unified add to cart handler with rollback for unauthenticated users
  const addToCart = useCallback(
    (productId, quantity = 1, productData) => {
      if (isAuthenticated) {
        queueOperation(() =>
          addToCartMutation.mutateAsync({
            productId,
            quantity,
            selected_variants: productData?.selected_variants || [],
          }),
        );
      } else {
        // For unauthenticated users, dispatch Redux action to ensure localStorage persistence
        const newItem = {
          id: productData?.id || `${productId}-${Date.now()}`,
          productId,
          quantity,
          price: productData?.price || productData?.originalPrice,
          newPrice: productData?.newPrice,
          additionalCost: productData?.additionalCost || 0,
          // Handle various image property names
          image: productData?.image || productData?.thumbnail || productData?.images?.[0] || "",
          thumbnail: productData?.thumbnail || productData?.image || "",
          name: productData?.name,
          color: productData?.color,
          size: productData?.size,
          selected_variants: productData?.selected_variants || [],
          addedAt: new Date().toISOString(),
        };

        dispatch(addToCartAction(newItem));
        toast.success("Added to cart");
      }
    },
    [isAuthenticated, dispatch, addToCartMutation, queueOperation],
  );

  // Unified remove from cart handler
  const removeFromCart = useCallback(
    (itemId) => {
      if (isAuthenticated) {
        queueOperation(() => removeFromCartMutation.mutateAsync(itemId));
      } else {
        dispatch(removeFromCartAction({ id: itemId }));
        toast.success("Item removed from cart");
        // Local operations assumed to succeed
      }
    },
    [isAuthenticated, dispatch, removeFromCartMutation, queueOperation],
  );

  // Unified update quantity handler
  const updateQuantity = useCallback(
    (itemId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(itemId);
        return;
      }

      if (isAuthenticated) {
        queueOperation(() =>
          updateCartItemMutation.mutateAsync({ itemId, quantity }),
        );
      } else {
        dispatch(updateCartItemAction({ itemId, quantity }));
        toast.success("Quantity updated");
        // Local operations assumed to succeed
      }
    },
    [
      isAuthenticated,
      dispatch,
      updateCartItemMutation,
      removeFromCart,
      queueOperation,
    ],
  );
  // Unified clear cart handler
  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      queueOperation(() => clearCartMutation.mutateAsync());
    } else {
      dispatch(clearCartAction());
      toast.success("Cart cleared");
      // Local operations assumed to succeed
    }
  }, [isAuthenticated, dispatch, clearCartMutation, queueOperation]);

  // Reset sync state (useful for testing or manual sync)
  const resetSyncState = useCallback(() => {
    syncRef.current = {
      hasSyncedOnLogin: false,
      hasMergedOnLogout: false,
      lastAuthState: isAuthenticated,
      lastLocalItemsCount: localCartItems.length,
      lastServerItemsCount: 0,
    };
  }, [isAuthenticated, localCartItems.length]);

  return {
    // State
    cartItems,
    cartCount,
    cartTotal,
    isLoading: isAuthenticated ? isServerLoading : false,
    isSyncing,

    // Operations
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,

    // Loading states for operations
    isAdding: addToCartMutation.isLoading,
    isUpdating: updateCartItemMutation.isLoading,
    isRemoving: removeFromCartMutation.isLoading,
    isClearing: clearCartMutation.isLoading,

    // Optimistic update states
    optimisticUpdates,
    // Enhanced error handling states
    isOnline,
    currentErrors,
    operationHistory,
    undoOperation,
    isProcessingQueue,

    // Sync management
    resetSyncState,
  };
}
