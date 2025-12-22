// import { useQuery } from "@tanstack/react-query";
// import { getAdminProduct } from "../../../services/apiAdminProduct";

// export function useAdminProduct() {
//     const { data, isLoading, error } = useQuery({
//         queryKey: ["adminProduct"],
//         queryFn: getAdminProduct,
//         retry: false,
//     });
//     console.log("Admin product use", data);

//     return { adminProduct: data || [], isLoading, error };
// }
import { useQuery } from "@tanstack/react-query";
import { getAdminProduct } from "../../../services/apiAdminProduct.js";

import { useSearchParams } from "react-router-dom";

export function useAdminProduct(page = 1, limit = 9) {
    const [searchParams] = useSearchParams();
    const search = searchParams.get("search") || "";

    const { data, isLoading, error } = useQuery({
        queryKey: ["adminProduct", page, limit, search],
        queryFn: () => getAdminProduct(page, limit, search),
        retry: false,
        keepPreviousData: true, // Keep previous data while fetching new page
    });

    return {
        adminProduct: data?.data || [],
        total: data?.total || 0,
        count: data?.count || 0,
        isLoading,
        error
    };
}