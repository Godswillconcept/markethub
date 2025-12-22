import { useQuery } from "@tanstack/react-query";
import { getTrendingProducts } from "../../services/apiProduct.js";

export function useTrendingProducts() {
    const { data: trendingProducts, isLoading, error } = useQuery({
        queryKey: ["trendingProducts"],
        queryFn: () => getTrendingProducts(),
    });

    return { trendingProducts: trendingProducts?.data || [], isLoading, error };
}