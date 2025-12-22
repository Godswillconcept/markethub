import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
// import PropTypes from 'prop-types';

const Pagination = ({
  totalItems = 0,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange = () => {},
  showItemCount = true,
  className = "",
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={`flex items-center justify-between text-sm text-gray-700 ${className}`}
    >
      {showItemCount && (
        <span className="text-gray-600">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
      )}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalItems === 0}
          className="rounded-lg border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// Pagination.propTypes = {
//   totalItems: PropTypes.number.isRequired,
//   itemsPerPage: PropTypes.number,
//   currentPage: PropTypes.number,
//   onPageChange: PropTypes.func,
//   showItemCount: PropTypes.bool,
//   className: PropTypes.string,
// };

export default Pagination;
