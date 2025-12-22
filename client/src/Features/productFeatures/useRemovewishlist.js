import { removeFromWishList as removeFromWishlistApi } from "../../services/apiProduct.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useRemoveWishlist() {
    const queryClient = useQueryClient();

    const { mutate: removeFromWishlist, isLoading: isRemovingFromWishlist } = useMutation({
        mutationFn: removeFromWishlistApi,
        onSuccess: () => {
            toast.success('Product removed from wishlist successfully');
            // Invalidate and refetch the wishlist query
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        },
        onError: (error) => {
            console.error('Error removing from wishlist:', error);
            toast.error(error.message || 'Failed to remove product from wishlist');
        },
    });

    return {
        removeFromWishlist,
        isRemovingFromWishlist
    };
}