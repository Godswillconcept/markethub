import { useQuery } from "@tanstack/react-query";
import { getSalesStats } from "../../../services/apiAdmin.js";


export function useSalesStats() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["stats"],
        queryFn: getSalesStats,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });


    return { saleStats: data || {}, isLoading, error };
}