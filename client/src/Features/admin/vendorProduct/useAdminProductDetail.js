import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../../../services/apiProduct.js";

export function useAdminProductDetail(productId, mode) {
    const {
        data: productData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["admin-product-detail", productId],
        queryFn: () => getProductById(productId),
        enabled: mode === "edit" && !!productId,
        staleTime: 1000 * 60, // 1 minute — prevents instant refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    console.log("Admin product detail", productData);

    return {
        productData: productData?.data || {}, // ✅ default to object
        isLoading,
        isError,
        error,
    };
}

// New hook for viewing product details by ID
export function useAdminProductView(productId) {
    const {
        data: productData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["admin-product-view", productId],
        queryFn: () => getProductById(productId),
        enabled: !!productId,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: false,
    });

    return {
        product: productData?.data || {},
        isLoading,
        isError,
        error,
    };
}
