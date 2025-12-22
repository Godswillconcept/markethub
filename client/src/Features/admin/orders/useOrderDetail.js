import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminOrderDetails } from "../../../services/apiAdminOrders.js";
import { useParams } from "react-router-dom";

export function useOrderDetail() {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const {
    isLoading,
    data: order = null,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getAdminOrderDetails(id),
    enabled: !!id,
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["order", id], data);
    },
  });
  return { order, isLoading, error };
}
