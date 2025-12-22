// useOrderDetail.js
import { useQuery } from "@tanstack/react-query";
import { updateOrderStatus } from "../../services/apiUser.js";
// import { updateOrderStatus } from "../../../services/apiOrders"; // adjust the path

export function useOrderDetail(orderId, enabled = true) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => updateOrderStatus(orderId),
        enabled: !!orderId && enabled, // only run when orderId is available
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
    return {
        orderDetail: data?.data?.order || {},
        isLoading,
        error,
    };
}
