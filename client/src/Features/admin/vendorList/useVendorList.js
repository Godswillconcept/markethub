import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVendorsList } from "../../../services/apiAdminVendorList.js";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../../utils/constants.js";

export function useVendorList() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // PAGE
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const sortBy = searchParams.get("sortBy") || "all";
  const sortOrder = searchParams.get("sortOrder") || "DESC";

  // QUERY
  const {
    isLoading,
    data: { data: vendors, total } = {},
    error,
  } = useQuery({
    queryKey: ["vendor-list", page, search, status, sortBy, sortOrder],
    queryFn: () => getVendorsList({ page, search, status, sortBy, sortOrder }),
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["vendor-list", page, search, status, sortBy, sortOrder], data);
    },
  });

  // PREFETCH NEXT + PREV PAGES
  const pageCount = Math.ceil(total / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ["vendor-list", page + 1, search, status, sortBy, sortOrder],
      queryFn: () => getVendorsList({ page: page + 1, search, status, sortBy, sortOrder }),
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ["vendor-list", page - 1, search, status, sortBy, sortOrder],
      queryFn: () => getVendorsList({ page: page - 1, search, status, sortBy, sortOrder }),
    });
  }

  return { vendors, total, isLoading, error };
}
