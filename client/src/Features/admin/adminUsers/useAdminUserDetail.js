import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminUserById } from "../../../services/apiAdminUsers";
import { useParams } from "react-router-dom";

export function useAdminUserDetail() {
  const queryClient = useQueryClient();
  const { id } = useParams();

  const {
    isLoading,
    data: user,
    error,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getAdminUserById(id),
    enabled: !!id,
    keepPreviousData: true,
    onSuccess: (data) => {
      queryClient.setQueryData(["user", id], data);
    },
  });
  return { user, isLoading, error };
}
