import { Link } from "react-router-dom";
import Table from "./Table.jsx";
import Pagination from "./Pagination.jsx";
import { useState, useMemo } from "react";
import { feedbackData } from "../../data/Product.js";
// import { StatusBadge } from "../../utils/helper";
import AdminFilterBar from "./AdminFilterBar.jsx";

const headers = [
  { key: "date", label: "DATE", className: "w-32" },
  { key: "userName", label: "User Name", className: "w-36" },
  { key: "vendor", label: "Vendor", className: "w-32" },
  { key: "productName", label: "Product Name", className: "w-42" },
  { key: "feedbackType", label: "Feedback Type", className: "w-32" },
  { key: "status", label: "STATUS", className: "w-28" },
];

const FeedBack = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    vendor: "All",
    user: "All",
  });

  const filterConfig = [
    {
      key: "status", // Changed from 'product'/Category to Status as it matches data
      label: "Status",
      options: ["All", "New", "In Review", "Closed", "Completed", "Processing"],
    },
    {
      key: "vendor",
      label: "Vendor",
      options: ["All", "Ebele Styles", "StreetStyles", "LuxeStyles", "FitDrip"], // Added dummy vendors
    },
  ];

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "All",
      vendor: "All",
      user: "All",
    });
    setSearchTerm("");
  };

  const itemsPerPage = 9;
  const totalItems = feedbackData.length;

  // Get current items for pagination
  const currentItems = useMemo(() => {
    // 1. First filter the whole dataset
    const filtered = feedbackData.filter((item) => {
      // Search logic (User Name or Product Name)
      const matchesSearch =
        searchTerm === "" ||
        item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter logic
      const matchesStatus =
        filters.status === "All" || item.status === filters.status;

      const matchesVendor =
        filters.vendor === "All" || item.vendor === filters.vendor;

      // User filter is currently hidden in UI but kept in logic/state if needed later
      const matchesUser =
        filters.user === "All" || item.userName === filters.user;

      return matchesSearch && matchesStatus && matchesVendor && matchesUser;
    });

    // 2. Then paginate the filtered results
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  // Render each row in the table
  const renderFeedbackRow = (feedback) => [
    <td key="date" className="px-6 py-4 text-sm font-medium text-gray-900">
      {feedback.date}
    </td>,
    <td key="userName" className="px-6 py-4 text-sm">
      <Link
        to={`/admin/feedback/${feedback.id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {feedback.userName}
      </Link>
    </td>,
    <td key="vendor" className="px-6 py-4 text-sm text-gray-500">
      {feedback.vendor}
    </td>,
    <td key="productName" className="px-6 py-4 text-sm text-gray-500">
      {feedback.productName}
    </td>,
    <td
      key="feedbackType"
      className="px-6 py-4 text-sm font-medium text-gray-900"
    >
      {feedback.feedbackType}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
      // className={`inline-flex rounded px-2 py-1 text-xs leading-5 font-semibold ${StatusBadge(
      //   feedback.status,
      // )}`}
      >
        {feedback.status}
      </span>
    </td>,
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Feedback & Support
          </h1>
        </div>

        {/* Action Bar */}
        <AdminFilterBar
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search..."
        />

        {/* Orders Table */}
        <div className="mt-2">
          <Table
            headers={headers}
            data={currentItems}
            renderRow={renderFeedbackRow}
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

export default FeedBack;
