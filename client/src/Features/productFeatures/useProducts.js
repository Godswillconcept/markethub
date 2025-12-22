// import { useQueryClient, useQuery } from "@tanstack/react-query";

// import { getProducts } from "../../services/apiProduct";

// export function useProducts() {
//     const { data, isLoading, error } = useQuery({
//         queryKey: ["products"],
//         queryFn: getProducts,
//         retry: false,
//     });

//     return { products: data?.data, total: data?.total, isLoading, error };
// }

// hooks/useProducts.js
// import { useQuery } from "@tanstack/react-query";
// import { getProducts } from "../../services/apiProduct";

// export function useProducts(page, limit = 10) {
//     const { data, isLoading, error } = useQuery({
//         queryKey: ["products", page, limit],
//         queryFn: () => getProducts(page, limit),
//         keepPreviousData: true, // smooth pagination
//     });

//     return {
//         products: data?.data ?? [],
//         total: data?.total ?? 0,
//         count: data?.count ?? 0,
//         isLoading,
//         error,
//     };
// }

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "../../services/apiProduct.js";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants.js";

export function useProducts() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // PAGE
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

    // QUERY
    const {
        isLoading,
        data: { data: products, total } = {},
        error,
    } = useQuery({
        queryKey: ["products", page],
        queryFn: () => getProducts({ page }),
        keepPreviousData: true, // keeps old data visible while fetching new
    });

    // PREFETCH NEXT + PREV PAGES
    const pageCount = Math.ceil(total / PAGE_SIZE);

    if (page < pageCount) {
        queryClient.prefetchQuery({
            queryKey: ["products", page + 1],
            queryFn: () => getProducts({ page: page + 1 }),
        });
    }

    if (page > 1) {
        queryClient.prefetchQuery({
            queryKey: ["products", page - 1],
            queryFn: () => getProducts({ page: page - 1 }),
        });
    }

    console.log("useProducts", products);


    return { isLoading, error, products, total };
}

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { getProducts } from "../../services/apiProduct";
// import { useSearchParams } from "react-router-dom";
// import { PAGE_SIZE } from "../../utils/constants";

// export function useProducts({ withPagination = true } = {}) {
//     const queryClient = useQueryClient();
//     const [searchParams] = useSearchParams();

//     // PAGE (only if paginated)
//     const page = withPagination
//         ? !searchParams.get("page")
//             ? 1
//             : Number(searchParams.get("page"))
//         : undefined;

//     // QUERY
//     const {
//         isLoading,
//         data,
//         error,
//     } = useQuery({
//         queryKey: withPagination ? ["products", page] : ["products", "all"],
//         queryFn: () => getProducts({ page, withPagination }),
//         keepPreviousData: withPagination, // only matters for pagination
//     });

//     // Destructure depending on mode
//     let products = [];
//     let total = 0;

//     if (withPagination) {
//         products = data?.data || [];
//         total = data?.total || 0;
//     } else {
//         products = data || [];
//         total = products.length;
//     }

//     // PREFETCH NEXT + PREV PAGES (only for pagination)
//     if (withPagination && total) {
//         const pageCount = Math.ceil(total / PAGE_SIZE);

//         if (page < pageCount) {
//             queryClient.prefetchQuery({
//                 queryKey: ["products", page + 1],
//                 queryFn: () => getProducts({ page: page + 1, withPagination }),
//             });
//         }

//         if (page > 1) {
//             queryClient.prefetchQuery({
//                 queryKey: ["products", page - 1],
//                 queryFn: () => getProducts({ page: page - 1, withPagination }),
//             });
//         }
//     }

//     return { isLoading, error, products, total };
// }
