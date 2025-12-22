import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAddress as updateAddressApi } from "../../services/apiAddress.js";
import { toast } from "react-hot-toast";

export function useUpdateAddress() {
    const queryClient = useQueryClient();

    const { mutate: updateAddress, isLoading: isUpdating } = useMutation({
        mutationFn: ({ id, addressData }) => updateAddressApi(id, addressData),
        onSuccess: (data) => {
            toast.success("Address updated successfully");
            // Invalidate the addresses query to refetch the updated data
            queryClient.invalidateQueries({ queryKey: ["addresses"] });
            // Also invalidate the specific address query if needed
            queryClient.invalidateQueries({ queryKey: ["address", data?.id] });
            return data;
        },
        onError: (error) => {
            console.error("Error updating address:", error);
            toast.error(error.message || "Failed to update address");
        },
    });

    return { updateAddress, isUpdating };
}