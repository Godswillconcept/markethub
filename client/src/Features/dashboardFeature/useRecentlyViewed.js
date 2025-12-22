import { useQuery } from "@tanstack/react-query";
import { getRecentlyViewedProducts } from "../../services/apiProduct.js";

export function useRecentlyViewed() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["recentlyViewed"],
        queryFn: getRecentlyViewedProducts,
    })
    console.log("recently viewed", data);

    return { recentlyViewed: data, isLoading, isError }
}