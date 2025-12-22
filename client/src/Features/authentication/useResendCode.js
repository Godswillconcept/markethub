import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { resendVerification } from "../../services/apiAuth.js";

export function useResendVerification() {
    const { mutate: resend, isPending } = useMutation({
        mutationFn: resendVerification,
        onSuccess: () => {
            toast.success("Verification email resent! Check your inbox.");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to resend verification");
        },
    });

    return { resend, isPending };
}
