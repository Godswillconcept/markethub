import axiosInstance from "./axios.js";

export async function getStats({ year, month } = {}) {
    try {
        const params = {};
        if (year !== undefined) params.year = year;
        if (month !== undefined) params.month = month;

        const { data } = await axiosInstance.get('/admin/dashboard/metrics', { params });

        return data?.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get stats");
    }
}

export async function getTopSellingItems({ year, month } = {}) {
    try {
        const params = {};
        if (year !== undefined) params.year = year;
        if (month !== undefined) params.month = month;

        const { data } = await axiosInstance.get('/admin/dashboard/top-selling-items', { params });

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling items");
    }
}

export async function getTopSellingVendors({ year, month } = {}) {
    try {
        const params = {};
        if (year !== undefined) params.year = year;
        if (month !== undefined) params.month = month;

        const { data } = await axiosInstance.get('/admin/dashboard/top-selling-vendors', { params });
        console.log("top selling vendors", data.data);


        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling vendors");
    }
}

export async function recentOrders() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/recent-orders');

        return data?.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get recent orders");
    }
}

export async function getTopCategories({ year, month } = {}) {
    try {
        const params = {};
        if (year !== undefined) params.year = year;
        if (month !== undefined) params.month = month;

        const { data } = await axiosInstance.get('/admin/dashboard/top-categories', { params });

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get top selling categories");
    }
}

export async function getSalesStats() {
    try {
        const { data } = await axiosInstance.get('/admin/dashboard/sales-stats')

        return data?.data
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get sales stats");
    }
}