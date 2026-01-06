import { useState } from "react";
import { CalendarDaysIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

/**
 * DateRangeFilter Component
 * 
 * A reusable date range picker component for filtering data by date range.
 * 
 * @param {Object} props
 * @param {string} props.startDate - ISO date string (e.g., "2025-01-01")
 * @param {string} props.endDate - ISO date string (e.g., "2025-01-31")
 * @param {Function} props.onDateChange - Callback: ({ startDate, endDate }) => void
 * @param {string} props.label - Optional label text
 * @param {boolean} props.disabled - Optional disabled state, default false
 */
function DateRangeFilter({
  startDate,
  endDate,
  onDateChange,
  label,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Format date for display (e.g., "Jan 2025")
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Format date for input (YYYY-MM)
  const formatInputDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  // Get the last day of the month for a given date
  const getMonthEnd = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.toISOString().split("T")[0];
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (!newStartDate) {
      onDateChange({ startDate: "", endDate });
      return;
    }

    const startISO = `${newStartDate}-01`;
    const endISO = getMonthEnd(startISO);

    // Validate: start date should not be after end date
    if (endDate && new Date(startISO) > new Date(endDate)) {
      onDateChange({ startDate: startISO, endDate: endISO });
    } else {
      onDateChange({ startDate: startISO, endDate });
    }
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (!newEndDate) {
      onDateChange({ startDate, endDate: "" });
      return;
    }

    const endISO = `${newEndDate}-01`;
    const monthEndISO = getMonthEnd(endISO);

    // Validate: end date should not be before start date
    if (startDate && new Date(monthEndISO) < new Date(startDate)) {
      const startMonth = new Date(startDate);
      const startMonthStr = `${startMonth.getFullYear()}-${String(
        startMonth.getMonth() + 1
      ).padStart(2, "0")}`;
      onDateChange({ startDate, endDate: getMonthEnd(`${startMonthStr}-01`) });
    } else {
      onDateChange({ startDate, endDate: monthEndISO });
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Get display text
  const getDisplayText = () => {
    if (!startDate && !endDate) return "Select Date Range";
    if (startDate && !endDate) return formatDateDisplay(startDate);
    if (!startDate && endDate) return formatDateDisplay(endDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return formatDateDisplay(startDate);
    }
    
    // Different months
    return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
  };

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="mb-1 block text-xs font-medium text-gray-600">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarDaysIcon className="mr-2 h-3 w-3 text-gray-500" />
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDownIcon className="ml-2 h-2 w-2 text-gray-500" />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div
            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-gray-200 bg-white p-4 shadow-lg"
            role="dialog"
            aria-modal="true"
          >
            <div className="space-y-4">
              {/* Start Date */}
              <div>
                <label
                  htmlFor="start-date"
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  Start Month
                </label>
                <div className="relative">
                  <input
                    id="start-date"
                    type="month"
                    value={formatInputDate(startDate)}
                    onChange={handleStartDateChange}
                    disabled={disabled}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <CalendarDaysIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <label
                  htmlFor="end-date"
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  End Month
                </label>
                <div className="relative">
                  <input
                    id="end-date"
                    type="month"
                    value={formatInputDate(endDate)}
                    onChange={handleEndDateChange}
                    disabled={disabled}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <CalendarDaysIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Validation Error */}
              {startDate && endDate && new Date(startDate) > new Date(endDate) && (
                <p className="text-xs text-red-500">
                  Start date must be before or equal to end date
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onDateChange({ startDate: "", endDate: "" });
                    setIsOpen(false);
                  }}
                  disabled={disabled}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DateRangeFilter;
