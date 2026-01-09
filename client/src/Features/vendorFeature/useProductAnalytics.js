import { useQuery } from "@tanstack/react-query";
import { getVendorProductByOverview } from "../../services/apiVendors.js";

export function useProductAnalytics(productId) {
    const {
        data: productAnalysis,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["product-analytics", productId],
        queryFn: () => getVendorProductByOverview(productId),
        enabled: !!productId && productId !== 'undefined', // Only run query if productId is valid
    });

    return {
        productAnalysis: productAnalysis || {}, // ✅ default to object
        isLoading,
        isError,
        error,
    };
}
