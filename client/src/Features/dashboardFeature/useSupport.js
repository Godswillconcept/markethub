import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { sendFeedback as sendFeedbackApi } from "../../services/apiSupport.js";

export function useSupport() {
    const { mutate: sendFeedback, isPending: isSending } = useMutation({
        mutationFn: sendFeedbackApi,
        onSuccess: () => {
            toast.success("Message sent successfully!");
        },
        onError: (err) => {
            toast.error(err.message || "Failed to send message");
        },
    });

    return { sendFeedback, isSending };
}
