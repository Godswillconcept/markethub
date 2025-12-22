// import React from "react";

// const Pagination = () => {
//   // In a real app, this would be driven by props (currentPage, totalPages, etc.)
//   return (
//     <div className="mt-8 flex items-center justify-center space-x-2">
//       <button className="bg-accent rounded-md border px-4 py-2 text-white">
//         1
//       </button>
//       <button className="rounded-md border px-4 py-2 hover:bg-gray-100">
//         2
//       </button>
//       <span className="px-4 py-2">...</span>
//       <button className="rounded-md border px-4 py-2 hover:bg-gray-100">
//         10
//       </button>
//     </div>
//   );
// };

// export default Pagination;


// components/Pagination.jsx
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { useSearchParams } from "react-router-dom";
import { PAGE_SIZE } from "../utils/constants.js";

function Pagination({ count, limit = PAGE_SIZE }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const pageCount = Math.ceil(count / limit);

  function nextPage() {
    if (currentPage < pageCount) {
      searchParams.set("page", currentPage + 1);
      setSearchParams(searchParams);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      searchParams.set("page", currentPage - 1);
      setSearchParams(searchParams);
    }
  }

  return (
    <div className="w-full flex items-center justify-between mt-6">
      {/* Left: Showing products info */}
      <p className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold">
          {(currentPage - 1) * limit + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold">
          {currentPage === pageCount ? count : currentPage * limit}
        </span>{" "}
        of <span className="font-semibold">{count}</span> results
      </p>

      {/* Right: Pagination controls */}
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium border transition
              ${currentPage === 1
                ? "cursor-not-allowed opacity-50 border-gray-200 text-gray-400"
                : "border-gray-300 text-gray-700 hover:bg-zinc-900 hover:text-white"
              }`}
          >
            <HiChevronLeft className="h-4 w-4" />
            Prev
          </button>

          {/* Current Page Number */}
          <button
            className="rounded-md px-3 py-1.5 text-sm font-medium bg-black text-white"
          >
            {currentPage}
          </button>

          <button
            onClick={nextPage}
            disabled={currentPage === pageCount}
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium border transition
              ${currentPage === pageCount
                ? "cursor-not-allowed opacity-50 border-gray-200 text-gray-400"
                : "border-gray-300 text-gray-700 hover:bg-zinc-900 hover:text-white"
              }`}
          >
            Next
            <HiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;

