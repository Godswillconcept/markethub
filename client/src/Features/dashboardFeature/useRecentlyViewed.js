import { useQuery } from "@tanstack/react-query";
import { getRecentlyViewedProducts } from "../../services/apiProduct.js";

export function useRecentlyViewed() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["recentlyViewed"],
        queryFn: getRecentlyViewedProducts,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })
    console.log("recently viewed", data);

    return { recentlyViewed: data, isLoading, isError }
}