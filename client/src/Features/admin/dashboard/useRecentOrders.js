import { useQuery } from "@tanstack/react-query";
import { recentOrders } from "../../../services/apiAdmin.js";

export function useRecentOrders() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["recent-orders"],
        queryFn: recentOrders,
        retry: false,
    });

    return { recentOrders: data || [], isLoading, error };
}