import { getAddresses } from "../../services/apiAddress.js";
import { useQuery } from "@tanstack/react-query";

export function useAddresses() {
    const { data: addresses, isLoading, error } = useQuery({
        queryKey: ["addresses"],
        queryFn: getAddresses
    })
    console.log("addresses", addresses);

    return { addresses, isLoading, error }
}