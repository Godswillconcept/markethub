import { useMutation } from "@tanstack/react-query";
import { createOrder } from "../../services/apiCart.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useCreateOrder() {

    const navigate = useNavigate();

    const { mutate: createDirectOrder, isPending: isCreatingOrder } = useMutation({
        mutationFn: createOrder,
        onSuccess: (data) => {
            toast.success("Order processed successfully");
            // navigate("/cart/summary"); // Or wherever the user wants to go. 
            // Based on user request "take that single product to the summary page", 
            // we might need to handle the response data specially. 
            // For now, we'll log it and maybe navigate if data suggests it.
            console.log("Direct order success:", data);

            // If the API returns a summary or redirect URL, handle it here.
            navigate("/cart/cart-summary");
        },
        onError: (err) => {
            console.error("Order creation failed", err);
            toast.error("Failed to process order");
        },
    });

    return { createDirectOrder, isCreatingOrder };
}
