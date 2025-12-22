import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminVendorById } from "../../../services/apiAdminVendorList.js";
import { useParams } from "react-router-dom";

export function useAdminVendorDetail() {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const {
    isLoading,
    data: vendor,
    error,
  } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getAdminVendorById(id),
    enabled: !!id,
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["vendor", id], data);
    },
  });
  return { vendor, isLoading, error };
}
