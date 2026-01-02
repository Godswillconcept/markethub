import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BiMap, BiCheckCircle } from "react-icons/bi";
import { FiChevronLeft } from "react-icons/fi";
import { useOrderDetail } from "./useDetailOrder.js";
import ProductUpdateModal from "./ProductUpdateModal.jsx";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtil.js";
import { formatDateGB } from "../../utils/helper.js";

function OrderDetailPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [isProductUpdateModalOpen, setIsProductUpdateModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch order details based on orderId from URL
    const { orderDetail: order, isLoading, error } = useOrderDetail(orderId, true);

    // Monitor order data changes
    useEffect(() => {
        // Handle payment status from query parameters
        const queryParams = new URLSearchParams(location.search);
        const paymentStatus = queryParams.get("payment");
        const message = queryParams.get("message");

        if (paymentStatus === "success") {
            toast.success("Payment verified successfully!");
            // Clean up the URL by removing the query params
            navigate(location.pathname, { replace: true });
        } else if (paymentStatus === "failed") {
            toast.error(message || "Payment verification failed.");
            // Clean up the URL
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, location.pathname, navigate]);

    // Use the centralized formatDateGB function from utils

    const handleBack = () => {
        const from = location.state?.from || "/settings/orders";
        const search = location.state?.search || "";
        navigate(`${from}${search}`, { replace: true });
    };

    const handleReviewProduct = (product) => {
        // For one-time review system, don't allow editing
        if (product.review_id != null) {
            toast.error("This product has already been reviewed");
            return;
        }

        setSelectedProduct(product);
        setIsProductUpdateModalOpen(true);
    };

    // Check if order is delivered
    const isDelivered = order?.order_status === "delivered";

    // Monitor modal state changes
    useEffect(() => {
        // Removed console logging for production
    }, [isProductUpdateModalOpen, selectedProduct]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <p className="text-red-600">Failed to load order details. Please try again.</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!order || !order.id) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <p className="text-gray-600">Order not found.</p>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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

    // Calculate total items count
    const totalItems = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

    // Format address
    const deliveryAddress = address.address_line
        ? `${address.address_line}, ${address.city}, ${address.state}, ${address.country}`
        : "No address available";

    // Format date
    const orderDate = order.order_date ? formatDateGB(order.order_date) : "N/A";

    // Get current step index
    const statusSteps = {
        "processing": 0,
        "shipped": 1,
        "out-for-delivery": 2,
        "delivered": 3,
    };
    const steps = ["Processing", "Shipped", "Out for delivery", "Delivered"];
    const currentStepIndex = statusSteps[order.order_status] || 0;

    // Format price
    const formatCurrency = (price) => {
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? "$0.00" : `$${numPrice.toFixed(2)}`;
    };

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <FiChevronLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Back to Orders</span>
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Order #{order.order_number || order.id}
                        </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${order.order_status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.order_status === "shipped"
                                    ? "bg-blue-100 text-blue-700"
                                    : order.order_status === "out-for-delivery"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                        >
                            {order.order_status === "delivered" && (
                                <BiCheckCircle className="h-4 w-4" />
                            )}
                            {order.order_status?.replace("-", " ") || "Processing"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p className="text-gray-800">{orderDate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Order Status</p>
                                    <p className="text-gray-800 capitalize">
                                        {order.order_status?.replace("-", " ") || "Processing"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Status</p>
                                    <p className="text-gray-800 capitalize">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${order.payment_status === "paid"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {order.payment_status || "N/A"}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="text-gray-800 capitalize">
                                        {order.payment_method || "N/A"}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Total Items</p>
                                    <p className="text-gray-800">{totalItems} item(s)</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Progress */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Status
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {steps.map((step, i) => {
                                    const isActive = currentStepIndex >= i;
                                    return (
                                        <div key={step} className="flex items-center gap-2">
                                            <span
                                                className={`text-xs md:text-sm font-medium ${isActive ? "text-green-600" : "text-gray-400"
                                                    }`}
                                            >
                                                {step}
                                            </span>
                                            {i < steps.length - 1 && (
                                                <span
                                                    className={`h-1 w-8 md:w-12 rounded ${isActive ? "bg-green-500" : "bg-gray-300"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Order Items
                                </h2>
                                {isDelivered && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                        <BiCheckCircle className="h-4 w-4" />
                                        <span className="font-medium">Ready to review</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                {items.map((item) => {
                                    // Check if this product has been reviewed
                                    const hasReview = item.review_id != null;

                                    // Item rendering

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <img
                                                    src={
                                                        getImageUrl(item.product?.images?.[0]?.image_url) ||
                                                        getImageUrl(item.product?.thumbnail) ||
                                                        "/placeholder.png"
                                                    }
                                                    alt={item.product?.name}
                                                    className="h-16 w-16 rounded object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder.png";
                                                    }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {item.product?.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {item.vendor?.store?.business_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity}
                                                    </p>
                                                    {/* DEBUG INFO - Remove in production */}
                                                    <p className="text-xs text-purple-600 mt-1">
                                                        Review ID: {item.review_id || "None"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className="text-right flex-1 sm:flex-initial">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(item.price)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Subtotal: {formatCurrency(item.sub_total)}
                                                    </p>
                                                </div>
                                                {isDelivered && !hasReview && (
                                                    <button
                                                        onClick={() => handleReviewProduct(item)}
                                                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
                                                    >
                                                        Write Review
                                                    </button>
                                                )}
                                                {isDelivered && hasReview && (
                                                    <div className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-green-50 text-green-700 border-2 border-green-200">
                                                        <BiCheckCircle className="h-4 w-4" />
                                                        Reviewed
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Customer & Summary */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Customer Information
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-gray-800">
                                        {user.first_name} {user.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-gray-800">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-gray-800">{user.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Delivery Address
                            </h2>
                            <p className="flex items-start gap-2 text-gray-800">
                                <BiMap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{deliveryAddress}</span>
                            </p>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Order Summary
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="text-gray-800">
                                        {formatCurrency(order.summary?.subtotal || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="text-gray-800">
                                        {formatCurrency(details.shipping_cost || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax:</span>
                                    <span className="text-gray-800">
                                        {formatCurrency(details.tax_amount || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span className="text-gray-800">Total:</span>
                                    <span className="text-green-600">
                                        {formatCurrency(order.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>
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