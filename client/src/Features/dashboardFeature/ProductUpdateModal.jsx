import { useState, useEffect } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { BiX, BiStar, BiSolidStar, BiLoader } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { useCreateReview } from "./useReviews.js";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtil.js";

function ProductUpdateModal({ isOpen, onClose, product, orderId }) {
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const createReviewMutation = useCreateReview();

  const currentRating = watch("rating");
  const currentComment = watch("comment");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        rating: 0,
        comment: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = (data) => {
    if (!product?.product?.id) {
      toast.error("Product information is missing");
      return;
    }

    const reviewDataToSubmit = {
      product_id: product.product.id,
      order_id: orderId,
      rating: parseInt(data.rating),
      comment: data.comment.trim(),
    };

    createReviewMutation.mutate(reviewDataToSubmit, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleRatingClick = (rating) => {
    setValue("rating", rating, { shouldDirty: true, shouldValidate: true });
  };

  const handleClose = () => {
    onClose();
  };

  const isSubmitting = createReviewMutation.isPending;

  if (!product) {
    return null;
  }

  const productData = product.product || {};
  const vendorData = product.vendor || {};
  const displayRating = hoveredRating || currentRating;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="max-h-[90vh] w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Rate & Review Product
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
            >
              <BiX className="h-6 w-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
            <form
              id="review-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 px-6 py-6"
            >
              {/* Product Info Card */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={
                        getImageUrl(productData.images?.[0]?.image_url) ||
                        getImageUrl(productData.thumbnail) ||
                        "/placeholder.png"
                      }
                      alt={productData.name}
                      className="h-24 w-24 rounded-lg object-cover shadow-md"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900">
                      {productData.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Sold by:{" "}
                      {vendorData.store?.business_name ||
                        vendorData.name ||
                        "Unknown Vendor"}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Qty:</span>{" "}
                        {product.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Price:</span> $
                        {typeof product.price === "number"
                          ? product.price.toFixed(2)
                          : product.price || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-900">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="rounded text-gray-300 transition-all hover:scale-110 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:outline-none"
                      >
                        {displayRating >= star ? (
                          <BiSolidStar className="h-10 w-10 text-yellow-400 drop-shadow" />
                        ) : (
                          <BiStar className="h-10 w-10" />
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-700">
                    {currentRating > 0 ? (
                      <span className="text-yellow-600">
                        {currentRating} out of 5
                      </span>
                    ) : (
                      <span className="text-gray-400">Select rating</span>
                    )}
                  </span>
                </div>
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.rating.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("rating", {
                    required: "Please select a rating",
                    min: { value: 1, message: "Rating must be at least 1" },
                    max: { value: 5, message: "Rating cannot exceed 5" },
                  })}
                />
              </div>

              {/* Review Comment */}
              <div className="space-y-2">
                <label
                  htmlFor="comment"
                  className="block text-base font-semibold text-gray-900"
                >
                  Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment"
                  placeholder="Share your experience with this product. What did you like or dislike?"
                  className={`w-full resize-none rounded-lg border px-4 py-3 shadow-sm transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    errors.comment ? "border-red-300" : "border-gray-300"
                  }`}
                  rows={6}
                  {...register("comment", {
                    required: "Review comment is required",
                    minLength: {
                      value: 10,
                      message: "Review must be at least 10 characters",
                    },
                    maxLength: {
                      value: 500,
                      message: "Review cannot exceed 500 characters",
                    },
                  })}
                />
                <div className="flex items-center justify-between">
                  {errors.comment ? (
                    <p className="text-sm text-red-600">
                      {errors.comment.message}
                    </p>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Minimum 10 characters
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {currentComment?.length || 0}/500
                  </span>
                </div>
              </div>

              {/* Guidelines */}
              <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Review Guidelines
                </h4>
                <ul className="space-y-1.5 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>Be honest and constructive in your feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>
                      Focus on your personal experience with the product
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>
                      Avoid offensive language or personal information
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-blue-600">•</span>
                    <span>Help others make informed purchasing decisions</span>
                  </li>
                </ul>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={isSubmitting || !isDirty || currentRating === 0}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting && <BiLoader className="h-5 w-5 animate-spin" />}
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default ProductUpdateModal;
