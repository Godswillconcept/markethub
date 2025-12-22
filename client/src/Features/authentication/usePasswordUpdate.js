import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePassword as updatePasswordApi } from "../../services/apiAuth.js";
import { toast } from "react-hot-toast";

export function usePasswordUpdate() {
  const queryClient = useQueryClient();

  const { mutate: updatePassword, isLoading } = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      updatePasswordApi({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated successfully");
      queryClient.invalidateQueries(["user"]);
    },
    onError: (error) => {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    },
  });

  return { updatePassword, isLoading };
}
