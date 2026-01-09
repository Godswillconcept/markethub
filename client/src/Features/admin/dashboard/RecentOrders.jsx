import { useState, useMemo } from "react";
import { useRecentOrders } from "./useRecentOrders.js";
import { getImageUrl } from "../../../utils/imageUtil.js";
import { safeRender } from "../../../utils/helper.js";

export default function RecentOrders() {
  const { recentOrders = [], isLoading, error } = useRecentOrders();

  // Pagination, filter & search states
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Memoize derived data - use server response directly
  const ordersWithProducts = useMemo(() => {
    if (!recentOrders) return [];
    return recentOrders.map((order) => ({
      ...order,
      // Use flat properties from server response (image, title, qty)
      image: getImageUrl(order.image) || "",
      title: order.title || "Unknown Product",
      qty: order.qty || 0,
    }));
  }, [recentOrders]);

  // Memoize filtering, sorting, searching
  const filteredOrders = useMemo(() => {
    let filtered = [...ordersWithProducts];

    if (searchQuery) {
      filtered = filtered.filter(
        (o) =>
          o.user?.first_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          o.user?.last_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          o.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.id?.toString().includes(searchQuery),
      );
    }

    if (sortBy === "status") {
      filtered.sort((a, b) => a.order_status.localeCompare(b.order_status));
    } else if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    } else if (sortBy === "amount") {
      filtered.sort((a, b) => b.total_amount - a.total_amount);
    }

    return filtered;
  }, [ordersWithProducts, sortBy, searchQuery]);

  if (isLoading)
    return (
      <p className="text-center text-gray-500">Loading recent orders...</p>
    );
  if (error)
    return (
      <p className="text-center text-red-500">Failed to load recent orders.</p>
    );

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusStyle = (status) => {
    const normalized = status.toLowerCase();
    if (normalized === "delivered")
      return "bg-green-50 text-green-700 border border-green-200";
    if (normalized === "processing" || normalized === "shipped")
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    if (normalized === "pending")
      return "bg-gray-100 text-gray-700 border border-gray-200";
    return "bg-blue-50 text-blue-700 border border-blue-200";
  };

  // ✅ Now return JSX
  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-medium text-gray-800">Recent Orders</h3>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-40">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Sort By</option>
              <option value="status">Status</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>

          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="Search orders..."
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-md bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-text-muted border-b border-gray-200 text-left">
              <tr>
                <th className="py-2">Order ID</th>
                <th className="py-2">Image</th>
                <th className="py-2">Order</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="py-3">{`#0RD${r.id}`}</td>
                    <td className="py-3">
                      <img
                        src={r.image}
                        alt=""
                        className="h-8 w-12 rounded object-cover"
                      />
                    </td>
                    <td className="py-3">{safeRender(r.title)}</td>
                    <td className="py-3">{r.qty}</td>
                    <td className="py-3">
                      ₦{r.total_amount?.toLocaleString() || "0"}
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${getStatusStyle(
                          r.order_status || "pending",
                        )}`}
                      >
                        {r.order_status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No orders found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between rounded-md p-2 shadow-sm">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            -
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border px-2 py-1 disabled:opacity-50"
          >
            +
          </button>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="form-select rounded border px-2 py-1"
          >
            <option>5</option>
            <option>10</option>
          </select>
        </div>
      </div>
    </>
  );
}
