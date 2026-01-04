import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Table from "../Table.jsx";
import Pagination from "../Pagination.jsx";
import { useState, useEffect } from "react";
// import { getStatusClasses } from "../../utils/helper";
import AdminFilterBar from "../AdminFilterBar.jsx";
import { useVendorList } from "./useVendorList.js";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner.jsx";
import { PAGE_SIZE } from "../../../utils/constants.js";

const headers = [
  { key: "sn", label: "SN", className: "w-16" },
  { key: "vendor_name", label: "Vendor Name", className: "min-w-[200px]" },
  { key: "email", label: "Email", className: "w-32" },
  { key: "product_tags_count", label: "Products Tagged", className: "w-42" },
  { key: "total_earnings", label: "Total Earnings", className: "w-42" },
  { key: "status", label: "Status", className: "w-28" },
];

const VendorList = () => {
  const navigate = useNavigate();
  const { vendors, total, isLoading, error } = useVendorList();
  console.log(vendors, total);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    sortBy: searchParams.get("sortBy") || "all",
    sortOrder: searchParams.get("sortOrder") || "DESC",
  });
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  // Debounce search term and update URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm) {
        searchParams.set("search", searchTerm);
        searchParams.set("page", "1");
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  // Vendor filter configuration based on backend API specs
  const filterConfig = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "approved", label: "Approved" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
        { value: "suspended", label: "Suspended" },
        { value: "deactivated", label: "Deactivated" },
      ],
    },
    {
      key: "sortBy",
      label: "Sort By",
      options: [
        { value: "all", label: "Default" },
        { value: "approved_at", label: "Date Approved" },
        { value: "date_joined", label: "Date Joined" },
        { value: "vendor_name", label: "Vendor Name" },
        { value: "business_name", label: "Business Name" },
        { value: "total_earnings", label: "Total Earnings" },
        { value: "product_tags_count", label: "Product Tags" },
      ],
    },
    {
      key: "sortOrder",
      label: "Sort Order",
      options: [
        { value: "DESC", label: "Descending (Newest/Highest)" },
        { value: "ASC", label: "Ascending (Oldest/Lowest)" },
      ],
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Sync filter to URL
    if (value !== "all") {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      sortBy: "all",
      sortOrder: "DESC",
    });
    setSearchTerm("");
    searchParams.delete("search");
    searchParams.delete("status");
    searchParams.delete("sortBy");
    searchParams.delete("sortOrder");
    setSearchParams(searchParams);
  };

  // Sync currentPage with URL params
  const currentPage = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const itemsPerPage = PAGE_SIZE; // Use PAGE_SIZE constant
  
  const setCurrentPage = (page) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  // Use server-side data directly for display (already paginated by server)
  const currentItems = vendors || [];
  
  // Use total from API response for pagination
  const totalItems = total || 0;

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading Vendors data
      </div>
    );

  // Render each row in the table
  const renderVendorRow = (vendor, index) => {
    const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
    return [
    <td key="sn" className="px-6 py-4 text-sm font-medium text-gray-900">
      {serialNumber}
    </td>,
    <td key="vendor_name" className="px-6 py-4 text-sm">
      <Link
        to={`/admin/vendors/${vendor.vendor_id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {vendor.vendor_name}
      </Link>
    </td>,
    <td key="email" className="px-6 py-4 text-sm text-gray-500">
      {vendor.email}
    </td>,
    <td key="product_tags_count" className="px-6 py-4 text-sm text-gray-500">
      {vendor.product_tags_count}
    </td>,
    <td
      key="total_earnings"
      className="px-6 py-4 text-sm font-medium text-gray-900"
    >
      ${vendor.total_earnings?.toLocaleString()}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold leading-5 ${
          vendor.status?.toLowerCase() === 'approved'
            ? 'bg-green-100 text-green-800'
            : vendor.status?.toLowerCase() === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : vendor.status?.toLowerCase() === 'rejected'
            ? 'bg-red-100 text-red-800'
            : vendor.status?.toLowerCase() === 'suspended'
            ? 'bg-orange-100 text-orange-800'
            : vendor.status?.toLowerCase() === 'deactivated'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {vendor.status?.charAt(0).toUpperCase() + vendor.status?.slice(1)}
      </span>
    </td>,
  ];
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        </div>

        {/* Action Bar */}
        <AdminFilterBar
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search vendors"
        />

        {/* Vendors Table */}
        <div className="mt-2">
          <Table
            headers={headers}
            data={currentItems}
            renderRow={renderVendorRow}
            onRowClick={(vendor) =>
              navigate(`/admin-vendors/${vendor.vendor_id}`)
            }
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

export default VendorList;
