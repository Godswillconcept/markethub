import { useState } from "react";
import {
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
  CalendarIcon,
  EyeIcon,
  TagIcon as TagIconHero,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Tag } from "lucide-react";
import { formatDate } from "../../utils/helper.js";
import { LoadingSpinner } from "../../ui/Loading/LoadingSpinner.jsx";
import { useJournalDetail } from "./useJournalDetail.js";
import AdminCreateJournal from "./AdminCreateJournal.jsx";
import { useDeleteJournal } from "./useDeleteJournal.js";
import ConfirmModal from "../../ui/ConfirmModal.jsx";
import toast from "react-hot-toast";
import { useParams, useNavigate, Link } from "react-router-dom";

const AdminJournalDetail = () => {
  const { journalId } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { journalData: journal = {}, isLoading } = useJournalDetail(
    journalId,
    "edit",
  );
  const deleteMutation = useDeleteJournal();

  // Parse featured images if they exist
  const featuredImages = journal.featured_images
    ? typeof journal.featured_images === "string"
      ? JSON.parse(journal.featured_images)
      : journal.featured_images
    : [];

  // Parse tags if they exist
  const tags = Array.isArray(journal.tags) ? journal.tags : [];

  // Format date
  const formattedDate = journal.created_at
    ? formatDate(journal.created_at, { month: "long" }, "en-US")
    : "";

  // Split content into paragraphs
  const paragraphs = journal.content
    ? journal.content.split("\n\n").filter((p) => p.trim())
    : [];

  // Handle delete
  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(journalId);
      setDeleteModalOpen(false);
      navigate("/admin/journals");
    } catch (error) {
      console.error("Failed to delete journal:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow-sm">
          {/* Header */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="mb-4">
              <Link
                to="/admin/journals"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
              >
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                Back to Journals
              </Link>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Journal Details
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  Edit Journal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Journal
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Article Header */}
            <header>
              {/* Category Badge */}
              {journal.category && (
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {journal.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="mb-6 text-3xl leading-tight font-bold text-gray-900 sm:text-4xl">
                {journal.title}
              </h2>

              {/* Excerpt */}
              {journal.excerpt && (
                <p className="mb-6 text-xl leading-relaxed text-gray-600">
                  {journal.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    <time dateTime={journal.created_at}>{formattedDate}</time>
                  </div>
                )}
                {journal.view_count !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <EyeIcon className="h-4 w-4" />
                    <span>{journal.view_count.toLocaleString()} views</span>
                  </div>
                )}
              </div>
            </header>

            {/* Featured Image */}
            {featuredImages.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl shadow-lg">
                <div className="flex aspect-[16/9] items-center justify-center bg-gray-100">
                  {/* Using a placeholder-like display since actual image loading might need specific logic */}
                  <img
                    src={featuredImages[0]}
                    alt={journal.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<div class="text-center text-gray-500"><p class="text-sm">Image failed to load</p></div>`;
                    }}
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg prose-gray max-w-none">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-6 text-lg leading-relaxed text-gray-700"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags Section */}
            {tags.length > 0 && (
              <div className="border-t border-gray-200 pt-8">
                <div className="flex items-start gap-3">
                  <Tag className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Images */}
            {featuredImages.length > 1 && (
              <div className="mt-12 grid grid-cols-2 gap-4">
                {featuredImages.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-100 shadow-md"
                  >
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `<div class="text-center text-gray-500"><p class="text-xs">Image failed to load</p></div>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Footer Info */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-sm text-gray-500">
                Last updated:{" "}
                {journal.updated_at
                  ? formatDate(journal.updated_at, { month: "long" }, "en-US")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Journal Modal */}
      {isEditModalOpen && (
        <AdminCreateJournal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          journalId={journalId}
        />
      )}

      {/* Delete Confirmation Modal */}
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

export default AdminJournalDetail;
