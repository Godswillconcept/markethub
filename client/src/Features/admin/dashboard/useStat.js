import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../../services/apiAdmin.js";

export function useStats({ year, month } = {}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["metrics", year, month],
        queryFn: () => getStats({ year, month }),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        cacheTime: 10 * 60 * 1000, // 10 minutes - cache persists
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on component remount if data is fresh
    });

    return { stats: data || {}, isLoading, error };
}