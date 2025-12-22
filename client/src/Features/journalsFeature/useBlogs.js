// import { useQuery } from "@tanstack/react-query";
// import { getBlogs } from "../../services/apiBlog";

// export function useBlogs(page) {
//     const {
//         data: { data: blogs, total } = {},
//         isLoading,
//         error,
//     } = useQuery({
//         queryKey: ["journals", page],
//         queryFn: () => getBlogs({ page }),
//         keepPreviousData: true, // Keep previous data while fetching next page
//     });

//     return {
//         blogs: blogs || [],
//         total: total || 0,
//         isLoading,
//         error,
//     };
// }

// Features/journalsFeature/useBlogs.js
import { useQuery } from "@tanstack/react-query";
import { getBlogs } from "../../services/apiBlog.js";

export function useBlogs(page) {
    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["blogs", page],
        queryFn: () => getBlogs({ page }),
        keepPreviousData: true,
    });

    return {
        blogs: data?.blogs || [],
        total: data?.total || 0,
        isLoading,
        error,
    };
}
