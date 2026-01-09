import Table from "./Table.jsx";
import Pagination from "./Pagination.jsx";
import { useState, useMemo, useEffect } from "react";
import { useJournals } from "./useJournals.js";
import { useDeleteJournal } from "./useDeleteJournal.js";
import { formatDate } from "../../utils/helper";
import AdminCreateJournal from "./AdminCreateJournal.jsx";
import AdminFilterBar from "./AdminFilterBar.jsx";
import JournalActionMenu from "./JournalActionMenu.jsx";
import { LoadingSpinner } from "../../ui/Loading/LoadingSpinner";
import ConfirmModal from "../../ui/ConfirmModal.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../../utils/constants.js";

const headers = [
  { key: "title", label: "Title", className: "min-w-[200px]" },
  { key: "tags", label: "Tags", className: "w-32" },
  { key: "category", label: "Category", className: "w-42" },
  { key: "created_at", label: "Date Created", className: "w-42" },
  { key: "view_count", label: "Views", className: "w-28" },
  { key: "action", label: "Action", className: "w-16" },
];

const AdminJournal = () => {
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedJournalId, setSelectedJournalId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { journals, total, isLoading, error } = useJournals();
  const deleteMutation = useDeleteJournal();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const navigate = useNavigate();
  const itemsPerPage = PAGE_SIZE;

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

  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const setCurrentPage = (page) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  // Use server-side data directly
  const currentItems = journals || [];
  const totalItems = total || 0;

  const handleCreateNew = () => {
    setModalMode("create");
    setSelectedJournalId(null);
    setIsJournalOpen(true);
  };

  const handleEdit = (journalId) => {
    setModalMode("edit");
    setSelectedJournalId(journalId);
    setIsJournalOpen(true);
  };

  const handleDelete = (journalId) => {
    setSelectedJournalId(journalId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(selectedJournalId);
      setDeleteModalOpen(false);
      setSelectedJournalId(null);
    } catch (error) {
      console.error("Failed to delete journal:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setSelectedJournalId(null);
  };

  const handleView = (journalId) => {
    navigate(`/admin/journals/${journalId}`);
  };

  const handleCloseModal = () => {
    setIsJournalOpen(false);
    setSelectedJournalId(null);
    setModalMode("create");
  };

  // Render each row in the table
  const renderJournalRow = (journal) => [
    <td key="title" className="px-6 py-4 text-sm">
      {journal.title}
    </td>,
    <td key="tags" className="px-6 py-4 text-sm text-gray-500">
      {Array.isArray(journal.tags) ? journal.tags.join(", ") : journal.tags}
    </td>,
    <td key="category" className="px-6 py-4 text-sm text-gray-500">
      {journal.category}
    </td>,
    <td
      key="created_at"
      className="px-6 py-4 text-sm font-medium text-gray-900"
    >
      {formatDate(journal.created_at)}
    </td>,
    <td key="view_count" className="px-6 py-4">
      <span className="text-sm text-gray-500">{journal.view_count}</span>
    </td>,
    <td key="action" className="px-6 py-4">
      <JournalActionMenu
        journalId={journal.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </td>,
  ];

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading Journals data
      </div>
    );

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
            <button
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
              onClick={handleCreateNew}
            >
              Create New Journal
            </button>
          </div>

          {/* Filter Bar */}
          <div className="mb-4">
            <AdminFilterBar
              filters={{}}
              filterConfig={[]}
              onFilterChange={() => {}}
              onResetFilters={() => setSearchTerm("")}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search journals..."
            />
          </div>

          {/* Table */}
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
          onClose={handleCloseModal}
          mode={modalMode}
          journalId={selectedJournalId}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Journal"
        message="Are you sure you want to delete this journal? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        variant="danger"
      />
    </>
  );
};

export default AdminJournal;
