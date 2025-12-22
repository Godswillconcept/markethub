import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createReviews, getUserProductReview, getReviews } from "../../services/apiProduct.js";

// Hook to fetch a review by ID
export function useReviewById(reviewId, enabled = true) {
    console.group("🔍 useReviewById Hook");
    console.log("Review ID:", reviewId);
    console.log("Enabled:", enabled);
    console.groupEnd();

    return useQuery({
        queryKey: ["review", reviewId],
        queryFn: async () => {
            console.group("📡 FETCHING REVIEW BY ID");
            console.log("Fetching review:", reviewId);

            try {
                const data = await getUserProductReview(reviewId);
                console.log("✅ Review fetched successfully:", data);
                console.groupEnd();
                return data;
            } catch (error) {
                console.error("❌ Error fetching review:", error);
                console.groupEnd();
                throw error;
            }
        },
        enabled: enabled && !!reviewId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        onError: (error) => {
            console.error("❌ useReviewById Query Error:", error);
        },
        onSuccess: (data) => {
            console.log("✅ useReviewById Query Success:", data);
        }
    });
}

// Hook to create a new review
export function useCreateReview() {
    const queryClient = useQueryClient();

    console.log("🆕 useCreateReview Hook initialized");

    return useMutation({
        mutationFn: async (reviewData) => {
            console.group("📤 CREATING NEW REVIEW");
            console.log("Review Data:", reviewData);

            try {
                const response = await createReviews(reviewData);
                console.log("✅ Review created successfully:", response);
                console.groupEnd();
                return response;
            } catch (error) {
                console.error("❌ Error creating review:", error);
                console.log("Error details:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                console.groupEnd();
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            console.group("✅ CREATE REVIEW SUCCESS");
            console.log("Response Data:", data);
            console.log("Variables:", variables);

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order"] });
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });

            console.log("🔄 Invalidated queries: orders, order, reviews, products");
            console.groupEnd();

            toast.success("Review submitted successfully!");
        },
        onError: (error, variables) => {
            console.group("❌ CREATE REVIEW ERROR");
            console.error("Error:", error);
            console.log("Variables:", variables);
            console.log("Error Response:", error.response?.data);
            console.groupEnd();

            const errorMessage = error.response?.data?.message || "Failed to submit review";
            toast.error(errorMessage);
        },
        onMutate: (variables) => {
            console.log("⏳ CREATE REVIEW MUTATION STARTED");
            console.log("Variables:", variables);
        }
    });
}

// Removed useUpdateReview and useDeleteReview hooks for one-time review system
// Users can only create reviews, not edit or delete them

// Default export for backward compatibility
export default function useReviews(productId) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["reviews", productId],
        queryFn: () => getReviews(productId),
        enabled: !!productId, // only run if productId exists
    });

    // normalize data
    console.log("useReviews hook data:", data);
    const reviews = data?.reviews || [];

    // Compute average rating
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    // Compute rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
        return { stars: star, count, percentage };
    });

    return {
        reviews,
        averageRating,
        ratingDistribution,
        isLoading,
        error,
    };
}
