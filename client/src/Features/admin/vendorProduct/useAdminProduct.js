import { useQuery } from "@tanstack/react-query";
import { getAdminProduct } from "../../../services/apiAdminProduct.js";

import { useSearchParams } from "react-router-dom";

export function useAdminProduct(page = 1, limit = 9, filters = {}) {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const { category, vendor, active: status } = filters;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminProduct", page, limit, search, category, vendor, status],
    queryFn: () => getAdminProduct(page, limit, search, category, vendor, status),
    retry: false,
    keepPreviousData: true, // Keep previous data while fetching new page
  });

  return {
    adminProduct: data?.data || [],
    total: data?.total || 0,
    count: data?.count || 0,
    isLoading,
    error,
  };
}
