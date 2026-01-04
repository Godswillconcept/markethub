import { useQuery } from "@tanstack/react-query";
import { getTopSellingItems } from "../../../services/apiAdmin.js";


export function useTopItem() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["top-item"],
        queryFn: getTopSellingItems,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });



    return { topItem: data || [], isLoading, error };
}