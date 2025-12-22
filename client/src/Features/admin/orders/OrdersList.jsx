import { Link, useSearchParams } from "react-router-dom";
import Table from "../Table.jsx";
import Pagination from "../Pagination.jsx";
import { useState, useMemo, useEffect } from "react";
// import { StatusBadge } from "../../utils/helper";
import AdminFilterBar from "../AdminFilterBar.jsx";
import { useAdminOrders } from "./useAdminOrders.js";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner.jsx";

const headers = [
  { key: "id", label: "ID", className: "w-16" },
  { key: "name", label: "BUYER Name", className: "w-42" },
  { key: "address", label: "ADDRESS", className: "w-60" },
  { key: "order_date", label: "DATE", className: "w-42" },
  { key: "product", label: "PRODUCT", className: "w-32" },
  { key: "status", label: "STATUS", className: "w-28" },
];

const OrdersList = () => {
  const { orders: ordersData, isLoading, error } = useAdminOrders();
  const orders = useMemo(() => {
    // Handle case where ordersData might be the array itself or nested
    if (Array.isArray(ordersData)) return ordersData;
    return ordersData?.orders || [];
  }, [ordersData]);

  // const total = ordersData?.total || 0;
  console.log(orders);

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "All",
    sortBy: searchParams.get("sortBy") || "All",
  });

  // Debounce search term and update URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        searchParams.set("search", searchTerm);
        searchParams.set("page", "1"); // Reset to page 1 on search
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  // Order status values from the database
  const filterConfig = [
    {
      key: "status",
      label: "Status",
      options: [
        "All",
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
    },
    {
      key: "sortBy",
      label: "Sort By",
      options: ["All", "newest", "oldest"],
    },
  ];

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    // Update URL with filter value
    if (value !== "All") {
      searchParams.set(filterName, value);
    } else {
      searchParams.delete(filterName);
    }
    searchParams.set("page", "1"); // Reset page when filter changes
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "All",
      sortBy: "All",
    });
    setSearchTerm("");
    searchParams.delete("search");
    searchParams.delete("status");
    searchParams.delete("sortBy");
    setSearchParams(searchParams);
  };

  const itemsPerPage = 9;

  // Filter and Sort orders, then paginate
  const currentItems = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    // Filter by status
    let filtered = orders;
    if (filters.status !== "All") {
      filtered = filtered.filter(
        (order) => order.order_status === filters.status,
      );
    }

    // Sort
    let sorted = [...filtered];
    if (filters.sortBy === "newest") {
      sorted.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    } else if (filters.sortBy === "oldest") {
      sorted.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
    }

    // Paginate
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, orders, filters]);

  const totalItems = useMemo(() => {
    if (!Array.isArray(orders)) return 0;
    if (filters.status === "All") return orders.length;
    return orders.filter((o) => o.order_status === filters.status).length;
  }, [orders, filters.status]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading Applicants data
      </div>
    );

  // Render each row in the table
  const renderOrderRow = (order) => [
    <td key="id" className="px-6 py-4 text-sm font-medium text-gray-900">
      {order.id}
    </td>,
    <td key="name" className="px-6 py-4 text-sm">
      <Link
        to={`/admin/orders/${order.id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {order.user.first_name + " " + order.user.last_name}
      </Link>
    </td>,
    <td key="address" className="px-6 py-4 text-sm text-gray-500">
      {order?.details?.address?.address_line}
    </td>,
    <td key="date" className="px-6 py-4 text-sm text-gray-500">
      {new Date(order.order_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </td>,
    <td key="product" className="px-6 py-4 text-sm font-medium text-gray-900">
      {order.items
        ? order.items
            .slice(0, 2)
            .map((item) => item.product?.name || "Unknown Product")
            .join(", ")
        : "No items"}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
      // className={`inline-flex rounded px-2 py-1 text-xs leading-5 font-semibold ${StatusBadge(
      //   order.status,
      // )}`}
      >
        {order.order_status}
      </span>
    </td>,
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        </div>

        {/* Action Bar */}
        <AdminFilterBar
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by Buyer Name or Order ID..."
        />

        {/* Orders Table */}
        <div className="mt-2">
          <Table
            headers={headers}
            data={currentItems}
            renderRow={renderOrderRow}
            className="rounded-lg bg-white"
            theadClassName="bg-gray-50"
          />
        </div>

        {/* Pagination */}
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default OrdersList;
