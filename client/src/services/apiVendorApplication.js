import { PAGE_SIZE } from "../utils/constants.js";
import axiosInstance from "./axios.js";

export async function getVendorApplications({
  page,
  limit = PAGE_SIZE,
  search,
  status,
  sortBy,
}) {
  try {
    const params = { page, limit };
    if (search && search.length >= 2) {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    const { data } = await axiosInstance.get("/vendors", {
      params,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get vendor applications",
    );
  }
}

export async function getVendorApplicationById(vendorId) {
  try {
    const res = await axiosInstance.get(`/vendors/${vendorId}`);
    // console.log("RAW API response:", res.data);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to get vendor application details",
    );
  }
}

export async function acceptVendorApplicationStatus(vendorId, status) {
  try {
    const { data } = await axiosInstance.patch(`vendors/${vendorId}/approve`, {
      status,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update application status",
    );
  }
}

export async function rejectVendorApplication(vendorId, reason) {
  try {
    const { data } = await axiosInstance.patch(`vendors/${vendorId}/reject`, {
      reason,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to reject application",
    );
  }
}

export async function updateVendorApplicationStatus(vendorId, status) {
  try {
    const { data } = await axiosInstance.patch(`vendors/${vendorId}/approve`, {
      status,
    });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update application status",
    );
  }
}
