import { PAGE_SIZE } from "../utils/constants.js";
import axiosInstance from "./axios.js";

export async function getAdminOrders({ page, limit = PAGE_SIZE, search, status, sortBy }) {
  try {
    const params = { page, limit };
    // Allow search if it's at least 2 chars OR if it's a number (for Order ID)
    if (search && (search.length >= 2 || !isNaN(search))) {
      params.search = search;
    }
    // Pass status filter if not "All"
    if (status && status !== "All") {
      params.status = status;
    }
    // Pass sortBy if not "All"
    if (sortBy && sortBy !== "All") {
      params.sortBy = sortBy;
    }
    const { data } = await axiosInstance.get("/admin/orders", {
      params,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get admin orders",
    );
  }
}

export async function getAdminOrderDetails(orderId) {
  try {
    const { data } = await axiosInstance.get(`/admin/orders/${orderId}`);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get admin order details",
    );
  }
}
