import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getSubAdmins,
  createSubAdmin,
  updateSubAdmin,
  deactivateSubAdmin,
} from "../../../services/apiSubAdmins";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../../utils/constants";
import toast from "react-hot-toast";

export function useSubAdmin() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // PAGE
  const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

  // QUERY
  const { isLoading, data, error } = useQuery({
    queryKey: ["subAdmins", page],
    queryFn: () => getSubAdmins({ page }),
    keepPreviousData: true,
  });

  // console.log("Full API Response:", data);

  const subAdmins = data?.subAdmins ?? [];
  const count = data?.total ?? 0;

  // console.log(subAdmins);

  // PREFETCH NEXT + PREV PAGES
  const pageCount = Math.ceil(count / PAGE_SIZE);

  if (page < pageCount) {
    queryClient.prefetchQuery({
      queryKey: ["subAdmins", page + 1],
      queryFn: () => getSubAdmins({ page: page + 1 }),
    });
  }

  if (page > 1) {
    queryClient.prefetchQuery({
      queryKey: ["subAdmins", page - 1],
      queryFn: () => getSubAdmins({ page: page - 1 }),
    });
  }

  return { isLoading, error, subAdmins, count };
}

export function useCreateSubAdmin() {
  const queryClient = useQueryClient();

  const { mutate: createSubAdminApi, isLoading: isCreating } = useMutation({
    mutationFn: createSubAdmin,
    onSuccess: () => {
      toast.success("Sub Admin created successfully");
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createSubAdminApi, isCreating };
}

export function useUpdateSubAdmin() {
  const queryClient = useQueryClient();

  const { mutate: updateSubAdminApi, isLoading: isUpdating } = useMutation({
    mutationFn: updateSubAdmin,
    onSuccess: () => {
      toast.success("Sub Admin updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateSubAdminApi, isUpdating };
}

export function useDeactivateSubAdmin() {
  const queryClient = useQueryClient();

  const { mutate: deactivateSubAdminApi, isLoading: isDeactivating } =
    useMutation({
      mutationFn: deactivateSubAdmin,
      onSuccess: () => {
        toast.success("Sub Admin deactivated successfully");
        queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
      },
      onError: (err) => toast.error(err.message),
    });

  return { deactivateSubAdminApi, isDeactivating };
}
