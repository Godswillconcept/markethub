import { useTopItem } from "./useTopItem.js";
import { useState } from "react";
import { useNavigate } from "react-router";
import Modal from "../../../ui/Modal.jsx";
import { getImageUrl } from "../../../utils/imageUtil.js";
import DateRangeFilter from "../../../ui/DateRangeFilter.jsx";
import { safeRender } from "../../../utils/helper.js";
// import Modal from "./Modal";

function TopSellingItems() {
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

  const { topItem = [], isLoading, error } = useTopItem({ year, month });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const topProduct = topItem?.sort((a, b) => b.sold_units - a.sold_units);
  const top2 = topProduct?.slice(0, 2).reverse();

  return (
    <>
      <section className="shadow-card rounded-sm bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Top-Selling Items</h2>
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {top2?.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer rounded-md border border-gray-200 p-2 hover:shadow-sm"
              onClick={() =>
                navigate(`/admin/vendor-products/${item.product.id}`)
              }
            >
              <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                <img
                  src={getImageUrl(item.product.thumbnail)}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-1">
                <p className="text-xs font-medium text-gray-800">
                  {safeRender(item.product.name)}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {item.product.sold_units} Sales
                  </p>
                  <span className="text-xs font-medium text-green-600">
                    +68%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-white px-4 py-1 text-xs text-black hover:underline"
          >
            See all
          </button>
        </div>
      </section>

      {/* Modal */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="All Top-Selling Items"
      >
        {/* Modal Body */}
        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error loading items</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {topProduct?.map((item, index) => (
              <div
                key={item.id}
                className="cursor-pointer rounded-md border border-gray-200 p-3 transition-shadow hover:shadow-md"
                onClick={() =>
                  navigate(`/admin/vendor-products/${item.product.id}`)
                }
              >
                <div className="mb-2 flex h-32 w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                  <img
                    src={getImageUrl(item.product.thumbnail)}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      +68%
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-gray-800">
                    {safeRender(item.product.name)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.product.sold_units} Sales
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}

export default TopSellingItems;
