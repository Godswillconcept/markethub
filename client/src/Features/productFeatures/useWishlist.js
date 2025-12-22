import { getWishList } from "../../services/apiProduct.js";
import { useQuery } from "@tanstack/react-query";

export function useWishlist() {
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["wishlist"],
        queryFn: getWishList,
    });

    // Transform backend items => UI-friendly structure
    const wishlistItems = data?.items?.map((item) => ({
        id: item.product.id,
        wishlistId: item.id, // actual wishlist row ID (needed for removal)
        name: item.product.name,
        price: item.product.price,
        discounted_price: item.product.discounted_price,
        image: item.product.thumbnail,
        inStock: item.product.status === "active",
        title: item.product.name,
        Category: { name: "Unknown" }, // backend does not give category
    })) || [];

    return { wishlist: wishlistItems, isLoading, isError, error, refetch };
}
