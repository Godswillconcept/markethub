import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsersList } from "../../../services/apiAdminUsers";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../../utils/constants";

export function useUsersList() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // PAGE
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // QUERY
  const {
    isLoading,
    data: { data: users, total } = {},
    error,
  } = useQuery({
    queryKey: ["user-list", page],
    queryFn: () => getUsersList({ page }),
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["user-list", page], data);
    },
  });

  // PREFETCH NEXT + PREV PAGES
  const pageCount = Math.ceil(total / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ["user-list", page + 1],
      queryFn: () => getUsersList({ page: page + 1 }),
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ["user-list", page - 1],
      queryFn: () => getUsersList({ page: page - 1 }),
    });
  }

  return { users, total, isLoading, error };
}
