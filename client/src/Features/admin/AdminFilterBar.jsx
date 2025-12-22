import {
  FunnelIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function AdminFilterBar({
  filters, // current selected values { category: 'All', ... }
  filterConfig, // array of filters [{ key, label, options }]
  onFilterChange, // function (key, value)
  onResetFilters, // function
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      {/* Left Section */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2 rounded-md border border-gray-300 p-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter By</span>
        </div>

        {/* Render all filters dynamically */}
        {filterConfig.map(({ key, label, options }) => (
          <div key={key} className="relative">
            <select
              className="block w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-4 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              value={filters[key]}
              onChange={(e) => onFilterChange(key, e.target.value)}
            >
              <option value="all">{label}</option>
              {options.map((option) => {
                // Support both string options and object options with value/label
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        ))}

        <button
          className="flex items-center space-x-1 rounded-lg border border-gray-300 p-2 pr-12 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          onClick={onResetFilters}
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Reset Filter</span>
        </button>
      </div>

      {/* Right Section: Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="rounded-full border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
