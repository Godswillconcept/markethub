import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVendorApplications } from "../../../services/apiVendorApplication.js";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../../utils/constants.js";

export function useVendorApplications() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // PAGE
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  // QUERY
  const {
    isLoading,
    data: { data: applications, total } = {},
    error,
  } = useQuery({
    queryKey: ["vendor-applications", page, search, status],
    queryFn: async () => {
      const res = await getVendorApplications({ page, search, status });
      // console.log("QueryFn raw result", res);
      return res;
    },
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["vendor-applications", page, search, status],
        data,
      );
    },
  });

  // PREFETCH NEXT + PREV PAGES
  const pageCount = Math.ceil(total / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ["vendor-applications", page + 1, search, status],
      queryFn: async () => {
        const res = await getVendorApplications({
          page: page + 1,
          search,
          status,
        });
        return res;
      },
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ["vendor-applications", page - 1, search, status],
      queryFn: async () => {
        const res = await getVendorApplications({
          page: page - 1,
          search,
          status,
        });
        return res;
      },
    });
  }

  return { applications, total, isLoading, error };
}
