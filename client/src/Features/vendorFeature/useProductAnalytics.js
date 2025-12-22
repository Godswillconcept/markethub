import { useQuery } from "@tanstack/react-query";
import { getProductAnalytics } from "../../services/apiVendors.js";

export function useProductAnalytics(productId) {
    const { data, isLoading, } = useQuery({
        queryKey: ["product-analytics", productId],
        queryFn: () => getProductAnalytics(productId),
    });

    return {
        analytics: data?.data || {},
        isLoading,

    };
}
