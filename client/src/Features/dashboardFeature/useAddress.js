
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getAddressById } from "../../services/apiAddress.js";

export function useAddress() {
    const { id } = useParams(); // read id from the route

    const { data, isLoading, error } = useQuery({


        queryKey: ["address", id],
        queryFn: () => getAddressById(id),
        enabled: !!id,   // only fetch when we have an id
        retry: false,           // fail fast if not found
    });
    console.log("From useAddress", data);

    return {
        address: data?.data || {},
        isLoading,
        error
    };

}