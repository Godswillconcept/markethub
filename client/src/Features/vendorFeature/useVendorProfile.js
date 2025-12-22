import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getVendorProfile, updateVendorProfile as updateVendorProfileApi } from "../../services/apiVendors.js";

export function useVendorProfile() {
    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["vendorProfile"],
        queryFn: getVendorProfile,
    });

    return {
        profile: data?.data || {}, // The API returns { status: "success", data: { ... } }
        isLoading,
        error,
    };
}

export function useUpdateVendorProfile() {
    const queryClient = useQueryClient();

    const { mutate: updateProfile, isPending: isUpdating } = useMutation({
        mutationFn: updateVendorProfileApi,
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["vendorProfile"] });
        },
        onError: (err) => {
            toast.error(err.message || "Failed to update profile");
        },
    });

    return { updateProfile, isUpdating };
}
