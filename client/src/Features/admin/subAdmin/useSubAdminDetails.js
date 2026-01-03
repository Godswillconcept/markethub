import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getSubAdminDetails } from "../../../services/apiSubAdmins";

export function useSubAdminDetails() {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const {
    isLoading,
    data: subAdmin,
    error,
  } = useQuery({
    queryKey: ["subAdmins", id],
    queryFn: () => getSubAdminDetails(id),
    enabled: !!id,
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["subAdmins", id], data);
    },
  });
  // console.log(subAdmin);
  return { subAdmin, isLoading, error };
}
