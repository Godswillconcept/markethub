import { useQuery } from "@tanstack/react-query";
import { getTrendingProducts } from "../../services/apiProduct.js";

export function useTrendingProducts() {
    const { data: trendingProducts, isLoading, error } = useQuery({
        queryKey: ["trendingProducts"],
        queryFn: () => getTrendingProducts(),
        staleTime: 5 * 60 * 1000, // 5 minutes - trending data updates moderately
        cacheTime: 15 * 60 * 1000, // 15 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return { trendingProducts: trendingProducts?.data || [], isLoading, error };
}