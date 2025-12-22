import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../../../services/apiAdminProduct.js";
import toast from "react-hot-toast";

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: deleteProduct,

        // 🔥 Optimistically update UI BEFORE server response
        onMutate: async (productId) => {
            await queryClient.cancelQueries({ queryKey: ["adminProduct"] });

            // Get all cached adminProduct queries
            const previousProducts = queryClient.getQueriesData({ queryKey: ["adminProduct"], exact: false });

            // Optimistically update all cached pages
            queryClient.setQueriesData({ queryKey: ["adminProduct"] }, (old) => {
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: old.data.filter((p) => p.id !== productId),
                    total: Math.max(0, old.total - 1),
                    count: Math.max(0, old.count - 1),
                };
            });

            return { previousProducts };
        },

        // 🔥 If backend fails → rollback UI
        onError: (error, productId, context) => {
            // Rollback to previous data
            if (context?.previousProducts) {
                context.previousProducts.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },

        // 🔥 On successful delete
        onSuccess: () => {
            // Success toast handled by component
        },

        // 🔥 After everything, ensure the list and product detail are fresh
        onSettled: (data, error, productId) => {
            queryClient.invalidateQueries({ queryKey: ["adminProduct"] });
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
        },
    });

    return {
        deleteProduct: mutation.mutate,
        deleteProductAsync: mutation.mutateAsync,
        isDeleting: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
    };
}
