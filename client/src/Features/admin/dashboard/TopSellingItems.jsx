import { ChevronDownIcon, CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTopItem } from "./useTopItem.js";
import { useState } from "react";
import { useNavigate } from "react-router";
import Modal from "../../../ui/Modal.jsx";
import { getImageUrl } from "../../../utils/imageUtil.js";
// import Modal from "./Modal";

function TopSellingItems() {
  const { topItem = [], isLoading, error } = useTopItem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const topProduct = topItem?.sort((a, b) => b.sold_units - a.sold_units);
  const top2 = topProduct?.slice(0, 2).reverse();

  return (
    <>
      <section className="shadow-card rounded-sm bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-800">Top-Selling Items</h2>
          <button className="flex items-center rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 hover:bg-gray-50">
            <CalendarDaysIcon className="mr-2 h-3 w-3 text-gray-500" />
            This Month
            <ChevronDownIcon className="ml-2 h-2 w-2 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {top2?.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-gray-200 p-2 hover:shadow-sm cursor-pointer"
              onClick={() => navigate(`/admin/vendor-products/${item.product.id}`)}
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
                <p className="text-xs font-medium text-gray-800">{item.product.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{item.product.sold_units} Sales</p>
                  <span className="text-xs font-medium text-green-600">+68%</span>
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
                className="rounded-md border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/admin/vendor-products/${item.product.id}`)}
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
                    <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                    <span className="text-xs font-medium text-green-600">+68%</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-2">
                    {item.product.name}
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