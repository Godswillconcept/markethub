import { ChevronLeft, ChevronRight } from "lucide-react";

export default function VendorPagination({ currentPage, totalPages, onPageChange }) {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      window.scrollTo(0, 0);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-lg border border-gray-200 p-2 transition-all duration-200 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            if (i < 3) {
              pageNum = i + 1;
            } else if (i === 3) {
              return '...';
            } else {
              pageNum = totalPages;
            }
          } else if (currentPage >= totalPages - 2) {
            if (i === 0) {
              pageNum = 1;
            } else if (i === 1) {
              return '...';
            } else {
              pageNum = totalPages - (4 - i);
            }
          } else {
            if (i === 0) {
              pageNum = 1;
            } else if (i === 1) {
              return '...';
            } else if (i === 2) {
              pageNum = currentPage - 1;
            } else if (i === 3) {
              pageNum = currentPage + 1;
              return '...';
            } else {
              pageNum = totalPages;
            }
          }

          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${i}`} className="px-2 py-2 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                pageNum === currentPage
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              disabled={pageNum === "..."}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border border-gray-200 p-2 transition-all duration-200 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
