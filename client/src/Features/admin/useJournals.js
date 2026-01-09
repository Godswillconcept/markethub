import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJournals } from "../../services/apiAdminJournals";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants";

export function useJournals() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // PAGE
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
    const search = searchParams.get("search") || "";

    // QUERY
    const {
        isLoading,
        data: { data: journals, total } = {},
        error,
    } = useQuery({
        queryKey: ["journals", page, search],
        queryFn: () => getJournals({ page, search }),
        keepPreviousData: true,
        onSuccess: (data) => {
            // Prefetch logic can stay here or be handled by prefetchQuery below
        },
    });

    // PREFETCH NEXT + PREV PAGES
    const pageCount = Math.ceil(total / PAGE_SIZE);

    if (page < pageCount) {
        queryClient.prefetchQuery({
            queryKey: ["journals", page + 1, search],
            queryFn: () => getJournals({ page: page + 1, search }),
        });
    }

    if (page > 1) {
        queryClient.prefetchQuery({
            queryKey: ["journals", page - 1, search],
            queryFn: () => getJournals({ page: page - 1, search }),
        });
    }

    return { journals, total, isLoading, error };
}
