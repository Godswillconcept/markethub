import { Link } from "react-router-dom";
import Table from "./Table.jsx";
import Pagination from "./Pagination.jsx";
import { useState, useMemo } from "react";
import { subAdminData } from "../../data/Product.js";
// import { getStatusClasses } from "../../utils/helper";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import CreateSubAdmin from "./CreateSubAdmin.jsx";

const headers = [
  { key: "name", label: "Vendor Name", className: "min-w-[200px]" },
  { key: "email", label: "Email", className: "w-32" },
  { key: "role", label: "Role", className: "w-42" },
  { key: "lastActive", label: "Last Active", className: "w-42" },
  { key: "status", label: "Status", className: "w-28" },
  { key: "action", label: "Action", className: "w-16" },
];

const SubAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalItems = subAdminData.length;

  // Get current items for pagination
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return subAdminData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Render each row in the table
  const renderSubAdminRow = (subAdmin) => [
    <td key="name" className="px-6 py-4 text-sm">
      <Link
        to={`/admin/sub-admins/${subAdmin.id}`}
        className="text-blue-600 hover:text-blue-800 hover:underline"
      >
        {subAdmin.name}
      </Link>
    </td>,
    <td key="email" className="px-6 py-4 text-sm text-gray-500">
      {subAdmin.email}
    </td>,
    <td key="role" className="px-6 py-4 text-sm text-gray-500">
      {subAdmin.role}
    </td>,
    <td
      key="lastActive"
      className="px-6 py-4 text-sm font-medium text-gray-900"
    >
      {subAdmin.lastActive}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
      // className={`inline-flex rounded px-2 py-1 text-xs leading-5 font-semibold ${getStatusClasses(
      //   subAdmin.status,
      // )}`}
      >
        {subAdmin.status}
      </span>
    </td>,
    <td key="action" className="px-6 py-4">
      <button className="px-4 py-2 text-sm font-medium">
        <HiOutlineDotsHorizontal />
      </button>
    </td>,
  ];

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Sub-Admins</h1>
            <button
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Create New Sub Admin
            </button>
          </div>

          {/* Vendors Table */}
          <div className="mt-2">
            <Table
              headers={headers}
              data={currentItems}
              renderRow={renderSubAdminRow}
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
      {isModalOpen && (
        <CreateSubAdmin
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default SubAdmin;
