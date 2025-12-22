import { PAGE_SIZE } from "../utils/constants.js";
import axiosInstance from "./axios.js";

// api endpoint for get products
export async function getProducts({ page }) {
    try {
        const { data } = await axiosInstance.get("/products", {
            params: { page, limit: PAGE_SIZE }, // backend should handle this
        });

        // Expected API response: { success, total, data: [] }
        return { data: data.data, total: data.total };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get products");
    }
}

// api endpoint for get new arrival products
export async function getNewArrival() {
    try {
        const { data } = await axiosInstance.get("/dashboard/new-arrivals");
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get new arrival products");
    }
}

export async function getYouMayLike() {
    try {
        const { data } = await axiosInstance.get("/suggestions/random");
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get you may like products");
    }
}
  
// api endpoint for trending products
export async function getTrendingProducts() {
    try {
        const { data } = await axiosInstance.get("/dashboard/trending-now");
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get trending products");
    }
}

// services/apiProduct.js
export async function getAllProductsNoPagination() {
    try {
        const { data } = await axiosInstance.get("/products");
        // Expected API: { success, data: [] }
        return data.data; // just return the array of products
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get all products");
    }
}


// api endpoint for get products by category
export async function getProductsByCategory(categoryId, page) {
    try {
        const { data } = await axiosInstance.get(
            `/categories/${categoryId}/products`,
            {
                params: { page, limit: PAGE_SIZE },
            }
        );

        return {
            products: data?.data || [],
            pagination: { total: data?.total || 0 },
            category: categoryId
        };
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to get products by category"
        );
    }
}

// api endpoint for get product by id
export async function getProductById(productId) {
    try {
        const { data } = await axiosInstance.get(`/products/${productId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get product by id");
    }
}

export async function getReviews(productId, { page } = {}) {
    try {
        const { data } = await axiosInstance.get(`/products/${productId}/reviews`, {
            params: { page, limit: PAGE_SIZE },
        });
        return { 
            reviews: data.data || [],
            total: data.total || 0,
            page: data.page || 1,
            product: data.product || null,
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get reviews");
    }
}

// src/services/apiProduct.js
export async function searchProducts(searchQuery, page = 1) {
    try {
        const { data } = await axiosInstance.get(`/products`, {
            params: { search: searchQuery, page, limit: PAGE_SIZE },
        });

        return {
            products: data?.data || [],
            pagination: { total: data?.total || 0 },
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to search products");
    }
}

export async function addToWishList(productId) {
    try {
        const { data } = await axiosInstance.post(`/wishlist/items/${productId}`);
        console.log("wish list added", data);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to add to wishlist");
    }
}

export async function getRecentlyViewedProducts() {
    try {
        const { data } = await axiosInstance.get(`/products/recent`);
        console.log(data);
        
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get recently visited products");
    }
}

export async function getWishList(){
    try {
        const { data } = await axiosInstance.get(`/wishlist`);
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get wishlist");
    }
}

export async function removeFromWishList(productId) {
    try{
         await axiosInstance.delete(`/wishlist/items/${productId}`);
        console.log("wish list removed");
        return true;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to remove from wishlist");
    }
}
// Updated createReviews function
export async function createReviews(credentials) {
    const { data } = await axiosInstance.post("/reviews", credentials);
    return data;
}

// Updated updateReviews function
export async function updateReviews(credentials, reviewId) {
    const { data } = await axiosInstance.put(`/reviews/${reviewId}`, credentials);
    return data;
}

// Get user's review for a specific product
export async function getUserProductReview(reviewId) {
    try {
        const { data } = await axiosInstance.get(`/reviews/${reviewId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get user review");
    }
}

// Delete review (if needed)
export async function deleteReview(reviewId) {
    try {
        const { data } = await axiosInstance.delete(`reviews/${reviewId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete review");
    }
}
// export async function searchProducts(searchQuery, page) {
//     try {
//         const { data } = await axiosInstance.get(`/products`, {
//             params: { searchQuery, page, limit: PAGE_SIZE },
//         });
//         return {
//             products: data?.data || [],
//             pagination: { total: data?.total || 0 },
//         };
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to search products");
//     }
// }






















































        // api endpoint for get products
        // export async function getProducts() {
        //     try {
        //         const { data } = await axiosInstance.get("/products");
        //         console.log(data);
        //         return data;
        
        //         // return data;
        //     } catch (error) {
        //         throw new Error(error.response?.data?.message || "Failed to get products");
        //     }
        // }
        
        // services/apiProduct.js
        // export async function getProducts(page = 1, limit = 10) {
        //     try {
        //         const { data } = await axiosInstance.get(`/products?page=${page}&limit=${limit}`);
        //         return data; // { success, count, total, data: [] }
        //     } catch (error) {
        //         throw new Error(error.response?.data?.message || "Failed to get products");
        //     }
        // }