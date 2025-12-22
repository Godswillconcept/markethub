import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createNewAddress as createNewAddressApi } from "../../services/apiAddress.js"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export const useCreateAddress = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const { mutate: createAddress, isPending } = useMutation({
        mutationFn: createNewAddressApi,
        onSuccess: () => {
            // Invalidate the addresses query to refetch the updated list
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            // Show success message
            toast.success("Address created successfully")
            // Navigate back to addresses page
            navigate("/settings/addresses")
        },
        onError: (error) => {
            // Show error message
            toast.error(error.message || "Failed to create address")
        }
    })

    return { createAddress, isPending }
}