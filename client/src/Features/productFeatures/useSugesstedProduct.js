import { useQuery } from "@tanstack/react-query";
import { getYouMayLike } from "../../services/apiProduct.js";

export function useSuggesstedProduct() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["suggested-products"],
        queryFn: () => getYouMayLike(),
    });
    const suggestedProduct = data?.data || []
    const pagination = data?.meta || {
        total: 0,
        // currentPage: 1,
        // totalPages: 0
    }


    return { suggestedProduct, totalItems: pagination.total, isLoading, error }
}