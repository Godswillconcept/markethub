import axios from "./axios";

export const getPendingReviews = async (params) => {
  const response = await axios.get("/reviews/pending", { params });
  return response.data;
};

export const createReview = async (data) => {
  const response = await axios.post("/reviews", data);
  return response.data;
};

export const getReviews = async (params) => {
  const response = await axios.get("/reviews", { params });
  return response.data;
};

export const getReviewsByProduct = async (productId, params) => {
  const response = await axios.get(`/products/${productId}/reviews`, { params });
  return response.data;
};
