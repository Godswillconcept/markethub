import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVendorDashBoardProducts } from "../../services/apiVendors.js";

export function useVendorDashboardProduct(page = 1, limit = 10, search = "", status = "") {
    const queryClient = useQueryClient();

    // Fetch the current page with search and status filters
    const {
        data: { data: products, pagination } = { data: [], pagination: {} },
        isLoading,
        error,
        isError,
        isFetching,
        isPlaceholderData,
    } = useQuery({
        queryKey: ["vendor-dashboard-products", page, search, status, limit],
        queryFn: () => getVendorDashBoardProducts({ page, limit, search, status }),
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    // Prefetch next page if there are more pages
    if (pagination?.hasNextPage) {
        queryClient.prefetchQuery({
            queryKey: ["vendor-dashboard-products", page + 1, search, status, limit],
            queryFn: () => getVendorDashBoardProducts({ page: page + 1, limit, search, status }),
        });
    }

    return {
        products: products || [],
        pagination: {
            currentPage: pagination?.currentPage || page,
            totalPages: pagination?.totalPages || 1,
            totalItems: pagination?.totalItems || 0,
            hasNextPage: pagination?.hasNextPage || false,
            hasPreviousPage: pagination?.hasPreviousPage || false,
        },
        isLoading,
        isError,
        error: error?.message,
        isFetching,
        isPlaceholderData,
    };
}
