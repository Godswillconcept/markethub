import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout as logoutApi } from "../../services/apiAuth.js";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { clearCart } from "../cart/slice.js";

export function useLogout() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { mutate: logout, isPending } = useMutation({
        mutationFn: logoutApi,
        onSuccess: () => {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            // Removed removing user data from localStorage - React Query handles this

            queryClient.removeQueries({ queryKey: ["user"] });
            queryClient.removeQueries({ queryKey: ["cart"] });
            dispatch(clearCart());

            toast.success("Logout successful");
            navigate("/");
        },
        onError: () => {
            toast.error("Logout failed");
        }
    });
    return { logout, isPending };
}
