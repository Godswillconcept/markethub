import { useState, useMemo, useEffect } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

import { useOrders } from "./useOrders.js";
import { formatDateGB } from "../../utils/helper.js";

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
            // Clean up the URL by removing the query params
            navigate(location.pathname, { replace: true });
        } else if (paymentStatus === "failed") {
            toast.error(message || "Payment verification failed.");
            // Clean up the URL
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
    console.log("orders detail", orders);

    // Calculate stats - you might want to fetch this separately from API for accurate counts
    const stats = useMemo(() => {
        // These stats are approximate based on current page
        // For accurate stats across all orders, create a separate API endpoint
        return {
            all: pagination?.total || 0,
            processing: orders.filter((o) => o.status === "processing").length,
            shipped: orders.filter((o) => o.status === "shipped").length,
            delivered: orders.filter((o) => o.status === "delivered").length,
        };
    }, [orders, pagination]);

    // Use centralized formatDateGB function from utils

    const formatPrice = (price) => `$${price.toFixed(2)}`;

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination?.total_pages) {
            setCurrentPage(page);
        }
    };

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleOrderClick = (order) => {
        console.log("Clicked order:", order);
        // Navigate to order detail page with preserved state
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
            <div className="flex items-center gap-3 md:hidden">
                <BsArrowLeft className="h-6 w-6 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                    Order History & Tracking
                </h1>
            </div>

            <div className="hidden md:block">
                <h1 className="text-2xl font-bold text-gray-900">
                    Order history & tracking
                </h1>
                <p className="mt-1 text-gray-600">View & manage your orders</p>
            </div>

            {/* Stats Cards (Mobile) */}
            <div className="grid grid-cols-3 gap-4 md:hidden">
                <button
                    onClick={() => handleFilterChange("all")}
                    className={`rounded-2xl p-4 text-center transition-colors ${selectedFilter === "all"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-2xl font-bold text-gray-900">{stats.all}</div>
                    <div className="mt-1 text-sm font-medium text-gray-700">All</div>
                </button>

                <button
                    onClick={() => handleFilterChange("shipped")}
                    className={`rounded-2xl p-4 text-center transition-colors ${selectedFilter === "shipped"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-2xl font-bold text-gray-900">
                        {stats.shipped}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-700">
                        Shipped
                    </div>
                </button>

                <button
                    onClick={() => handleFilterChange("delivered")}
                    className={`rounded-2xl p-4 text-center transition-colors ${selectedFilter === "delivered"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-2xl font-bold text-gray-900">
                        {stats.delivered}
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-700">
                        Delivered
                    </div>
                </button>
            </div>

            {/* Stats Cards (Desktop) */}
            <div className="hidden grid-cols-4 gap-4 md:grid">
                <button
                    onClick={() => handleFilterChange("all")}
                    className={`rounded-2xl p-6 text-center transition-colors ${selectedFilter === "all"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-3xl font-bold text-gray-900">{stats.all}</div>
                    <div className="mt-1 font-medium text-gray-700">All</div>
                </button>

                <button
                    onClick={() => handleFilterChange("processing")}
                    className={`rounded-2xl p-6 text-center transition-colors ${selectedFilter === "processing"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-3xl font-bold text-gray-900">
                        {stats.processing}
                    </div>
                    <div className="mt-1 font-medium text-gray-700">Processing</div>
                </button>

                <button
                    onClick={() => handleFilterChange("shipped")}
                    className={`rounded-2xl p-6 text-center transition-colors ${selectedFilter === "shipped"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-3xl font-bold text-gray-900">
                        {stats.shipped}
                    </div>
                    <div className="mt-1 font-medium text-gray-700">Shipped</div>
                </button>

                <button
                    onClick={() => handleFilterChange("delivered")}
                    className={`rounded-2xl p-6 text-center transition-colors ${selectedFilter === "delivered"
                        ? "border-2 border-blue-200 bg-blue-100"
                        : "bg-blue-50 hover:bg-blue-100"
                        }`}
                >
                    <div className="text-3xl font-bold text-gray-900">
                        {stats.delivered}
                    </div>
                    <div className="mt-1 font-medium text-gray-700">Delivered</div>
                </button>
            </div>

            {/* Orders Section */}
            {orders.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-gray-100 p-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-12 w-12 text-gray-400"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8.25h18M3 8.25a1.5 1.5 0 01-1.5-1.5V4.5A1.5 1.5 0 013 3h18a1.5 1.5 0 011.5 1.5v2.25a1.5 1.5 0 01-1.5 1.5M3 8.25v12A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-12"
                            />
                        </svg>
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
                // Orders Table
                <>
                    <div className="overflow-x-auto">

                        <div className="grid min-w-full grid-cols-4 gap-6 border-b border-gray-200 pb-3 md:min-w-0">
                            <div className="font-semibold text-gray-900">Date</div>
                            <div className="font-semibold text-gray-900">Order Item</div>
                            <div className="font-semibold text-gray-900">Order ID</div>
                            <div className="text-right font-semibold text-gray-900">
                                Price
                            </div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {orders.map((order) => {
                                // Get first item's product name or fallback
                                const productName = order.items?.[0]?.product?.name || "Order";
                                const itemCount = order.item_count || order.items?.length || 0;
                                const displayName = itemCount > 1
                                    ? `${productName} +${itemCount - 1} more`
                                    : productName;

                                return (
                                    <button
                                        key={order.id}
                                        onClick={() => handleOrderClick(order)}
                                        className="grid w-full grid-cols-4 gap-6 py-4 text-left transition-colors hover:bg-gray-50"
                                    >
                                        <div className="text-gray-600">
                                            {formatDateGB(order.order_date)}
                                        </div>
                                        <div className="break-words whitespace-normal text-gray-900">
                                            {displayName}
                                        </div>
                                        <div className="text-gray-600">
                                            {order.order_number}
                                        </div>
                                        <div className="text-right font-semibold text-green-600">
                                            {formatPrice(order.total_amount)}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                        <div className="mt-6 flex items-center justify-center space-x-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!pagination.has_previous_page}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FiChevronLeft className="h-4 w-4" />
                            </button>

                            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${currentPage === page
                                        ? "border-orange-500 bg-white text-orange-600"
                                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!pagination.has_next_page}
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FiChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ... your table and list ... */}
        </>
    );
}

export default Order;

