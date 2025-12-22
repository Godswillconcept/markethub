import { useState } from "react";
import { ChevronDownIcon, CheckCircleIcon } from "@heroicons/react/20/solid"; // Example icons
import { Link } from "react-router";
import { useOrderDetail } from "./useOrderDetail.js";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner.jsx";
import OrderSummarySection from "./OrderSummarySection.jsx";
import BuyerInformation from "./BuyerInformation.jsx";
import OrderItems from "./OrderItems.jsx";

const OrderDetailPage = () => {
  const { order, isLoading, error } = useOrderDetail();
  console.log("From detail:", order);

  const actualOrder = order?.data?.order;

  // const [currentStatus, setCurrentStatus] = useState(actualOrder.status);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleUpdateStatus = (newStatus) => {
    // setCurrentStatus(newStatus);
    setShowStatusDropdown(false);
    // In a real app: call API to update status
    console.log(`Updating order status to: ${newStatus}`);
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading Applicants data
      </div>
    );

  const fullName = `${actualOrder.user.first_name} ${actualOrder.user.last_name}`;

  return (
    <div className="relative min-h-screen pb-4">
      {/* pb-20 for fixed footer */}
      <div className="mx-auto max-w-7xl px-2 py-6 sm:px-6 lg:px-2">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between border-gray-200 pb-4">
          <div className=" ">
            <h1 className="mb-1 text-3xl font-bold text-gray-900 sm:mr-3 sm:mb-0">
              Order Detail
            </h1>
            <nav className="flex items-center text-sm text-gray-500">
              <Link to="/admin/orders">Orders List</Link>
              <span className="mx-2">/</span>
              <Link to="#">{fullName}</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Update Order Status
                <ChevronDownIcon
                  className="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </button>
              {showStatusDropdown && (
                <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="status-menu-button"
                  >
                    <Link
                      to={"#"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleUpdateStatus("Processing")}
                    >
                      Processing
                    </Link>
                    <Link
                      to={"#"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleUpdateStatus("Completed")}
                    >
                      Delivered
                    </Link>
                    <Link
                      to={"#"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleUpdateStatus("Pending")}
                    >
                      Pending
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <OrderSummarySection order={order} />
        </div>

        {/* Buyer Information */}
        <div>
          <BuyerInformation actualOrder={actualOrder} />
          {/* Other sections */}
        </div>

        {/* Order Item Section */}
        <div>
          <OrderItems actualOrder={actualOrder} />
        </div>
      </div>
      {/* Page Actions Bar (Fixed Footer) */}
      <div className="mx-auto flex max-w-7xl justify-between gap-3 px-4 sm:justify-end sm:px-6 lg:px-8">
        <button className="flex-1 rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:flex-none">
          Cancel Order
        </button>
        <div className="relative flex-1 sm:flex-none">
          <button className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:outline-none">
            Update Order Status
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
