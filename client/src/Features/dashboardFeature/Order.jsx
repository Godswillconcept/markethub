import { useState, useMemo, useEffect } from "react";
import { BsArrowLeft, BsBoxSeam, BsTruck, BsCheckCircle, BsClock, BsXCircle } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { useOrders } from "./useOrders.js";
import { formatDateGB } from "../../utils/helper.js";
import { getImageUrl } from "../../utils/imageUtil.js";

function Order() {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const navigate = useNavigate();
    const location = useLocation();

    // Handle payment status from query parameters
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

    const itemsPerPage = 5;

    // Fetch orders with current page and filter
    const { orders, isLoading, error, pagination } = useOrders(
        currentPage,
        itemsPerPage,
        selectedFilter === "all" ? undefined : selectedFilter
    );

    // Calculate stats
    const stats = useMemo(() => {
        return {
            all: pagination?.total || 0,
            processing: orders.filter((o) => o.status === "processing").length,
            shipped: orders.filter((o) => o.status === "shipped").length,
            delivered: orders.filter((o) => o.status === "delivered").length,
        };
    }, [orders, pagination]);

    const formatPrice = (price) => `$${price.toFixed(2)}`;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination?.total_pages) {
            setCurrentPage(page);
        }
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1);
    };

    const handleOrderClick = (order) => {
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;

        navigate(`/settings/orders/${order.id}`, {
            state: {
                from: currentPath,
                search: currentSearch,
                filter: selectedFilter,
                page: currentPage
            }
        });
    };

    // Status badge component
    const StatusBadge = ({ status, paymentStatus }) => {
        const statusConfig = {
            pending: {
                color: "bg-yellow-100 text-yellow-700 border-yellow-200",
                icon: <BsClock className="h-3 w-3" />,
                label: "Pending"
            },
            processing: {
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: <BsBoxSeam className="h-3 w-3" />,
                label: "Processing"
            },
            shipped: {
                color: "bg-indigo-100 text-indigo-700 border-indigo-200",
                icon: <BsTruck className="h-3 w-3" />,
                label: "Shipped"
            },
            delivered: {
                color: "bg-green-100 text-green-700 border-green-200",
                icon: <BsCheckCircle className="h-3 w-3" />,
                label: "Delivered"
            },
            cancelled: {
                color: "bg-red-100 text-red-700 border-red-200",
                icon: <BsXCircle className="h-3 w-3" />,
                label: "Cancelled"
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const paymentColor = paymentStatus === "paid" ? "text-green-600" : "text-yellow-600";

        return (
            <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                    {config.icon}
                    {config.label}
                </span>
                {paymentStatus && (
                    <span className={`text-xs font-medium ${paymentColor}`}>
                        {paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                )}
            </div>
        );
    };

    // Order card component
    const OrderCard = ({ order }) => {
        const productName = order.items?.[0]?.product?.name || "Order";
        const itemCount = order.item_count || order.items?.length || 0;
        const displayName = itemCount > 1 ? `${productName} +${itemCount - 1} more` : productName;
        const productImage = order.items?.[0]?.product?.images?.[0]?.image_url || order.items?.[0]?.product?.thumbnail;

        return (
            <button
                onClick={() => handleOrderClick(order)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
            >
                <div className="flex items-start gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                        <img
                            src={getImageUrl(productImage) || "/placeholder.png"}
                            alt={productName}
                            className="h-16 w-16 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                                e.target.src = "/placeholder.png";
                            }}
                        />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">
                                    {displayName}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Order #{order.order_number || order.id}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <p className="font-bold text-gray-900 text-sm md:text-base">
                                    {formatPrice(order.total_amount)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{formatDateGB(order.order_date)}</span>
                                <span className="text-gray-300">•</span>
                                <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                            </div>
                            <StatusBadge 
                                status={order.order_status || order.status} 
                                paymentStatus={order.payment_status}
                            />
                        </div>
                    </div>
                </div>
            </button>
        );
    };

    // Loading state
    if (isLoading && !orders.length) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <p className="text-red-600">Failed to load orders. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-3 md:hidden mb-6">
                <BsArrowLeft className="h-6 w-6 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                    Order History
                </h1>
            </div>

            <div className="hidden md:block mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Order History
                </h1>
                <p className="mt-1 text-gray-600">View & manage your orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                <button
                    onClick={() => handleFilterChange("all")}
                    className={`rounded-xl p-4 md:p-6 text-center transition-all duration-200 border-2 ${selectedFilter === "all"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                >
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.all}</div>
                    <div className="mt-1 text-xs md:text-sm font-medium text-gray-600">All Orders</div>
                </button>

                <button
                    onClick={() => handleFilterChange("processing")}
                    className={`rounded-xl p-4 md:p-6 text-center transition-all duration-200 border-2 ${selectedFilter === "processing"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                >
                    <BsBoxSeam className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-blue-500" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.processing}</div>
                    <div className="mt-1 text-xs md:text-sm font-medium text-gray-600">Processing</div>
                </button>

                <button
                    onClick={() => handleFilterChange("shipped")}
                    className={`rounded-xl p-4 md:p-6 text-center transition-all duration-200 border-2 ${selectedFilter === "shipped"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                >
                    <BsTruck className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-indigo-500" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.shipped}</div>
                    <div className="mt-1 text-xs md:text-sm font-medium text-gray-600">Shipped</div>
                </button>

                <button
                    onClick={() => handleFilterChange("delivered")}
                    className={`rounded-xl p-4 md:p-6 text-center transition-all duration-200 border-2 ${selectedFilter === "delivered"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        }`}
                >
                    <BsCheckCircle className="h-5 w-5 md:h-6 md:w-6 mx-auto mb-1 text-green-500" />
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.delivered}</div>
                    <div className="mt-1 text-xs md:text-sm font-medium text-gray-600">Delivered</div>
                </button>
            </div>

            {/* Orders Section */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200">
                    <div className="rounded-full bg-gray-100 p-6">
                        <BsBoxSeam className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-900">
                        {selectedFilter === "all"
                            ? "You haven't placed any orders yet"
                            : `No ${selectedFilter} orders found`}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        {selectedFilter === "all"
                            ? "Start shopping to see your orders here"
                            : "Try selecting a different filter"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="mt-8 flex items-center justify-center space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.has_previous_page}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                <FiChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-all ${currentPage === page
                                        ? "border-blue-500 bg-blue-500 text-white shadow-md"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.has_next_page}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                                <FiChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

export default Order;
