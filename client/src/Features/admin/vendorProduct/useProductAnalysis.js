import { useQuery } from "@tanstack/react-query";
import { getAdminProductAnalysis } from "../../../services/apiAdminProduct.js";

export function useProductAnalysis(productId) {
    const {
        data: productAnalysis,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["admin-product-analysis", productId],
        queryFn: () => getAdminProductAnalysis(productId),
        enabled: !!productId && productId !== 'undefined', // Only run query if productId is valid
    });

    console.log("Admin product analysis", productAnalysis);

    return {
        productAnalysis: productAnalysis || {}, // ✅ default to object
        isLoading,
        isError,
        error,
    };
}