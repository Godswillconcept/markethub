import axiosInstance from "./axios.js";

export async function submitVendorApplication({ formData, config }) {
  try {
    const { data } = await axiosInstance.post("/vendors", formData, config);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to submit vendor application",
    );
  }
}
