import { getCartSummary } from "../../services/apiCart.js";
import { useQuery } from "@tanstack/react-query";

export function useCartSummary() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["cartSummary"],
        queryFn: () => getCartSummary(),
        staleTime: 2 * 60 * 1000, // 2 minutes
        cacheTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
    return { data, isLoading, error };
}