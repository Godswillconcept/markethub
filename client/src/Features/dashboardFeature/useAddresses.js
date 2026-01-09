import { getAddresses } from "../../services/apiAddress.js";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../authentication/AuthContext.jsx";

export function useAddresses() {
    const { isAuthenticated } = useAuth();
    const { data: addresses, isLoading, error } = useQuery({
        queryKey: ["addresses"],
        queryFn: getAddresses,
        staleTime: 10 * 60 * 1000, // 10 minutes - addresses change infrequently
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: isAuthenticated,
    })
    console.log("addresses", addresses);

    return { addresses, isLoading, error }
}