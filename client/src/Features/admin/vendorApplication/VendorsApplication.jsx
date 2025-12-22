import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../Pagination.jsx";
import Table from "../Table.jsx";
import AdminFilterBar from "../AdminFilterBar.jsx";
import { useVendorApplications } from "./useVendorApplications.js";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner.jsx";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

const headers = [
  { key: "sn", label: "SN", className: "w-16" },
  { key: "first_name", label: "Vendor Name", className: "w-42" },
  { key: "business_name", label: "Business Name", className: "w-42" },
  { key: "email", label: "Email", className: "w-32" },
  { key: "phone", label: "Phone Number", className: "w-42" },
  { key: "action", label: "Action", className: "w-32" },
];

const VendorsApplication = () => {
  const { applications = [], total, isLoading, error } = useVendorApplications();
  // const { User: user, store } = applications[0] || {};
  // console.log(user?.first_name);

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
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

  // Vendor application filter configuration based on backend API specs
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
    });
    setSearchTerm("");
    searchParams.delete("search");
    searchParams.delete("status");
    setSearchParams(searchParams);
  };

  // Sync currentPage with URL params
  const currentPage = !searchParams.get("page") ? 1 : Number(searchParams.get("page"));
  const itemsPerPage = 12; // Match PAGE_SIZE from constants
  
  const setCurrentPage = (page) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  // Use server-side data directly
  const currentItems = applications || [];
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
        Error loading Applicants data
      </div>
    );

  // Render each row in the table
  const renderApplicationRow = (applicant, index) => {
    const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
    return (
      <Link to={`/admin/applications/${applicant?.id}`} className="contents">
        <td key="sn" className="px-6 py-4 text-sm font-medium text-gray-900">
          {serialNumber}
        </td>
        <td key="vendor_name" className="px-6 py-4 text-sm">
          {applicant?.User?.first_name} {applicant?.User?.last_name}
        </td>
        <td key="business_name" className="px-6 py-4 text-sm text-gray-500">
          {applicant?.store?.business_name}
        </td>
        <td key="email" className="px-6 py-4 text-sm text-gray-500">
          {applicant?.User?.email}
        </td>
        <td key="phone" className="px-6 py-4 text-sm text-gray-500">
          {applicant?.User?.phone}
        </td>
        <td
          key="action"
          className="px-6 py-4 text-sm font-medium text-gray-900"
        >
          <button
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="View details"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </td>
      </Link>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-full">
        {/* Header Section */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendors Application
          </h1>
        </div>

        {/* Filter, Search, and Action Bar (identical to previous table) */}

        <AdminFilterBar
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search vendors"
        />

        {/* Vendors Application Table */}
        <Table
          headers={headers}
          data={currentItems}
          renderRow={renderApplicationRow}
          className="rounded-lg bg-white"
          theadClassName="bg-gray-50"
        />

        {/* Pagination */}
        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default VendorsApplication;
