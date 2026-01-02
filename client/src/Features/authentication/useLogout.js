import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout as logoutApi } from "../../services/apiAuth.js";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearCart } from "../cart/slice.js";
import { useAuth } from "./AuthContext.jsx";

export function useLogout() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { logout: authLogout } = useAuth();

    const { mutate: logout, isPending } = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            // Clear all authentication data
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("session_id");
            localStorage.removeItem("session_activity");
            localStorage.removeItem("user");

            // Notify other tabs about logout
            window.localStorage.setItem('auth_event', JSON.stringify({
                type: 'logout',
                timestamp: Date.now()
            }));

            // Clear React Query cache
            queryClient.removeQueries({ queryKey: ["user"] });
            queryClient.removeQueries({ queryKey: ["cart"] });
            
            // Clear Redux cart state
            dispatch(clearCart());

            toast.success("Logout successful");
            navigate("/");
        },
        onError: (error) => {
            console.error('❌ Logout error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Logout failed';
            toast.error(errorMessage);
            
            // Even if API call fails, clear local auth data and use AuthContext logout
            authLogout();
        }
    });
    return { logout, isPending };
}
