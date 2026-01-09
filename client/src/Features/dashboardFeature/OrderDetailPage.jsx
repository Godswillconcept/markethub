import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BiMap,
  BiCheckCircle,
  BiBox,
  BiTime,
  BiXCircle,
  BiPackage,
  BiCreditCard,
  BiUser,
  BiDollar,
  BiShoppingBag,
} from "react-icons/bi";
import { FiChevronLeft, FiStar } from "react-icons/fi";
import { useOrderDetail } from "./useDetailOrder.js";
import ProductUpdateModal from "./ProductUpdateModal.jsx";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtil.js";
import { formatDateGB } from "../../utils/helper.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProductUpdateModalOpen, setIsProductUpdateModalOpen] =
    useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    orderDetail: order,
    isLoading,
    error,
  } = useOrderDetail(orderId, true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get("payment");
    const message = queryParams.get("message");

    if (paymentStatus === "success") {
      toast.success("Payment verified successfully!");
      navigate(location.pathname, { replace: true });
    } else if (paymentStatus === "failed") {
      toast.error(message || "Payment verification failed.");
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const handleBack = () => {
    const from = location.state?.from || "/settings/orders";
    const search = location.state?.search || "";
    navigate(`${from}${search}`, { replace: true });
  };

  const handleReviewProduct = (product) => {
    if (product.review_id != null) {
      toast.error("This product has already been reviewed");
      return;
    }
    setSelectedProduct(product);
    setIsProductUpdateModalOpen(true);
  };

  const isDelivered = order?.order_status === "delivered";

  useEffect(() => {
    // Removed console logging for production
  }, [isProductUpdateModalOpen, selectedProduct]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600">
            Failed to load order details. Please try again.
          </p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order || !order.id) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-gray-600">Order not found.</p>
          <button
            onClick={handleBack}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const details = order.details || {};
  const address = details.address || {};
  const items = order.items || [];
  const user = order.user || {};

  const totalItems = items.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0,
  );

  const deliveryAddress = address.address_line
    ? `${address.address_line}, ${address.city}, ${address.state}, ${address.country}`
    : "No address available";

  const orderDate = order.order_date ? formatDateGB(order.order_date) : "N/A";

  const statusSteps = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };
  const steps = [
    { key: "pending", label: "Pending", icon: <BiTime className="h-5 w-5" /> },
    {
      key: "processing",
      label: "Processing",
      icon: <BiBox className="h-5 w-5" />,
    },
    {
      key: "shipped",
      label: "Shipped",
      icon: <BiPackage className="h-5 w-5" />,
    },
    {
      key: "delivered",
      label: "Delivered",
      icon: <BiCheckCircle className="h-5 w-5" />,
    },
  ];
  const currentStepIndex = statusSteps[order.order_status] || 0;

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <BiTime className="h-4 w-4" />,
        label: "Pending",
      },
      processing: {
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <BiBox className="h-4 w-4" />,
        label: "Processing",
      },
      shipped: {
        color: "bg-indigo-100 text-indigo-700 border-indigo-200",
        icon: <BiPackage className="h-4 w-4" />,
        label: "Shipped",
      },
      delivered: {
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <BiCheckCircle className="h-4 w-4" />,
        label: "Delivered",
      },
      cancelled: {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <BiXCircle className="h-4 w-4" />,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Progress step component
  const ProgressStep = ({ step, index, currentIndex }) => {
    const isCompleted = index < currentIndex;
    const isCurrent = index === currentIndex;

    return (
      <div className="flex flex-1 items-center gap-2">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
            isCompleted
              ? "border-green-500 bg-green-500 text-white"
              : isCurrent
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white text-gray-400"
          }`}
        >
          {isCompleted ? <BiCheckCircle className="h-5 w-5" /> : step.icon}
        </div>
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-400"}`}
          >
            {step.label}
          </p>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`mx-2 h-1 flex-1 rounded ${isCompleted ? "bg-green-500" : "bg-gray-300"}`}
          />
        )}
      </div>
    );
  };

  // Info card component
  const InfoCard = ({ icon, title, children, className = "" }) => (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="text-blue-500">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  // Info row component
  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs tracking-wide text-gray-500 uppercase">{label}</p>
        <p className="mt-0.5 font-medium break-words text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <FiChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Orders</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.order_number || order.id}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Placed on {orderDate}
              </p>
            </div>
          </div>
          <StatusBadge status={order.order_status} />
        </div>

        {/* Order Status Progress */}
        {order.order_status !== "cancelled" && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Order Progress
            </h2>
            <div className="flex items-center justify-between">
              {steps.map((step, i) => (
                <ProgressStep
                  key={step.key}
                  step={step}
                  index={i}
                  currentIndex={currentStepIndex}
                />
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Order Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Order Information */}
            <InfoCard
              icon={<BiPackage className="h-6 w-6" />}
              title="Order Information"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoRow
                  label="Order Status"
                  value={order.order_status?.replace("-", " ") || "Processing"}
                />
                <InfoRow
                  label="Payment Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.payment_status || "N/A"}
                    </span>
                  }
                />
                <InfoRow
                  label="Payment Method"
                  value={order.payment_method || "N/A"}
                  icon={BiCreditCard}
                />
                <InfoRow
                  label="Total Items"
                  value={`${totalItems} item${totalItems !== 1 ? "s" : ""}`}
                  icon={BiShoppingBag}
                />
              </div>
            </InfoCard>

            {/* Order Items */}
            <InfoCard
              icon={<BiShoppingBag className="h-6 w-6" />}
              title="Order Items"
            >
              {isDelivered && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-600">
                  <BiCheckCircle className="h-4 w-4" />
                  <span className="font-medium">
                    Order delivered - Ready to review
                  </span>
                </div>
              )}
              <div className="space-y-4">
                {items.map((item) => {
                  const hasReview = item.review_id != null;
                  // Handle selected_variants - it might be a JSON string or an array
                  let variants = [];
                  if (item.selected_variants) {
                    try {
                      variants =
                        typeof item.selected_variants === "string"
                          ? JSON.parse(item.selected_variants)
                          : item.selected_variants;
                    } catch (e) {
                      variants = [];
                    }
                  }
                  const variantInfo =
                    Array.isArray(variants) && variants.length > 0
                      ? variants.map((v) => `${v.name}: ${v.value}`).join(", ")
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-start justify-between gap-4 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-1 items-center gap-4">
                        <img
                          src={
                            getImageUrl(item.product?.images?.[0]?.image_url) ||
                            getImageUrl(item.product?.thumbnail) ||
                            "/placeholder.png"
                          }
                          alt={item.product?.name}
                          className="h-20 w-20 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-gray-900">
                            {item.product?.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.vendor?.store?.business_name}
                          </p>
                          {variantInfo && (
                            <p className="mt-1 text-xs text-gray-400">
                              {variantInfo}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full items-center gap-3 sm:w-auto">
                        <div className="flex-1 text-right sm:flex-initial">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.sub_total)}
                          </p>
                        </div>
                        {isDelivered && !hasReview && (
                          <button
                            onClick={() => handleReviewProduct(item)}
                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                          >
                            <FiStar className="h-4 w-4" />
                            Review
                          </button>
                        )}
                        {isDelivered && hasReview && (
                          <div className="flex items-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                            <BiCheckCircle className="h-4 w-4" />
                            Reviewed
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </InfoCard>
          </div>

          {/* Right Column - Customer & Summary */}
          <div className="space-y-6">
            {/* Customer Information */}
            <InfoCard
              icon={<BiUser className="h-6 w-6" />}
              title="Customer Information"
            >
              <div className="space-y-3">
                <InfoRow
                  label="Name"
                  value={`${user.first_name} ${user.last_name}`}
                />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone} />
              </div>
            </InfoCard>

            {/* Delivery Address */}
            <InfoCard
              icon={<BiMap className="h-6 w-6" />}
              title="Delivery Address"
            >
              <p className="flex items-start gap-2 text-gray-800">
                <BiMap className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <span className="break-words">{deliveryAddress}</span>
              </p>
            </InfoCard>

            {/* Order Summary */}
            <InfoCard
              icon={<BiDollar className="h-6 w-6" />}
              title="Order Summary"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.summary?.subtotal || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(details.shipping_cost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(details.tax_amount || 0)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-3">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      {/* Product Review Modal */}
      <ProductUpdateModal
        isOpen={isProductUpdateModalOpen}
        onClose={() => {
          setIsProductUpdateModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        orderId={order.id}
      />
    </>
  );
}

export default OrderDetailPage;
