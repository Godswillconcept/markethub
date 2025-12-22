import Table from "../Table.jsx";
import Pagination from "../Pagination.jsx";
import { useState, useMemo } from "react";
import { earningsData } from "../../../data/Product.js";
// import { StatusBadge } from "../../utils/helper";
import AdminFilterBar from "../AdminFilterBar.jsx";
import EarningsStatCard from "./EarningsStatCard.jsx";

const headers = [
  { key: "vendorName", label: "Vendor Name", className: "w-32" },
  { key: "totalSales", label: "Total Sales", className: "w-42" },
  { key: "vendorEarnings", label: "Vendor Earnings", className: "w-60" },
  { key: "lastPaymentDate", label: "Last Payment Date", className: "w-42" },
  { key: "product", label: "Product", className: "w-32" },
  { key: "status", label: "Status", className: "w-28" },
];

const OrdersList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "All",
    vendor: "All",
    status: "All",
  });

  const filterConfig = [
    {
      key: "vendor",
      label: "Vendor",
      options: ["All", "Vendor 1", "Vendor 2", "Vendor 3", "Vendor 4"], // Mock vendors
    },
    {
      key: "status",
      label: "Status",
      options: ["All", "Completed", "Processing"],
    },
  ];

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "All",
      vendor: "All",
      status: "All",
    });
    setSearchTerm("");
  };

  const itemsPerPage = 9;
  const totalItems = earningsData.length;

  const stats = [
    {
      type: "totalEarnings",
      title: "Total Earnings",
      value: "1,500,000",
      trend: "+20% from last month",
      isPositive: true,
      variant: "dark",
      link: "#",
    },
    {
      type: "monthEarnings",
      title: "This Month's Earnings",
      value: "1,000,000",
      trend: "-10% from last month",
      isPositive: false,
      link: "#",
    },
    {
      type: "pendingPayouts",
      title: "Pending Payouts",
      value: "25",
      action: "See All",
      link: "#",
    },
    {
      type: "totalPayouts",
      title: "Total Payouts Made",
      value: "1,200,000",
      trend: "-10% from last month",
      isPositive: false,
      link: "#",
    },
  ];

  // Get current items for pagination
  // Get current items for pagination
  const currentItems = useMemo(() => {
    // 1. Filter
    const filtered = earningsData.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVendor =
        filters.vendor === "All" || item.vendorName === filters.vendor;
      const matchesStatus =
        filters.status === "All" || item.status === filters.status;

      return matchesSearch && matchesVendor && matchesStatus;
    });

    // 2. Paginate
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  // Render each row in the table
  const renderEarningRow = (earning) => {
    // const statusClass = StatusBadge(earning.status);
    return [
      <td key="id" className="px-6 py-4 text-sm font-medium text-gray-900">
        {earning.vendorName}
      </td>,
      <td key="sales" className="px-6 py-4 text-center text-sm">
        {earning.totalSales}
      </td>,
      <td
        key="earnings"
        className="px-6 py-4 text-center text-sm text-gray-500"
      >
        {earning.vendorEarnings}
      </td>,
      <td key="date" className="px-6 py-4 text-sm text-gray-500">
        {earning.lastPaymentDate}
      </td>,
      <td key="product" className="px-6 py-4 text-sm font-medium text-gray-900">
        {earning.product}
      </td>,
      <td key="status" className="px-6 py-4">
        <span
        // className={`inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
        >
          {earning.status}
        </span>
      </td>,
    ];
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Earnings & Payments
          </h1>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <EarningsStatCard key={index} {...stat} />
          ))}
        </div>

        {/* Action Bar */}
        <AdminFilterBar
          filters={filters}
          filterConfig={filterConfig}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search orders"
        />

        {/* Orders Table */}
        <div className="mt-2">
          <Table
            headers={headers}
            data={currentItems}
            renderRow={renderEarningRow}
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
