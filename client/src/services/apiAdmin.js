import axiosInstance from "./axios.js";

export async function getStats() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/metrics');

        return data?.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get stats");
    }
}

export async function getTopSellingItems() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/top-selling-items');

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling items");
    }
}

export async function getTopSellingVendors() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/top-selling-vendors');
        console.log("top selling vendors", data.data);


        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling vendors");
    }
}

export async function recentOrders() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/recent-orders');

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling categories");
    }
}

export async function getTopCategories() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/top-categories');

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling categories");
    }
}

export async function getSalesStats() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/sales-stats')

        return data.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling categories");
    }
}