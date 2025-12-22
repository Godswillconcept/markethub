import { getCartSummary } from "../../services/apiCart.js";
import { useQuery } from "@tanstack/react-query";

export function useCartSummary() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["cartSummary"],
        queryFn: () => getCartSummary(),
    });
    return { data, isLoading, error };
}