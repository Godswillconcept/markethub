import axiosInstance from "./axios.js";

export async function sendFeedback(feedbackData) {
    try {
        const isFormData = feedbackData instanceof FormData;
        const config = isFormData
            ? { headers: { "Content-Type": "multipart/form-data" } }
            : {};

        const { data } = await axiosInstance.post("/feedbacks", feedbackData, config);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to send feedback");
    }
}
