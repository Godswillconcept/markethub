import { useQuery } from "@tanstack/react-query";
import { getVendorEarnings } from "../../services/apiVendors.js";

export function useVendorEarnings(page = 1, limit = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["vendor-earnings", { page, limit }],
    queryFn: () => getVendorEarnings({ page, limit }),
    keepPreviousData: true,
  });

  return {
    earnings: data?.data || [],
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading,
    error,
  };
}
