import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { unfollowVendor as unfollowVendorApi } from "../../services/apiVendors.js";

export const useUnfollowVendor = () => {
    const { mutate: unfollowVendor, isPending: isLoading, isError, error, isSuccess, data } = useMutation({
        mutationFn: async (vendorId) => {
            const response = await unfollowVendorApi(vendorId);
            return response;
        },
        onSuccess: () => {
            toast.success('Vendor unfollowed successfully');
        },
        onError: () => {
            toast.error('Failed to unfollow vendor');
        },
    });

    return { unfollowVendor, isLoading, isError, error, isSuccess, data };
}
