import { useQuery } from "@tanstack/react-query";
import { getTopSellingItems } from "../../../services/apiAdmin.js";


export function useTopItem() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["top-item"],
        queryFn: getTopSellingItems,
        retry: false,
    });



    return { topItem: data || [], isLoading, error };
}