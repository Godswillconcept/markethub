import { useMutation } from "@tanstack/react-query";
import { addToWishList as addToWishListApi } from "../../services/apiProduct.js";
import toast from "react-hot-toast";

export function useAddWishList() {
    const { mutate: addToWishList, isLoading: isAddingToWishList, isError, error, isSuccess } = useMutation({
        mutationFn: async (productId) => {
            const response = await addToWishListApi(productId);
            return response;
        },
        onSuccess: () => {
            toast.success('Product added to wishlist successfully');
        },
        onError: () => {
            toast.error('Failed to add product to wishlist');
        },
    });

    return {
        addToWishList,
        isAddingToWishList,
        isError,
        error,
        isSuccess
    };
}