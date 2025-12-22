import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setDefaultAddress as setDefaultAddressApi } from "../../services/apiAddress.js";
import { toast } from "react-hot-toast";

export const useDefaultAddress = () => {
    const queryClient = useQueryClient();

    const {
        mutate: setAsDefault,
        isPending: isSettingDefault
    } = useMutation({
        mutationFn: setDefaultAddressApi,
        onSuccess: () => {
            // Invalidate the addresses query to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            // Show success message
            toast.success("Default address updated successfully");
        },
        onError: (error) => {
            // Show error message
            toast.error(error.message || "Failed to set default address");
        }
    });

    return {
        setAsDefault,
        isSettingDefault
    };
};