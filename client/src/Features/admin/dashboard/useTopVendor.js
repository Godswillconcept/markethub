import { useQuery } from "@tanstack/react-query";
import { getTopSellingVendors } from "../../../services/apiAdmin.js";


export function useTopVendor({ year, month } = {}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["top-vendor", year, month],
        queryFn: () => getTopSellingVendors({ year, month }),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    console.log("top vendors use", data);


    return { topVendor: data || [], isLoading, error };
}