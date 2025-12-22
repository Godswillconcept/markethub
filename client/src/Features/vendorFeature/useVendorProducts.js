import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { getVendorProducts } from "../../services/apiVendors.js";

export function useVendorProducts(vendorId, limit = 10) {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // PAGE
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

    // QUERY
    const {
        isLoading,
        data,
        error,
    } = useQuery({
        queryKey: ["vendors", vendorId, page],
        queryFn: () => getVendorProducts(vendorId, { page, limit }),
        enabled: !!vendorId, // Only run query when slug exists
        onSuccess: (data) => {
            queryClient.setQueryData(["vendors", vendorId, page], data);
        },
    });

    const pageCount = Math.ceil(data?.total / limit);
    console.log("pageCount", pageCount);
    console.log("page", page);

    if (page < pageCount && vendorId) {
        queryClient.prefetchQuery({
            queryKey: ["vendors", vendorId, page + 1],
            queryFn: () => getVendorProducts(vendorId, { page: page + 1, limit }),
        });
    }

    if (page > 1 && vendorId) {
        queryClient.prefetchQuery({
            queryKey: ["vendors", vendorId, page - 1],
            queryFn: () => getVendorProducts(vendorId, { page: page - 1, limit }),
        });
    }

    console.log("vendor products", data);
    return {
        isLoading,
        products: data?.data || [],
        total: data?.total || 0,
        error,
    };
}



