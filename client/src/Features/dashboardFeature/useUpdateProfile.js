import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-hot-toast";
import { updateUser as updateUserApi } from "../../services/apiUser.js";

export function useUpdateUser() {
    const queryClient = useQueryClient();

    const { mutate: updateUser, isLoading: isUpdatingUser } = useMutation({
        mutationFn: updateUserApi,
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.message || "Failed to update profile");
        },
    });

    return { updateUser, isUpdatingUser };
}
