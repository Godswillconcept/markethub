import { useQuery } from "@tanstack/react-query";
import { getTopSellingItems } from "../../../services/apiAdmin.js";


export function useTopItem({ year, month } = {}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["top-item", year, month],
        queryFn: () => getTopSellingItems({ year, month }),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });



    return { topItem: data || [], isLoading, error };
}