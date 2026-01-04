import { useNavigate } from "react-router-dom";
import Table from "../Table";
import Pagination from "../Pagination";
import { useState } from "react";
import { formatDate } from "../../../utils/helper";
import AdminFilterBar from "../AdminFilterBar";
import { useUsersList } from "./useUsersList";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner";

const headers = [
  { key: "sn", label: "SN", className: "w-16" },
  { key: "user_name", label: "User Name", className: "min-w-[200px]" },
  { key: "email", label: "Email", className: "w-32" },
  { key: "phone", label: "Phone", className: "w-42" },
  { key: "date", label: "Date Joined", className: "w-42" },
  { key: "status", label: "Status", className: "w-28" },
];

function UsersList() {
  const navigate = useNavigate();
  const { users, total, isLoading, error } = useUsersList();
  
  const [filters, setFilters] = useState({
    status: "All",
    sortby: "All",
    date: "All",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      options: ["Active", "Inactive"],
    },
    {
      key: "date",
      label: "Date Joined",
      options: ["All"],
    },
    {
      key: "sortby",
      label: "Sort By",
      options: ["All", "Ascending", "Descending"],
    },
  ];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "Active",
      sortby: "All",
      date: "All",
    });
    setSearchTerm("");
  };

  // Get current page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(1);

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
  const renderUserRow = (user, index) => [
    <td key="sn" className="px-6 py-4 text-sm font-medium text-gray-900">
      {(currentPage - 1) * 12 + index + 1}
    </td>,
    <td key="vendor_name" className="px-6 py-4 text-sm text-gray-900">
      {user.first_name} {user.last_name}
    </td>,
    <td key="email" className="px-6 py-4 text-sm text-gray-500">
      {user.email}
    </td>,
    <td key="phone" className="px-6 py-4 text-sm text-gray-500">
      {user.phone}
    </td>,
    <td key="date" className="px-6 py-4 text-sm text-gray-500">
      {formatDate(user.created_at)}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
        className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
          user.is_active
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {user.is_active ? "Active" : "Inactive"}
      </span>
    </td>,
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
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

        {/* Users Table */}
        <div className="mt-2">
          <Table
            headers={headers}
            data={users || []}
            renderRow={renderUserRow}
            onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
            className="rounded-lg bg-white"
            theadClassName="bg-gray-50"
          />
        </div>

        {/* Pagination */}
        <Pagination
          totalItems={total || 0}
          itemsPerPage={12}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="mt-2"
        />
      </div>
    </div>
  );
}

export default UsersList;
