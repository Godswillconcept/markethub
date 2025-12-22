// import { useQuery } from "@tanstack/react-query";
// import { getVendorProductByOverview } from "../../services/apiVendors";


// export function useVendorProductDetail(productId) {
//     const { data, isLoading, error } = useQuery({
//         queryKey: ["vendorProductDetail", productId],
//         queryFn: () => getVendorProductByOverview(productId),
//         enabled: !!productId, // ensures it only runs if productId exists
//         retry: 1, // optional: limit retry attempts

//     });

//     return { data, isLoading, error };
// }

import { useQuery } from "@tanstack/react-query";
import { getVendorProductByOverview } from "../../services/apiVendors.js";

export function useVendorProductDetail(productId) {
    const {
        data: productData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["vendorProductDetail", productId],
        queryFn: () => getVendorProductByOverview(productId),
        enabled: !!productId, // only fetch if productId exists
        retry: 1,
    });

    // ✅ Destructure right here (if data exists)
    const product = productData
        ? {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            discountedPrice: productData.discounted_price,
            sku: productData.sku,
            category: productData.Category,
            description: productData.description,
            availability: productData.status,
            thumbnail: productData.thumbnail,
            images: productData.images,
            vendor: productData.vendor,
            createdAt: productData.created_at,
            reviews: productData.reviews,
            soldUnit: productData.sold_unit,
            impressions: productData.impressions,


        }
        : null;

    // ✅ Return clean structured data
    return { product, isLoading, error };
}
