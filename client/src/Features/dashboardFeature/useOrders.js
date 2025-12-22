// import { useQuery } from "@tanstack/react-query";
// import { getOrders } from "../../services/apiUser";
// // import { getOrders } from "../../../services/apiOrders";

// export function useOrders(page = 1, limit = 10) {
//     const { data, isLoading, error } = useQuery({
//         queryKey: ["orders", page, limit],
//         queryFn: () => getOrders(page, limit),
//         retry: false,
//         keepPreviousData: true, // Keep previous data while fetching new page
//     });

//     console.log("Orders hook data", data);

//     return {
//         orders: data?.data || [],
//         total: data?.total || 0,
//         count: data?.count || 0,
//         currentPage: data?.page || page,
//         totalPages: data?.totalPages || 1,
//         isLoading,
//         error
//     };
// }

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../../services/apiUser.js";

export function useOrders(page = 1, limit = 5, status = undefined) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["orders", page, limit, status],
        queryFn: () => getOrders(page, limit, status),
        retry: false,
        keepPreviousData: true, // Keep previous data while fetching new page
    });

    console.log("Orders hook data", data?.data?.orders);

    return {
        orders: data?.data?.orders || [],
        pagination: data?.data?.pagination || {
            total: 0,
            total_pages: 1,
            current_page: page,
            has_next_page: false,
            has_previous_page: false,
            limit: limit
        },
        isLoading,
        error
    };
}