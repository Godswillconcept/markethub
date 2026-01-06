import { useQuery } from "@tanstack/react-query";
import { getTopCategories } from "../../../services/apiAdmin.js";


export function useTopCategories({ year, month } = {}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['top-categories', year, month],
        queryFn: () => getTopCategories({ year, month }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });



    return { topCategories: data || [], isLoading, error };
}