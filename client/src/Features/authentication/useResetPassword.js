import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { forgotPasswordReset } from "../../services/apiAuth.js"; // Assuming your API function is here
import toast from "react-hot-toast";

const RESET_EMAIL_KEY = "resetEmail";

/**
 * React Query hook to handle the final password reset API call.
 * This hook expects a payload like { email, password, passwordConfirm, reset_token }.
 */
export function useResetPassword() {
    const navigate = useNavigate();

    const {
        mutate: resetPassword,
        isPending: isResetting,
        isError: isResetError,
        error: resetError
    } = useMutation({
        mutationFn: forgotPasswordReset,
        onSuccess: () => {
            // Clear the stored email after successful reset
            localStorage.removeItem(RESET_EMAIL_KEY);

            toast.success("Password reset successful! Please log in.");
            // Navigate the user to the login page
            navigate("/login");
        },
        onError: (err) => {
            console.error(err);
            toast.error(err.message || "Failed to reset password. Token may be invalid or expired.");
        },
    });

    return { resetPassword, isResetting, isResetError, resetError };
}