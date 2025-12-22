import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../../services/apiAdmin.js";

export function useStats() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["metrics"],
        queryFn: getStats,
        retry: false,
    });

    return { stats: data || {}, isLoading, error };
}