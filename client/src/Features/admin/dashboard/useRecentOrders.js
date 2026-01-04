import { useQuery } from "@tanstack/react-query";
import { recentOrders } from "../../../services/apiAdmin.js";

export function useRecentOrders() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["recent-orders"],
        queryFn: recentOrders,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return { recentOrders: data || [], isLoading, error };
}