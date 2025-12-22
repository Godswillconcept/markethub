import { useQuery } from "@tanstack/react-query";
import { getTopCategories } from "../../../services/apiAdmin.js";


export function useTopCategories() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['top-categories'],
        queryFn: () => getTopCategories(),
    });



    return { topCategories: data || [], isLoading, error };
}