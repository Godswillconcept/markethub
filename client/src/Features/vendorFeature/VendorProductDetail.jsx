import { useState } from "react";

import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, Star, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useForm, Controller } from "react-hook-form";
import InputField from "../../ui/InputField.jsx";
import PhoneInput from "../../ui/PhoneInput.jsx";
import { useVendorProductAnalysis } from "./useVendorProductAnalysis.js";
import { getImageUrl } from "../../utils/imageUtil.js";

function VendorProductDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId: urlProductId } = useParams();
  // Get product from state (passed from dashboard) or use ID from URL params
  const productFromState = location.state?.product;
  const productId = productFromState?.id || urlProductId;

  // Fetch analytics data using the hook
  const { data: productAnalysis, isLoading, isError, error } =
    useVendorProductAnalysis(productId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm();

  // Extract data from the hook response - use state product if available, otherwise use API data
  const product = productFromState || productAnalysis?.product;
  const analytics = productAnalysis?.analytics;
  const reviewsData = analytics?.reviews;

  // Format date
  const formattedDate = product?.date_uploaded
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(product.date_uploaded))
    : "";

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">
            Error: {error?.message || "Failed to load product details"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If no product data is available
  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>No product data available</p>
      </div>
    );
  }

  // Calculate rating distribution percentage
  const totalReviewCount = reviewsData?.total_reviews || 0;

  const ratingDistribution = [
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 },
  ];

  const StarRating = ({ rating, size = "w-4 h-4" }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? "fill-current text-orange-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <button
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              onClick={openModal}
            >
              <MessageCircle className="h-4 w-4" />
              Send Us a Message
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid-rows grid grid-cols-1 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Main Image */}
              <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:h-[395px] lg:w-[950px]">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={getImageUrl(product.thumbnail) || "/placeholder.png"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              {/* Image Thumbnails */}
              <div className="grid grid-cols-3 gap-3 lg:flex lg:w-32 lg:flex-col">
                {product.images?.slice(0, 3).map((image, index) => (
                  <div
                    key={index}
                    className="h-full w-full overflow-hidden rounded-lg border-black shadow-md transition-all lg:h-[124px] lg:w-[216px]"
                  >
                    <img
                      src={getImageUrl(image.image_url)}
                      alt={`Product view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-8">
            {/* Product Overview */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-4 border-b border-gray-100 pb-5 text-lg font-semibold text-gray-900">
                Product Overview
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Product Name
                  </label>
                  <p className="text-lg font-medium text-gray-900">
                    {product.name}
                  </p>
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Category
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {product.category}
                  </p>
                </div>

                {/* Price */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Price
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Date Uploaded */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Date Uploaded
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formattedDate}
                  </p>
                </div>

                {/* Availability */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Availability Status
                  </label>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {product.stock > 0
                      ? `Available (${product.stock} in stock)`
                      : "Out of Stock (0)"}
                  </span>
                </div>

                {/* SKU */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    SKU
                  </label>
                  <p className="font-mono text-sm font-semibold text-gray-900">
                    {product.sku || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 border-b border-gray-100 pb-5 text-xl font-semibold text-gray-900">
                Performance Metrics
              </h2>

              <div className="grid-row grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">
                    Views
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {product.impressions || 0}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">
                    Items Sold
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.total_units_sold || 0}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">
                    Conversion Rate
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.conversion_rate || 0}%
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-500">
                    Revenue
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(analytics?.total_revenue || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Feedback */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-xl font-semibold text-gray-900">
                Customer Feedback
              </h2>

              {/* Rating Summary */}
              <div className="mb-8 flex flex-col items-start gap-6 md:flex-row lg:flex-row">
                {/* Overall Rating Circle */}
                <div className="flex flex-row items-center gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <svg
                      className="h-20 w-20 -rotate-90 transform"
                      viewBox="0 0 36 36"
                    >
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeDasharray={`${(reviewsData?.average_rating || 0) * 20}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">
                        {reviewsData?.average_rating || 0}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <StarRating
                      rating={Math.round(reviewsData?.average_rating || 0)}
                      size="w-3 h-3"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      from {totalReviewCount} reviews
                    </p>
                  </div>
                </div>

                {/* Rating Bars - Keeping static for now as distribution isn't provided */}
                <div className="flex-1">
                  {ratingDistribution.map((item) => (
                    <div
                      key={item.stars}
                      className="mb-2 flex items-center gap-3"
                    >
                      <div className="flex w-8 items-center gap-1">
                        <span className="text-sm text-gray-600">
                          {item.stars}.0
                        </span>
                        <Star className="h-3 w-3 fill-current text-orange-400" />
                      </div>
                      <div className="h-2 min-w-[200px] flex-1 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-gray-800 transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm text-gray-600">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {reviewsData?.recent_reviews?.length > 0 ? (
                  reviewsData.recent_reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={review.user?.profile_image}
                          alt={`${review.user?.first_name} ${review.user?.last_name}`}
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {review.user?.first_name} {review.user?.last_name}
                            </h4>
                            <StarRating rating={review.rating} size="w-3 h-3" />
                          </div>
                          <p className="mb-2 text-sm leading-relaxed text-gray-700">
                            {review.comment}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Intl.DateTimeFormat("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }).format(new Date(review.created_at))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No reviews yet.</p>
                )}
              </div>

              {/* Load More Button */}
              {totalReviewCount > 5 && (
                <div className="mt-8 text-center">
                  <button className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 sm:w-auto lg:w-full">
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Send Message Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden
            />

            {/* Modal Container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="message-title"
              className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
              initial={{ scale: 0.98, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="w-full text-center">
                  <h2
                    id="message-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    Send Us a Message
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Kindly provide the information below.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/5 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* <Field label="Full Name">
                  <input
                    type="text"
                    placeholder="Give us your full name"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    required
                  />
                </Field> */}
                <InputField
                  label="Full Name*"
                  name="full_name"
                  error={errors.full_name?.message}
                >
                  <input
                    type="text"
                    placeholder="Give us your full name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    {...register("full_name")}
                  />
                </InputField>

                <InputField
                  label="Phone Number*"
                  name="phone"
                  error={errors.phone?.message}
                >
                  <Controller
                    name="phone"
                    control={control}
                    rules={{ required: "Phone number is required" }}
                    render={({ field: { value, onChange } }) => (
                      <PhoneInput
                        value={value}
                        onChange={onChange}
                        placeholder="+234"
                        error={errors.phone}
                      />
                    )}
                  />
                </InputField>

                <InputField
                  label="Topic*"
                  name="topic"
                  error={errors.topic?.message}
                >
                  <input
                    type="text"
                    placeholder="Your reason"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    {...register("topic")}
                  />
                </InputField>

                <InputField
                  label="Message"
                  name="message"
                  error={errors.message?.message}
                >
                  <textarea
                    placeholder="Type your message here..."
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                    {...register("message")}
                  />
                </InputField>

                <button
                  type="submit"
                  className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-700 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 hover:from-neutral-900 hover:to-neutral-800 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VendorProductDetail;

// import { useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowLeft, MessageCircle, Star, X } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { useVendorProductDetail } from "./useVendorProductOverview";
// import { formatCurrency } from "../../utils/formatCurrency";
// import { useProductAnalytics } from "./useProductAnalytics";
// import { useUser } from "../authentication/useUser";

// function VendorProductDetail() {
//   const { productId } = useParams();
//   const { product, isLoading, isError, error } =
//     useVendorProductDetail(productId);
//   const { user } = useUser(); // Get user data

//   const navigate = useNavigate();
//   const {
//     handleSubmit,
//     register,
//     formState,
//     reset,
//     setValue,
//     setError,
//     clearErrors,
//   } = useForm({
//     mode: "onChange",
//     defaultValues: {
//       fullName: "",
//       phoneNumber: "",
//       topic: "",
//       message: "",
//     },
//   });

//   const { errors, isValid } = formState;

//   const { analytics, isLoading: isAnalyticsLoading } =
//     useProductAnalytics(productId);

//   // Auto-populate form fields when modal opens and user data is available
//   useEffect(() => {
//     if (user) {
//       const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
//       setValue("fullName", fullName);
//       setValue("phoneNumber", user.phone || "");
//     }
//   }, [user, setValue]);

//   // Format date only when product is available
//   const formattedDate = product?.createdAt
//     ? new Intl.DateTimeFormat("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     }).format(new Date(product.createdAt))
//     : "";

//   // Show loading state
//   if (isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
//       </div>
//     );
//   }

//   // Show error state
//   if (isError) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-500">
//             Error: {error?.message || "Failed to load product details"}
//           </p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-4 rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // If no product data is available
//   if (!product) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <p>No product data available</p>
//       </div>
//     );
//   }

//   const reviews = [
//     {
//       id: 1,
//       name: "Daniel Balablue",
//       rating: 5,
//       comment: "Great fit and quality. Delivery took 2 days.",
//       date: "Feb, 9th 2021 08:57:01 PM",
//       avatar:
//         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
//     },
//     {
//       id: 2,
//       name: "Daniel Balablue",
//       rating: 5,
//       comment: "Color matches the image perfectly!",
//       date: "Feb, 9th 2021 08:57:01 PM",
//       avatar:
//         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
//     },
//   ];

//   const ratingDistribution = [
//     { stars: 5, count: 2823, percentage: 90 },
//     { stars: 4, count: 38, percentage: 12 },
//     { stars: 3, count: 4, percentage: 4 },
//     { stars: 2, count: 0, percentage: 0 },
//     { stars: 1, count: 0, percentage: 0 },
//   ];

//   const StarRating = ({ rating, size = "w-4 h-4" }) => (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((star) => (
//         <Star
//           key={star}
//           className={`${size} ${star <= rating ? "fill-current text-orange-400" : "text-gray-300"
//             }`}
//         />
//       ))}
//     </div>
//   );

//   const onSubmitMessage = (data) => {
//     // Clear any existing errors
//     clearErrors();

//     try {
//       // Handle form submission
//       console.log("Form submitted:", data);

//       // If successful, reset and close modal
//       reset();
//       document.body.style.overflow = "unset";

//       // You can add success toast/notification here
//     } catch (err) {
//       // Handle submission error
//       if (err?.response?.data?.field) {
//         setError(err.response.data.field, {
//           type: "server",
//           message: err.response.data.message,
//         }, { shouldFocus: true });
//       } else {
//         setError("root", {
//           type: "server",
//           message: err.response?.data?.message || "Failed to send message",
//         });
//       }
//     }
//   };

//   const openModal = () => {
//     // Populate fields when opening modal
//     if (user) {
//       const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
//       setValue("fullName", fullName);
//       setValue("phoneNumber", user.phone || "");
//     }
//     document.body.style.overflow = "hidden";
//   };

//   const closeModal = () => {
//     reset();
//     clearErrors();
//     document.body.style.overflow = "unset";
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="border-b border-gray-200 bg-white">
//         <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               <span className="text-sm font-medium">Back</span>
//             </button>

//             <button
//               className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
//               onClick={openModal}
//             >
//               <MessageCircle className="h-4 w-4" />
//               Send Us a Message
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
//         <div className="lg:grid-rows grid grid-cols-1 gap-8">
//           {/* Left Column - Images */}
//           <div className="lg:col-span-2">
//             <div className="flex flex-col gap-4 lg:flex-row">
//               {/* Main Image */}
//               <div className="h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:h-[395px] lg:w-[950px]">
//                 <div className="aspect-[4/3] overflow-hidden">
//                   <img
//                     src={product.thumbnail}
//                     alt="Satin Midi Dress - Rose Gold"
//                     className="h-full w-full object-cover"
//                   />
//                 </div>
//               </div>

//               {/* Image Thumbnails */}
//               <div className="grid grid-cols-3 gap-3 lg:flex lg:w-32 lg:flex-col">
//                 {product.images?.slice(0, 3).map((image, index) => (
//                   <div
//                     key={image.id}
//                     className="h-full w-full overflow-hidden rounded-lg border-black shadow-md transition-all lg:h-[124px] lg:w-[216px]"
//                   >
//                     <img
//                       src={image.image_url}
//                       alt={`Product view ${index + 1}`}
//                       className="h-full w-full object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Product Details */}
//           <div className="space-y-8">
//             {/* Product Overview */}
//             <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
//               <h3 className="mb-4 border-b border-gray-100 pb-5 text-lg font-semibold text-gray-900">
//                 Product Overview
//               </h3>

//               <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-6">
//                 {/* Product Name */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-500">
//                     Product Name
//                   </label>
//                   <p className="text-lg font-medium text-gray-900">
//                     {product.name}
//                   </p>
//                 </div>

//                 {/* Category */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-500">
//                     Category
//                   </label>
//                   <p className="text-sm font-semibold text-gray-900">
//                     {product.category?.name}
//                   </p>
//                 </div>

//                 {/* Price */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-500">
//                     Price
//                   </label>
//                   <p className="text-lg font-semibold text-gray-900">
//                     {formatCurrency(product.price)}
//                   </p>
//                 </div>

//                 {/* Date Uploaded */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-500">
//                     Date Uploaded
//                   </label>
//                   <p className="text-sm font-semibold text-gray-900">
//                     {formattedDate}
//                   </p>
//                 </div>

//                 {/* Availability */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-500">
//                     Availability Status
//                   </label>
//                   <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
//                     Available Now
//                   </span>
//                 </div>

//                 {/* SKU */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-500">
//                     SKU
//                   </label>
//                   <p className="font-mono text-sm font-semibold text-gray-900">
//                     {product.sku}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Performance Metrics */}
//             <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
//               <h2 className="mb-6 border-b border-gray-100 pb-5 text-xl font-semibold text-gray-900">
//                 Performance Metrics
//               </h2>

//               <div className="grid-row grid gap-6 lg:grid-cols-2">
//                 <div>
//                   <label className="mb-1 block text-sm font-medium text-gray-500">
//                     Views
//                   </label>
//                   <p className="text-2xl font-bold text-gray-900">302</p>
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-sm font-medium text-gray-500">
//                     Items Sold
//                   </label>
//                   <p className="text-2xl font-bold text-gray-900">56</p>
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-sm font-medium text-gray-500">
//                     Conversion Rate
//                   </label>
//                   <p className="text-2xl font-bold text-gray-900">21.5%</p>
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-sm font-medium text-gray-500">
//                     Stock Status
//                   </label>
//                   <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
//                     In Stock (120 Left)
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Customer Feedback */}
//             <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
//               <h2 className="mb-6 text-xl font-semibold text-gray-900">
//                 Customer Feedback
//               </h2>

//               {/* Rating Summary */}
//               <div className="mb-8 flex flex-col items-start gap-6 md:flex-row lg:flex-row">
//                 {/* Overall Rating Circle */}
//                 <div className="flex flex-row items-center gap-4">
//                   <div className="relative h-20 w-20 flex-shrink-0">
//                     <svg
//                       className="h-20 w-20 -rotate-90 transform"
//                       viewBox="0 0 36 36"
//                     >
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#f3f4f6"
//                         strokeWidth="2"
//                       />
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#f97316"
//                         strokeWidth="2"
//                         strokeDasharray="90, 100"
//                       />
//                     </svg>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <span className="text-xl font-bold text-gray-900">
//                         4.5
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-2 text-center">
//                     <StarRating rating={5} size="w-3 h-3" />
//                     <p className="mt-1 text-xs text-gray-500">
//                       from 125k reviews
//                     </p>
//                   </div>
//                 </div>

//                 {/* Rating Bars */}
//                 <div className="flex-1">
//                   {ratingDistribution.map((item) => (
//                     <div
//                       key={item.stars}
//                       className="mb-2 flex items-center gap-3"
//                     >
//                       <div className="flex w-8 items-center gap-1">
//                         <span className="text-sm text-gray-600">
//                           {item.stars}.0
//                         </span>
//                         <Star className="h-3 w-3 fill-current text-orange-400" />
//                       </div>
//                       <div className="h-2 min-w-[200px] flex-1 rounded-full bg-gray-200">
//                         <div
//                           className="h-2 rounded-full bg-gray-800 transition-all duration-500"
//                           style={{ width: `${item.percentage}%` }}
//                         />
//                       </div>
//                       <span className="w-12 text-right text-sm text-gray-600">
//                         {item.count}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Individual Reviews */}
//               <div className="space-y-6">
//                 {reviews.map((review) => (
//                   <div
//                     key={review.id}
//                     className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0"
//                   >
//                     <div className="flex items-start gap-3">
//                       <img
//                         src={review.avatar}
//                         alt={review.name}
//                         className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
//                       />
//                       <div className="min-w-0 flex-1">
//                         <div className="mb-2 flex items-center gap-2">
//                           <h4 className="text-sm font-medium text-gray-900">
//                             {review.name}
//                           </h4>
//                           <StarRating rating={review.rating} size="w-3 h-3" />
//                         </div>
//                         <p className="mb-2 text-sm leading-relaxed text-gray-700">
//                           {review.comment}
//                         </p>
//                         <p className="text-xs text-gray-500">{review.date}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Load More Button */}
//               <div className="mt-8 text-center">
//                 <button className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 sm:w-auto lg:w-full">
//                   Load More
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Send Message Modal */}
//       <AnimatePresence>
//         {formState.isSubmitting !== undefined && (
//           <motion.div
//             className="fixed inset-0 z-50 grid place-items-center p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             {/* Backdrop */}
//             <motion.div
//               className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]"
//               onClick={closeModal}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               aria-hidden
//             />

//             {/* Modal Container */}
//             <motion.div
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby="message-title"
//               className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
//               initial={{ scale: 0.98, y: 8, opacity: 0 }}
//               animate={{ scale: 1, y: 0, opacity: 1 }}
//               exit={{ scale: 0.98, y: 8, opacity: 0 }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="mb-6 flex items-start justify-between">
//                 <div className="w-full text-center">
//                   <h2
//                     id="message-title"
//                     className="text-xl font-semibold text-gray-900"
//                   >
//                     Send Us a Message
//                   </h2>
//                   <p className="mt-2 text-sm text-gray-500">
//                     Kindly provide the information below.
//                   </p>
//                 </div>
//                 <button
//                   onClick={closeModal}
//                   className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/5 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
//                   aria-label="Close"
//                 >
//                   <X className="h-5 w-5 text-gray-600" />
//                 </button>
//               </div>

//               {/* Root Error Message */}
//               {errors.root && (
//                 <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
//                   <p className="text-sm text-red-600">{errors.root.message}</p>
//                 </div>
//               )}

//               <form onSubmit={handleSubmit(onSubmitMessage)} className="space-y-4">
//                 <Field label="Full Name" error={errors.fullName?.message}>
//                   <input
//                     type="text"
//                     placeholder="Give us your full name"
//                     className={`w-full rounded-xl border ${errors.fullName ? "border-red-500" : "border-gray-200"
//                       } bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none`}
//                     {...register("fullName", {
//                       required: "Full name is required",
//                     })}
//                     disabled={formState.isSubmitting}
//                   />
//                 </Field>

//                 <Field label="Phone Number" error={errors.phoneNumber?.message}>
//                   <input
//                     type="tel"
//                     placeholder="+234"
//                     className={`w-full rounded-xl border ${errors.phoneNumber ? "border-red-500" : "border-gray-200"
//                       } bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none`}
//                     {...register("phoneNumber", {
//                       required: "Phone number is required",
//                     })}
//                     disabled={formState.isSubmitting}
//                   />
//                 </Field>

//                 <Field label="Topic" error={errors.topic?.message}>
//                   <input
//                     type="text"
//                     placeholder="e.g., Loan, Product Support, Technical Issue"
//                     className={`w-full rounded-xl border ${errors.topic ? "border-red-500" : "border-gray-200"
//                       } bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none`}
//                     {...register("topic", {
//                       required: "Topic is required",
//                     })}
//                     disabled={formState.isSubmitting}
//                   />
//                 </Field>

//                 <Field label="Message" error={errors.message?.message}>
//                   <textarea
//                     placeholder="Type your message here..."
//                     rows={4}
//                     className={`w-full rounded-xl border ${errors.message ? "border-red-500" : "border-gray-200"
//                       } bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none`}
//                     {...register("message", {
//                       required: "Message is required",
//                     })}
//                     disabled={formState.isSubmitting}
//                   />
//                 </Field>

//                 <button
//                   type="submit"
//                   disabled={!isValid || formState.isSubmitting}
//                   className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-700 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 hover:from-neutral-900 hover:to-neutral-800 focus:ring-2 focus:ring-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {formState.isSubmitting ? "Sending..." : "Send Message"}
//                 </button>
//               </form>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// function Field({ label, error, children }) {
//   return (
//     <label className="block">
//       <span className="mb-1 block text-xs font-medium tracking-wide text-gray-600">
//         {label}
//       </span>
//       {children}
//       {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
//     </label>
//   );
// }

// export default VendorProductDetail;
