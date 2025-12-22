import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVendors } from "../../services/apiVendors.js";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants.js";

export function useVendors() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // PAGE
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

    // QUERY
    const {
        isLoading,
        data: { data: vendors, total } = {},
        error,
    } = useQuery({
        queryKey: ["vendors", page],
        queryFn: () => getVendors({ page }),
        keepPreviousData: true, // keeps old data visible while fetching new
    });


    // PREFETCH NEXT + PREV PAGES
    const pageCount = Math.ceil(total / PAGE_SIZE);

    if (page < pageCount) {
        queryClient.prefetchQuery({
            queryKey: ["vendors", page + 1],
            queryFn: () => getVendors({ page: page + 1 }),
        });
    }

    if (page > 1) {
        queryClient.prefetchQuery({
            queryKey: ["vendors", page - 1],
            queryFn: () => getVendors({ page: page - 1 }),
        });
    }

    return { isLoading, error, vendors, total };
}