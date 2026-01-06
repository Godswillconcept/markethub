
import { useTopVendor } from "./useTopVendor.js";
import { useState } from "react";
import Modal from "../../../ui/Modal.jsx";
import DateRangeFilter from "../../../ui/DateRangeFilter.jsx";


const TopSellingVendor = () => {
  // Date range state with default to current month
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    };
  });

  // Extract year and month from date range
  const year = parseInt(dateRange.startDate.split("-")[0]);
  const month = parseInt(dateRange.startDate.split("-")[1]);

  // Handle date changes
  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const { topVendor = [], isLoading, error } = useTopVendor({ year, month });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort vendors and select top 3
  const sortedVendors = [...topVendor].sort((a, b) => b.stats.total_units_sold - a.stats.total_units_sold);
  const top3Vendors = sortedVendors.slice(0, 3);

  // Find the max units for scaling progress bars
  const maxUnits = top3Vendors[0]?.stats.total_units_sold || 1;

  return (
    <>
      <section className="shadow-card rounded-sm bg-white shadow">
        <div className="rounded-lg bg-white p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-800">Top Selling Vendor</h2>
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Loading/Error States */}
          {isLoading && (
            <div className="text-center text-sm text-gray-500">Loading...</div>
          )}
          {error && (
            <div className="text-center text-sm text-red-500">Error loading vendors</div>
          )}

          {/* Vendor List - Fixed Layout */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {top3Vendors.map((vendor, index) => {
                const progress = (vendor.stats.total_units_sold / maxUnits) * 100;

                // Optional: Add subtle color difference by rank
                const barColor =
                  index === 0
                    ? "bg-blue-500"
                    : index === 1
                      ? "bg-blue-400"
                      : "bg-blue-300";

                return (
                  <div key={vendor.id} className="flex items-center gap-2">
                    {/* Progress Bar (Vertical) */}
                    <div className="relative h-12 w-5 flex-shrink-0 overflow-hidden rounded-md border border-gray-300 bg-gray-200">
                      <div
                        className={`absolute bottom-0 left-0 w-full rounded-md ${barColor} transition-all duration-500 ease-in-out`}
                        style={{ height: `${progress}%` }}
                      ></div>
                    </div>

                    {/* Vendor Details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-gray-800">
                          {vendor.stats.total_units_sold}
                        </span>
                        <span className="text-xs font-bold text-black">Units</span>
                      </div>
                      <span className="text-xs text-gray-500 truncate">
                        {vendor.business_name || vendor.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* See All Button */}
          {!isLoading && !error && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer bg-white px-4 py-1 text-xs text-black hover:underline"
              >
                See all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="All Top-Selling Vendors"
      >
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error loading vendors</div>
        ) : (
          <div className="space-y-3">
            {sortedVendors.map((vendor, index) => (
              <div
                key={vendor.id}
                className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Rank Badge */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  #{index + 1}
                </div>

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {vendor.business_name || vendor.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Total Sales: {vendor.stats.total_units_sold} units
                  </p>
                </div>

                {/* Progress Bar (Horizontal) */}
                <div className="hidden sm:block w-32 flex-shrink-0">
                  <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-500"
                      style={{
                        width: `${(vendor.stats.total_units_sold / sortedVendors[0].stats.total_units_sold) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal >
    </>
  );
};

export default TopSellingVendor;