import { PAGE_SIZE } from "../utils/constants.js";
import axiosInstance from "./axios.js";

export async function getVendors({ page, limit = 10 }) {
    try {
        const { data } = await axiosInstance.get("/vendors", {
            params: { page, limit },
        });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendors");
    }
}

export async function getVendorById(vendorId) {
    try {
        const { data } = await axiosInstance.get(`/vendors/${vendorId}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor details");
    }
}

export async function getVendorProducts(vendorId, { page, limit = PAGE_SIZE }) {
    try {
        const { data } = await axiosInstance.get(`products/vendor/${vendorId}`, {
            params: { page, limit },
        });

        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor products");
    }
}

export async function getVendorProductByOverview(productId) {
    try {
        const { data } = await axiosInstance.get(`products/${productId}/analytics`);
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor product details");
    }
}

// export async function getAdminProductAnalysis(productId) {
//     try {
//         const { data } = await axiosInstance.get(`/admin/products/${productId}/analytics`);

//         console.log("Admin product detail api", data);

//         return data.data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to get product by id");
//     }
// }

export async function followVendorList({ page, limit = PAGE_SIZE }) {
    try {
        const { data } = await axiosInstance.get("/vendors/user/following", {
            params: { page, limit },
        });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get follow vendor list");
    }
}

export async function followVendor(vendorId) {
    try {
        const { data } = await axiosInstance.post(`/vendors/${vendorId}/follow`, {
            vendorId,
        });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to follow vendor");
    }
}

export async function unfollowVendor(vendorId) {
    try {
        const { data } = await axiosInstance.delete(`/vendors/${vendorId}/follow`, {
            vendorId,
        });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to unfollow vendor");
    }
}

export async function getVendorDashBoardProducts({ page, limit = PAGE_SIZE, search = "", status = "" }) {
    try {
        const params = { page, limit };
        if (search && search.length >= 2) {
            params.search = search;
        }
        if (status && status !== "All") {
            params.status = status;
        }
        const { data } = await axiosInstance.get("/dashboard/vendor/products", {
            params,
        });
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor dashboard products");
    }
}

export async function getVendorDashboardStats() {
    try {
        const { data } = await axiosInstance.get("/dashboard/vendor/metrics");
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor dashboard stats");
    }
}

export async function getVendorEarnings({ page, limit = PAGE_SIZE }) {
    try {
        const { data } = await axiosInstance.get("/dashboard/vendor/earnings/breakdown", {
            params: { page, limit },
        });
        return {
            data: data.data,
            pagination: {
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalItems: data.totalItems,
                hasNextPage: data.currentPage < data.totalPages,
                hasPreviousPage: data.currentPage > 1
            }
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor earnings");
    }
}

export async function getProductAnalytics(productId) {
    try {
        const { data } = await axiosInstance.get(`/products/${productId}/analytics`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get product analytics");
    }
}

export async function getVendorProfile() {
    try {
        const { data } = await axiosInstance.get("/vendors/vendor/profile");
        return data; // adjusted based on user provided JSON: { status: "success", data: { ... } }
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendor profile");
    }
}

export async function updateVendorProfile(profileData) {
    try {
        const isFormData = profileData instanceof FormData;
        const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};

        const { data } = await axiosInstance.patch("/vendors/vendor/profile", profileData, config);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update vendor profile");
    }
}