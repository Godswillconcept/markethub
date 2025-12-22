// // import { useQuery, useQueryClient } from "@tanstack/react-query";
// // import { followVendorList as followVendorListApi } from "../../services/apiVendors";
// // import { useSearchParams } from "react-router-dom";
// // import { PAGE_SIZE } from "../../utils/constants";

// // export function useFollowVendorList() {
// //     const queryClient = useQueryClient();
// //     const [searchParams] = useSearchParams();

// //     // Get current page from URL or default to 1
// //     const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

// //     // Query for followed vendors with pagination
// //     const {
// //         isLoading,
// //         data: { data: followVendorList, pagination } = {},
// //         error,
// //     } = useQuery({
// //         queryKey: ["followedVendors", page],
// //         queryFn: () => followVendorListApi({ page }),
// //         keepPreviousData: true, // Keep previous data while fetching new data
// //     });

// //     const followedVendorIds = new Set(
// //         (followVendorList)?.map(v => v.vendor_id)
// //     );
// //     console.log("followedVendorIds", followedVendorIds);

// //     // Prefetch next and previous pages
// //     if (pagination?.hasNextPage) {
// //         queryClient.prefetchQuery({
// //             queryKey: ["followedVendors", page + 1],
// //             queryFn: () => followVendorList({ page: page + 1 }),
// //         });
// //     }

// //     if (page > 1) {
// //         queryClient.prefetchQuery({
// //             queryKey: ["followedVendors", page - 1],
// //             queryFn: () => followVendorList({ page: page - 1 }),
// //         });
// //     }

// //     return {
// //         followVendorList,
// //         isLoading,
// //         error,
// //         pagination,
// //         followedVendorIds
// //     };
// // }
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { followVendorList as followVendorListApi } from "../../services/apiVendors";
// import { useSearchParams } from "react-router-dom";
// import { PAGE_SIZE } from "../../utils/constants";

// export function useFollowVendorList() {
//     const queryClient = useQueryClient();
//     const [searchParams] = useSearchParams();

//     // Get current page from URL or default to 1
//     const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

//     // Query for followed vendors with pagination
//     const {
//         isLoading,
//         data: { data: followVendorList, pagination } = {},
//         error,
//     } = useQuery({
//         queryKey: ["followedVendors", page],
//         queryFn: () => followVendorListApi({ page }),
//         placeholderData: (previousData) => previousData, // Replaced keepPreviousData
//     });

//     // Create Set of followed vendor IDs - handle undefined/null cases
//     const followedVendorIds = new Set(
//         followVendorList?.map(v => v.vendor_id) || []
//     );

//     console.log("followedVendorIds", followedVendorIds);

//     // Prefetch next page
//     if (pagination?.hasNextPage) {
//         queryClient.prefetchQuery({
//             queryKey: ["followedVendors", page + 1],
//             queryFn: () => followVendorListApi({ page: page + 1 }), // Fixed: was followVendorList
//         });
//     }

//     // Prefetch previous page
//     if (page > 1) {
//         queryClient.prefetchQuery({
//             queryKey: ["followedVendors", page - 1],
//             queryFn: () => followVendorListApi({ page: page - 1 }), // Fixed: was followVendorList
//         });
//     }

//     return {
//         followVendorList,
//         isLoading,
//         error,
//         pagination,
//         followedVendorIds
//     };
// }

// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { followVendorList as followVendorListApi } from "../../services/apiVendors";
// import { useSearchParams } from "react-router-dom";
// import { PAGE_SIZE } from "../../utils/constants";

// export function useFollowVendorList(enabled = true) {
//     const queryClient = useQueryClient();
//     const [searchParams] = useSearchParams();

//     // Get current page from URL or default to 1
//     const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

//     // Query for followed vendors with pagination
//     const {
//         isLoading,
//         data: { data: followVendorList, pagination } = {},
//         error,
//     } = useQuery({
//         queryKey: ["followedVendors", page],
//         queryFn: () => followVendorListApi({ page }),
//         placeholderData: (previousData) => previousData,
//         enabled: enabled, // Only fetch when explicitly enabled
//         retry: false, // Don't retry on 401 errors
//     });

//     // Create Set of followed vendor IDs - handle undefined/null cases
//     const followedVendorIds = new Set(
//         followVendorList?.map(v => v.vendor_id) || []
//     );

//     console.log("followedVendorIds", followedVendorIds);

//     // Prefetch next page
//     if (enabled && pagination?.hasNextPage) {
//         queryClient.prefetchQuery({
//             queryKey: ["followedVendors", page + 1],
//             queryFn: () => followVendorListApi({ page: page + 1 }),
//         });
//     }

//     // Prefetch previous page
//     if (enabled && page > 1) {
//         queryClient.prefetchQuery({
//             queryKey: ["followedVendors", page - 1],
//             queryFn: () => followVendorListApi({ page: page - 1 }),
//         });
//     }

//     return {
//         followVendorList,
//         isLoading,
//         error,
//         pagination,
//         followedVendorIds
//     };
// }

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { followVendorList as followVendorListApi } from "../../services/apiVendors.js";
import { useSearchParams } from "react-router-dom";

export function useFollowVendorList(options = {}) {
    const { enabled = true } = options;
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    // Get current page from URL or default to 1
    const page = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));

    // Query for followed vendors with pagination
    const {
        isLoading,
        data: { data: followVendorList, pagination } = {},
        error,
    } = useQuery({
        queryKey: ["followedVendors", page],
        queryFn: () => followVendorListApi({ page }),
        placeholderData: (previousData) => previousData,
        enabled: enabled, // Only fetch when explicitly enabled
        retry: false, // Don't retry on 401 errors
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Create Set of followed vendor IDs - handle undefined/null cases
    const followedVendorIds = new Set(
        followVendorList?.map(v => v.vendor_id) || []
    );

    console.log("followedVendorIds", followedVendorIds);

    // Prefetch next page
    if (enabled && pagination?.hasNextPage) {
        queryClient.prefetchQuery({
            queryKey: ["followedVendors", page + 1],
            queryFn: () => followVendorListApi({ page: page + 1 }),
        });
    }

    // Prefetch previous page
    if (enabled && page > 1) {
        queryClient.prefetchQuery({
            queryKey: ["followedVendors", page - 1],
            queryFn: () => followVendorListApi({ page: page - 1 }),
        });
    }

    return {
        followVendorList,
        isLoading,
        error,
        pagination,
        followedVendorIds
    };
}