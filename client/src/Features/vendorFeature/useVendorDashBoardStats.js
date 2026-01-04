import { useQuery } from "@tanstack/react-query";
import { getVendorDashboardStats } from "../../services/apiVendors.js";

export function useVendorDashBoardStats() {
    const { data, isLoading, } = useQuery({
        queryKey: ["vendor-dashboard-stats"],
        queryFn: () => getVendorDashboardStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return {
        stats: data?.data || [],
        isLoading,

    };
}
