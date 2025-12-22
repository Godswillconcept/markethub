import { useQuery } from "@tanstack/react-query";
import { getSalesStats } from "../../../services/apiAdmin.js";


export function useSalesStats() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["stats"],
        queryFn: getSalesStats,
        retry: false,
    });


    return { saleStats: data || {}, isLoading, error };
}