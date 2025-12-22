import { LoadingSpinner } from "./Loading/LoadingSpinner.jsx";
import {
  ExclamationTriangleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

export function DataState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = "No data found",
  retry,
  children,
  className = "",
  loadingMessage = "Loading...",
}) {
  // Loading State
  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-12 ${className}`}
      >
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-gray-500">{loadingMessage}</p>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div
        className={`rounded-lg border border-red-100 bg-red-50 p-6 text-center ${className}`}
      >
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-sm font-medium text-red-800">
          Something went wrong
        </h3>
        <p className="mt-1 text-xs text-red-600">
          {typeof error === "string"
            ? error
            : error?.message || "Failed to load data"}
        </p>

        {retry && (
          <button
            onClick={retry}
            className="mt-4 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-300 ring-inset hover:bg-red-50"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty State
  if (isEmpty) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 py-12 text-center ${className}`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <InboxIcon className="h-6 w-6 text-gray-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-900">{emptyMessage}</p>
      </div>
    );
  }

  // Success State
  return children;
}
