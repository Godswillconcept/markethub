import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { syncCart } from '../../services/apiCart.js';

export function useCartSync() {
  const queryClient = useQueryClient();

  const syncCartMutation = useMutation({
    mutationFn: (localItems) => syncCart(localItems),
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3 && error?.response?.status >= 500) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      queryClient.setQueryData(['cart'], data);
      toast.success('Cart synced successfully');
    },
    onError: (error) => {
      console.error('Error syncing cart:', error);
      toast.error('Failed to sync cart');
    },
  });

  return {
    syncCart: syncCartMutation.mutateAsync,
    isSyncing: syncCartMutation.isLoading,
    syncError: syncCartMutation.error,
  };
}