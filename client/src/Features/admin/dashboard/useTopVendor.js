import { useQuery } from "@tanstack/react-query";
import { getTopSellingVendors } from "../../../services/apiAdmin.js";


export function useTopVendor() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["top-vendor"],
        queryFn: getTopSellingVendors,
        retry: false,
    });

    console.log("top vendors use", data);


    return { topVendor: data || [], isLoading, error };
}