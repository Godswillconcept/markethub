import { useMutation } from "@tanstack/react-query";
import { createOrder } from "../../services/apiCart.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function useCreateOrder() {

    const navigate = useNavigate();

    const { mutate: createDirectOrder, isPending: isCreatingOrder } = useMutation({
        mutationFn: createOrder,
        onSuccess: (data) => {
            console.log("Direct order success:", data);
            
            // Check for Paystack authorization URL
            const authUrl = data?.data?.order?.paymentData?.authorization_url;
            
            if (authUrl) {
                toast.success("Redirecting to payment...");
                window.location.href = authUrl;
            } else {
                toast.success("Order processed successfully");
                navigate("/settings/orders"); // Redirect to orders page if no payment URL (e.g. cash on delivery if supported later)
            }
        },
        onError: (err) => {
            console.error("Order creation failed", err);
            toast.error("Failed to process order");
        },
    });

    return { createDirectOrder, isCreatingOrder };
}
