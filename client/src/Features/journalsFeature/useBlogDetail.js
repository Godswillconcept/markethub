import { useParams } from "react-router";
import { getBlogById } from "../../services/apiBlog.js";
import { useQuery } from "@tanstack/react-query";

export function useBlogDetail() {
    const { slug } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["blog", slug],
        queryFn: () => getBlogById(slug),
        enabled: !!slug,
        retry: false,
    });

    console.log("blog use", data);

    return {
        blog: data?.data || {},
        isLoading,
        error,
    };
}