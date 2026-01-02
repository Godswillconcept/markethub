import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtil.js";
import { createReview } from "../../services/apiReview";
import { getProductById } from "../../services/apiProduct";
import Spinner from "../../ui/Spinner.jsx";

export default function PendingRateReviewsPage() {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State from navigation or fallback to null (will fetch)
  const [rating, setRating] = useState(0);
  const [reviews, setReview] = useState("");

  // Check if we have product data from navigation state
  const initialProduct = location.state?.product;

  // Fetch product if not available in state
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId),
    enabled: !initialProduct, // Only fetch if we don't have it
  });

  const product = initialProduct || productData?.data;

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      // Invalidate pending reviews to remove this item from the list
      queryClient.invalidateQueries({ queryKey: ["pendingReviews"] });
      navigate("/settings/pending-reviews");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    const payload = {
      product_id: productId,
      rating,
      comment: reviews,
    };

    submitReview(payload);
  };

  if (isLoadingProduct) return <Spinner />;

  if (!product) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-md border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-medium text-gray-900">Product not found</p>
        <button
          onClick={() => navigate("/settings/pending-reviews")}
          className="mt-4 text-sm text-orange-500 hover:underline"
        >
          Back to Pending Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl rounded-md border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="mb-6 text-xl font-semibold">Rate & Review</h1>

      <p className="mb-3 text-sm font-medium">
        SELECT THE STARS TO RATE THE PRODUCT
      </p>
      <div className="mb-6 flex items-center gap-4">
        <img
          src={getImageUrl(product.image || product.thumbnail)}
          alt={product.title || product.name || "Product"}
          className="h-20 w-20 rounded-md border object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMHB4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2MxYzVjYiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
          }}
        />
        <div>
          <h2 className="text-sm font-medium text-gray-800 md:text-base">
            {product.title || product.name || "Product Title Not Available"}
          </h2>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                className={`h-6 w-6 cursor-pointer ${
                  star <= rating
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm font-medium">LEAVE A REVIEW</p>

        <div>
          <label className="text-xs text-gray-600">Detailed Review</label>
          <textarea
            placeholder="Tell us more about your rating!"
            value={reviews}
            onChange={(e) => setReview(e.target.value)}
            className="mt-1 h-32 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-orange-500 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:bg-gray-400"
          disabled={rating === 0 || isPending}
        >
          {isPending ? "Submitting..." : "Submit your review"}
        </button>
      </form>
    </div>
  );
}
