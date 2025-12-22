import Table from "./Table.jsx";
import Pagination from "./Pagination.jsx";
import { useState, useMemo } from "react";
import { journalData } from "../../data/Product.js";
// import { getStatusClasses } from "../../utils/helper";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import AdminCreateJournal from "./AdminCreateJournal.jsx";
import AdminFilterBar from "./AdminFilterBar.jsx";

const headers = [
  { key: "title", label: "Title", className: "min-w-[200px]" },
  { key: "tags", label: "Tags", className: "w-32" },
  { key: "category", label: "Category", className: "w-42" },
  { key: "dateCreated", label: "Date Created", className: "w-42" },
  { key: "views", label: "Views", className: "w-28" },
  { key: "action", label: "Action", className: "w-16" },
];

const AdminJournal = () => {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 9;

  // Filter journals based on search term
  const filteredJournals = useMemo(() => {
    return journalData.filter((journal) =>
      journal.title.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const totalItems = filteredJournals.length;

  // Get current items for pagination
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredJournals.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage, filteredJournals]);

  // Render each row in the table
  const renderJournalRow = (journal) => [
    <td key="title" className="px-6 py-4 text-sm">
      {journal.title}
    </td>,
    <td key="tags" className="px-6 py-4 text-sm text-gray-500">
      {journal.tags}
    </td>,
    <td key="category" className="px-6 py-4 text-sm text-gray-500">
      {journal.category}
    </td>,
    <td
      key="dateCreated"
      className="px-6 py-4 text-sm font-medium text-gray-900"
    >
      {journal.dateCreated}
    </td>,
    <td key="views" className="px-6 py-4">
      <span
      // className={`inline-flex rounded px-2 py-1 text-xs leading-5 font-semibold ${getStatusClasses(
      //   journal.views,
      // )}`}
      >
        {journal.views}
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
            <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
            <button
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => setIsJournalOpen(true)}
            >
              Create New Journal
            </button>
          </div>

          {/* Filter Bar */}
          <div className="mb-4">
            <AdminFilterBar
              filters={{}}
              filterConfig={[]} // No filters for now, just search
              onFilterChange={() => {}}
              onResetFilters={() => setSearchTerm("")}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search journals..."
            />
          </div>

          {/* Vendors Table */}
          <div className="mt-2">
            <Table
              headers={headers}
              data={currentItems}
              renderRow={renderJournalRow}
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
      {isJournalOpen && (
        <AdminCreateJournal
          isOpen={isJournalOpen}
          onClose={() => setIsJournalOpen(false)}
        />
      )}
    </>
  );
};

export default AdminJournal;
