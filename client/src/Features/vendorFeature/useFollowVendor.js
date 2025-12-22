import { useMutation } from "@tanstack/react-query";
import { followVendor as followVendorApi } from "../../services/apiVendors.js";
import toast from "react-hot-toast";

export const useFollowVendor = () => {

    const { mutate: followVendor, isPending: isLoading, isError, error, isSuccess, data } = useMutation({
        mutationFn: async (vendorId) => {
            const response = await followVendorApi(vendorId);
            return response;
        },
        onSuccess: () => {
            toast.success('Vendor followed successfully');
        },
        onError: () => {
            toast.error('Failed to follow vendor');
        },
    });

    return {
        followVendor,
        isLoading,
        isError,
        error,
        isSuccess,
        data
    };
};