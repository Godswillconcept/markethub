import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrders } from "../../../services/apiAdminOrders.js";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../../utils/constants.js";

export function useAdminOrders() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "All";
  const sortBy = searchParams.get("sortBy") || "All";

  const {
    isLoading,
    data: { data: orders, total } = {},
    error,
  } = useQuery({
    queryKey: ["admin-orders", page, search, status, sortBy],
    queryFn: () => getAdminOrders({ page, search, status, sortBy }),
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-orders", page, search, status, sortBy], data);
    },
  });

  const pageCount = Math.ceil(total / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ["admin-orders", page + 1, search, status, sortBy],
      queryFn: () => getAdminOrders({ page: page + 1, search, status, sortBy }),
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ["admin-orders", page - 1, search, status, sortBy],
      queryFn: () => getAdminOrders({ page: page - 1, search, status, sortBy }),
    });
  }

  return { orders, total, isLoading, error };
}
