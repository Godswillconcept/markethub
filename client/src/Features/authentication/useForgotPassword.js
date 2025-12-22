import { forgotPassword as forgotPasswordApi } from "../../services/apiAuth.js";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Key for localStorage
const RESET_TIMER_KEY = "forgotPasswordTimer";
const RESET_EMAIL_KEY = "resetEmail"; // New key for storing email

export function useForgotPassword() {

    const { mutate: forgotPassword, isPending, isError, error } = useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: (response, variables) => { // 'variables' contains the data passed to mutate (i.e., {email})
            console.log(response);
            toast.success("Password reset email sent. Check your inbox!");

            // 1. Set the timestamp for the 15-minute timeout
            const expiryTime = Date.now() + 15 * 60 * 1000; // 15 minutes in milliseconds
            localStorage.setItem(RESET_TIMER_KEY, expiryTime);

            // 2. Store the successfully submitted email
            localStorage.setItem(RESET_EMAIL_KEY, variables.email);

            // Note: The timer logic is now handled in the component via a separate hook (as discussed previously)
        },
        onError: () => {
            toast.error("Verification failed. Please check the email and try again.");
            // Clear any old timer/email if an error occurs
            localStorage.removeItem(RESET_TIMER_KEY);
            localStorage.removeItem(RESET_EMAIL_KEY);
        },
    });

    // Function to check if the timer is active
    const getTimerExpiry = () => {
        const expiryTime = localStorage.getItem(RESET_TIMER_KEY);
        if (expiryTime && Date.now() < parseInt(expiryTime, 10)) {
            return parseInt(expiryTime, 10);
        }
        // Also clean up localStorage if the timer has already expired
        if (expiryTime && Date.now() >= parseInt(expiryTime, 10)) {
            localStorage.removeItem(RESET_TIMER_KEY);
        }
        return null;
    };

    const clearTimer = () => {
        localStorage.removeItem(RESET_TIMER_KEY);
        localStorage.removeItem(RESET_EMAIL_KEY); // Clear email too
    }

    return {
        forgotPassword,
        isPending,
        isError,
        error,
        getTimerExpiry,
        clearTimer
    };
}