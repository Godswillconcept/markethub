// hooks/useProductsByCategory.js
// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "react-router-dom";
// import { getProductsByCategory } from "../../services/apiProduct";

// export function useProductsByCategory(page = 1) {
//     const { categoryId } = useParams(); // dynamic category from URL

//     const { data, isLoading, error } = useQuery({
//         queryKey: ["products", categoryId, page],

//         queryFn: () => getProductsByCategory(categoryId, page),
//         enabled: !!categoryId,
//         keepPreviousData: true, // avoids flicker on page changes
//         staleTime: 1000 * 60 * 5, // cache for 5 minutes
//         // select: (res) => {
//         //     // normalize the API response to return clean data
//         //     return {
//         //         category: res?.category || null,
//         //         products: res?.products || [],
//         //         pagination: {
//         //             total: res?.total || res?.products?.length || 0,
//         //         },
//         //     };
//         // },
//     });

//     console.log("From useProductsByCategory", data.products.products);
//     return { data.products.products, isLoading, error };
// }

// import { useQuery } from "@tanstack/react-query";
// import { useParams } from "react-router-dom";
// import { getProductsByCategory } from "../../services/apiProduct";

// export function useProductsByCategory(page = 1) {
//     const { categoryId } = useParams(); // dynamic category from URL

//     const { data, isLoading, error } = useQuery({
//         queryKey: ["products", categoryId, page],
//         queryFn: () => getProductsByCategory(categoryId, page),
//         enabled: !!categoryId,
//         keepPreviousData: true,
//         staleTime: 1000 * 60 * 5,
//     });

//     console.log("From useProductsByCategory", data?.products);

//     return {
//         products: data?.products?.products || [], // safe access
//         category: data?.category || null,
//         pagination: data?.products?.pagination || { total: 0 },
//         isLoading,
//         error,
//     };
// }

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getProductsByCategory } from "../../services/apiProduct.js";
import { PAGE_SIZE } from "../../utils/constants.js";

export function useProductsByCategory(page = 1) {
    const { categoryId } = useParams();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["products", categoryId, page],
        queryFn: () => getProductsByCategory(categoryId, page),
        enabled: !!categoryId,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });

    // ✅ Extract correctly from your API response
    const products = data?.products?.products || [];
    const total = data?.products?.pagination?.total || 0; // <- IMPORTANT
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // ✅ Prefetch next page
    if (page < totalPages) {
        queryClient.prefetchQuery({
            queryKey: ["products", categoryId, page + 1],
            queryFn: () => getProductsByCategory(categoryId, page + 1),
        });
    }

    return {
        products,
        category: data?.category || null,
        pagination: {
            total,
            totalPages,
            currentPage: page,
        },
        isLoading,
        error,
    };
}
