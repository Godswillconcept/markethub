import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createReviews, deleteReview, getUserProductReview, updateReviews } from "../../services/apiProduct.js";
// import {
//     createReviews,
//     updateReviews,
//     getReviewById,
//     getUserProductReview,
//     deleteReview
// } from "../services/apiProduct";

// Hook to fetch a review by ID
export function useReviewById(reviewId, enabled = true) {
    return useQuery({
        queryKey: ["review", reviewId],
        queryFn: () => getUserProductReview(reviewId),
        enabled: enabled && !!reviewId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook to fetch user's review for a specific product
export function useUserProductReview(productId, enabled = true) {
    return useQuery({
        queryKey: ["userReview", productId],
        queryFn: () => getUserProductReview(productId),
        enabled: enabled && !!productId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false, // Don't retry if no review exists
    });
}

// Hook to create a new review
export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewData) => createReviews(reviewData),
        onSuccess: (data, variables) => {
            toast.success("Review submitted successfully!");

            // Invalidate relevant queries
            queryClient.invalidateQueries(["reviews", variables.product_id]);
            queryClient.invalidateQueries(["userReview", variables.product_id]);
            queryClient.invalidateQueries(["orders"]);
            queryClient.invalidateQueries(["order"]);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "Failed to submit review";
            toast.error(errorMessage);
        },
    });
}

// Hook to update an existing review
export function useUpdateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, reviewData }) => updateReviews(reviewData, reviewId),
        onSuccess: (data, variables) => {
            toast.success("Review updated successfully!");

            // Invalidate relevant queries
            queryClient.invalidateQueries(["review", variables.reviewId]);
            queryClient.invalidateQueries(["reviews", variables.reviewData.product_id]);
            queryClient.invalidateQueries(["userReview", variables.reviewData.product_id]);
            queryClient.invalidateQueries(["orders"]);
            queryClient.invalidateQueries(["order"]);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "Failed to update review";
            toast.error(errorMessage);
        },
    });
}

// Hook to delete a review
export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewId) => deleteReview(reviewId),
        onSuccess: () => {
            toast.success("Review deleted successfully!");

            // Invalidate relevant queries
            queryClient.invalidateQueries(["reviews"]);
            queryClient.invalidateQueries(["userReview"]);
            queryClient.invalidateQueries(["orders"]);
            queryClient.invalidateQueries(["order"]);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete review";
            toast.error(errorMessage);
        },
    });
}