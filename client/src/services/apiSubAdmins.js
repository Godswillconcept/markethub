import { PAGE_SIZE } from "../utils/constants";
import axiosInstance from "./axios";

// Get all Sub-Admins
export async function getSubAdmins({ page, limit = PAGE_SIZE }) {
  try {
    const { data } = await axiosInstance.get("/admin/subadmins", {
      params: { page, limit },
    });
    return data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to get subadmins");
  }
}

// Get Sub-Admin Details by ID
export async function getSubAdminDetails(id) {
  try {
    const { data } = await axiosInstance.get(`/admin/subadmins/${id}`);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get subadmin details",
    );
  }
}

// Create a new Sub-Admin
export async function createSubAdmin(subAdminData) {
  try {
    const { data } = await axiosInstance.post("/admin/subadmins", subAdminData);
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create subadmin",
    );
  }
}

// Update a Sub-Admin
export async function updateSubAdmin({ id, ...subAdminData }) {
  try {
    const { data } = await axiosInstance.patch(
      `/admin/subadmins/${id}`,
      subAdminData,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update subadmin",
    );
  }
}

// update sub-admin permissions
export async function updateSubAdminPermissions({ id, ...permissions }) {
  try {
    const { data } = await axiosInstance.patch(
      `/admin/subadmins/${id}/permissions`,
      permissions,
    );
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update subadmin permissions",
    );
  }
}

// Deactivate Sub-Admin
export async function deactivateSubAdmin(id) {
  try {
    // Assuming a patch request to update the status or a specific endpoint
    // If there is a specific deactivate endpoint, use that.
    // Otherwise, we toggle is_active.
    // Based on user request "deactivate", I'll try a specific endpoint first if common,
    // but generic update is safer.
    // Let's assume PATCH /admin/subadmins/:id with { is_active: false }
    const { data } = await axiosInstance.patch(`/admin/subadmins/${id}`, {
      is_active: false,
    });
    return data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to deactivate subadmin",
    );
  }
}
