import { PAGE_SIZE } from "../utils/constants";
import axiosInstance from "./axios";

export async function getUsersList({ page, limit = PAGE_SIZE }) {
  try {
    const { data } = await axiosInstance.get("/users", {
      params: { page, limit },
    });
    console.log("raw data from Api", data);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get vendor applications",
    );
  }
}

export async function getAdminUserById(userId) {
  try {
    const { data } = await axiosInstance.get(`/users/${userId}`);
    return data?.data || {};
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get user details",
    );
  }
}
