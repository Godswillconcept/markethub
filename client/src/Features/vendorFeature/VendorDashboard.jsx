import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ShoppingCartIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { useVendorDashboardProduct } from "./useVendorDashboardProduct.js";
import { useVendorDashBoardStats } from "./useVendorDashBoardStats.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { DataState } from "../../ui/DataState.jsx";
import { getImageUrl } from "../../utils/imageUtil.js";

// ProductCard Component - Moved outside for performance
const ProductCard = ({ product }) => {
  // Calculate total stock from variant combinations
  const totalStock = product.variantCombinations?.reduce((sum, variant) => {
    return sum + (variant?.stock || 0);
  }, 0) || 0;
  
  // Determine if product is in stock based on total stock
  const isInStock = totalStock > 0;
  const statusText = isInStock ? "Active" : "Out of Stock";
  
  return (
    <div className="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(product.thumbnail)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isInStock
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {statusText}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            className="bg-opacity-90 hover:bg-opacity-100 rounded-full bg-white p-2 shadow-sm"
            aria-label="More options"
          >
            <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Price Overlay */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-lg font-semibold text-white">
            {formatCurrency(product.price)}
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">
          {product.name}
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          {product.Category?.name || "Uncategorized"}
        </p>

        {/* Stats Row */}
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <EyeIcon className="h-3 w-3" />
            <span>{product.impressions || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCartIcon className="h-3 w-3" />
            <span>{product.sold_units || 0} sold</span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/vendor/dashboard/products/${product.id}`}
          state={{ product }}
          className="block w-full rounded-md bg-gray-50 px-3 py-2 text-center text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

function VendorDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debounceRef = useRef(null);

  // Get URL params
  const currentPage = Number(searchParams.get("page")) || 1;
  const filterStatus = searchParams.get("status") || "All";
  const searchQuery = searchParams.get("search") || "";

  // Fetch products with server-side filtering and pagination
  const {
    products: allProducts = [],
    pagination,
    isLoading,
    isError,
    error,
  } = useVendorDashboardProduct(currentPage, 10, searchQuery, filterStatus);

  const { stats: vendorStats = {}, isLoading: statsLoading } =
    useVendorDashBoardStats();

  // Unified loading state
  const isPageLoading = isLoading || statsLoading;

  // Use server-side filtered and paginated products
  const vendorProducts = allProducts;

  // Debounce search input and sync to URL
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchTerm && searchTerm.length >= 2) {
        newParams.set("search", searchTerm);
        newParams.set("page", "1");
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    }, 300); // Faster debounce for client-side

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Handle filter change
  const handleFilterChange = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status === "All") {
      newParams.delete("status");
    } else {
      newParams.set("status", status);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(page));
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  // Stats config
  const statConfigs = {
    liveProducts: {
      label: "Live Products",
      format: (value) => value.toString(),
    },
    totalSales: {
      label: "Total Sales",
      format: (value) => formatCurrency(value),
    },
    monthlyUnitsSold: {
      label: "Monthly Units Sold",
      format: (value) => value.toString(),
    },
    totalViews: {
      label: "Total Product Views",
      format: (value) => value.toString(),
    },
  };

  const stats = Object.entries(vendorStats).map(([key, value]) => ({
    ...statConfigs[key],
    value: statConfigs[key]?.format ? statConfigs[key].format(value) : value,
  }));

  // Render pagination numbers
  const renderPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }

    return pages;
  }, [currentPage, pagination.totalPages]);

  return (
    <DataState
      isLoading={isPageLoading}
      isError={isError}
      error={error}
      loadingMessage="Loading dashboard..."
      className="min-h-screen" // Ensure full height loader
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header Stats */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header & Controls */}
          {/* <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your product inventory
              </p>
            </div>
            <Link
              to="/vendor/dashboard/products/create-product"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
            >
              Add Product
            </Link>
          </div> */}

          {/* Search & Filter Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-10 placeholder-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {["All", "active", "out_of_stock"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    filterStatus === status
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {status === "All"
                    ? "All Products"
                    : status.charAt(0).toUpperCase() +
                      status.slice(1).replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Product List Content - Logic simplified as DataState is now at top level */}

          {/* Empty State Check for Inner Content */}
          {!isPageLoading && !isError && pagination.totalItems === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery || filterStatus !== "All"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"}
              </p>
            </div>
          ) : (
            /* Desktop Table View */
            <>
              <div className="hidden overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendorProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {product.Category?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.variantCombinations?.some(v => v.stock > 0)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.variantCombinations?.some(v => v.stock > 0) ? "Active" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {product.impressions || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {product.sold_units || 0}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/vendor/dashboard/products/${product.id}`}
                            state={{ product }}
                            className="text-sm font-medium text-gray-700 hover:text-gray-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 border-t border-gray-100 py-4">
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {pagination.totalPages}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className="rounded-lg border border-gray-200 p-2 transition-all duration-200 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {renderPageNumbers.map((page, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              typeof page === "number" && handlePageChange(page)
                            }
                            disabled={page === "..."}
                            className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                              page === currentPage
                                ? "bg-gray-900 text-white"
                                : page === "..."
                                  ? "cursor-default text-gray-400"
                                  : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination?.hasNextPage}
                        aria-label="Next page"
                        className="rounded-lg border border-gray-200 p-2 transition-all duration-200 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:hidden">
                {vendorProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* Mobile Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2 lg:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-3 text-sm text-gray-600">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination?.hasNextPage}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DataState>
  );
}

export default VendorDashboard;
