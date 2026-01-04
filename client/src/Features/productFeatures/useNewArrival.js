import { getNewArrival } from "../../services/apiProduct.js";
import { useQuery } from "@tanstack/react-query";

export function useNewArrival() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["new-arrival"],
        queryFn: () => getNewArrival(),
        staleTime: 10 * 60 * 1000, // 10 minutes - new arrivals are relatively stable
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
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