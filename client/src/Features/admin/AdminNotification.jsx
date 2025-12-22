import Table from "./Table.jsx";
import Pagination from "./Pagination.jsx";
import { useState, useMemo } from "react";
import { notificationData } from "../../data/Product.js";
// import { getStatusClasses } from "../../utils/helper";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import AdminCreateNotification from "./AdminCreateNotification.jsx";

const headers = [
  { key: "title", label: "Title", className: "min-w-[200px]" },
  { key: "targetAudience", label: "Target Audience", className: "w-32" },
  { key: "type", label: "Type", className: "w-42" },
  { key: "sentDate", label: "Send Date", className: "w-42" },
  { key: "status", label: "Status", className: "w-28" },
  { key: "action", label: "Action", className: "w-16" },
];

const Notification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const totalItems = notificationData.length;

  // Get current items for pagination
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return notificationData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Render each row in the table
  const renderNotificationRow = (notification) => [
    <td key="name" className="px-6 py-4 text-sm">
      {notification.title}
    </td>,
    <td key="email" className="px-6 py-4 text-sm text-gray-500">
      {notification.targetAudience}
    </td>,
    <td key="role" className="px-6 py-4 text-sm text-gray-500">
      {notification.type}
    </td>,
    <td
      key="lastActive"
      className="px-6 py-4 text-sm font-medium text-gray-900"
    >
      {notification.sentDate}
    </td>,
    <td key="status" className="px-6 py-4">
      <span
      // className={`inline-flex rounded px-2 py-1 text-xs leading-5 font-semibold ${getStatusClasses(
      //   notification.status,
      // )}`}
      >
        {notification.status}
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
            <h1 className="text-2xl font-bold text-gray-900">
              Notification Panel
            </h1>
            <button
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Create New Notification
            </button>
          </div>

          {/* Vendors Table */}
          <div className="mt-2">
            <Table
              headers={headers}
              data={currentItems}
              renderRow={renderNotificationRow}
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
        <AdminCreateNotification
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Notification;
