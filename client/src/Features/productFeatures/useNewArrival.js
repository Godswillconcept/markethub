import { getNewArrival } from "../../services/apiProduct.js";
import { useQuery } from "@tanstack/react-query";

export function useNewArrival() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["new-arrival"],
        queryFn: () => getNewArrival(),
    });

    // Extract the data and pagination information
    const products = data?.data || [];
    const pagination = data?.pagination || {
        totalItems: 0,
        currentPage: 1,
        totalPages: 0
    };

    return { 
        data: products, 
        totalItems: pagination.totalItems,
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        isLoading, 
        error 
    };
}