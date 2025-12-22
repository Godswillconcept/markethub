import { useQuery } from "@tanstack/react-query";
import { getVendorById } from "../../services/apiVendors.js";
import { useParams } from "react-router-dom";

export function useVendor() {
    const { vendorId } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["vendor", vendorId],
        queryFn: () => getVendorById(vendorId),
        enabled: !!vendorId,
        retry: false,
    });

    return {
        vendor: data?.data || {},
        isLoading,
        error,
    };
}
