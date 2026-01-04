import { PAGE_SIZE } from "../utils/constants.js";
import axiosInstance from "./axios.js";

export async function getVendorsList({ page, limit = PAGE_SIZE, search, status, sortBy, sortOrder }) {
  try {
    const params = { page, limit };
    if (search && search.length >= 2) {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    if (sortBy && sortBy !== "all") {
      params.sortBy = sortBy;
    }
    if (sortOrder) {
      params.sortOrder = sortOrder;
    }
    const response = await axiosInstance.get(
      "/admin/dashboard/vendor-onboarding-stats",
      {
        params,
      },
    );
    // Return data and total from the response structure
    return {
      data: response.data.data,
      total: response.data.pagination?.totalItems || 0,
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get vendor applications",
    );
  }
}

export async function getAdminVendorById(vendorId) {
  try {
    const { data } = await axiosInstance.get(
      `/admin/dashboard/vendor-overview/${vendorId}`,
    );
    return data?.data || {};
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
      "Failed to get vendor application details",
    );
  }
}
