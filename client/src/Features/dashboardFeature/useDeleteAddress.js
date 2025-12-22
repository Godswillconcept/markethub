import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteAddress as deleteAddressApi } from "../../services/apiAddress.js"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export const useDeleteAddress = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { mutate: deleteAddress, isPending: isDeleting } = useMutation({
        mutationFn: deleteAddressApi,
        onSuccess: (data) => {
            // Invalidate and refetch the addresses query
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            // Show success message
            toast.success("Address deleted successfully");
            navigate("/settings/addresses");
        },
        onError: (error) => {
            // Show error message
            toast.error(error.message || "Failed to delete address")
        }
    });

    return { deleteAddress, isDeleting }
}