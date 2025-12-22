import {
  // NotePencilIcon,
  ArrowPathIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"; // Using Heroicons
import { useState } from "react";
import { Link } from "react-router";
import { getImageUrl } from "../../utils/imageUtil.js";
import ReplyFeedback from "./ReplyFeedback.jsx";

const FeedbackDetail = () => {
  const [showModal, setShowModal] = useState(false);
  // Dummy data
  const userData = {
    name: "Jamie Carter",
    email: "jamie.carter92@example.com",
    phone: "+1 (555) 238-7745",
  };

  const productDetails = {
    orderID: "SW39482054US",
    productName: "Noise-Cancelling Wireless Headphones",
    submittedOn: "August 3, 2025 - 2:14 PM",
    vendor: "SoundWave Electronics",
    price: "$129.99",
  };

  const feedbackMessage =
    "The headphones work great in terms of noise cancellation, but the battery life is not as advertised. I only get about 8 hours instead of the promised 12. Also, the ear cushions started peeling after just two weeks of use. I'd like to request a replacement or refund.";

  const orderItems = [
    {
      id: 1,
      image: "",
      productName: "Ankara Flare Gown",
      vendor: "23",
      price: "₦115,000",
      quantity: 1,
      subtotal: "₦115,000",
    },
    {
      id: 2,
      image: "",
      productName: "Men's Native Set",
      vendor: "26",
      price: "₦115,000",
      quantity: 2,
      subtotal: "₦115,000",
    },
    {
      id: 3,
      image: "",
      productName: "Classic Loafers",
      vendor: "12",
      price: "₦115,000",
      quantity: 3,
      subtotal: "₦115,000",
    },
  ];

  return (
    <div className="font-inter flex min-h-screen flex-col">
      {/* Top Header */}
      <header className="mb-2 flex items-center justify-between pb-8">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-[#1F1F1F]">Order Detail</h1>
          <nav className="text-sm font-medium">
            <Link
              to="/feedBack"
              className="text-tertiaryText hover:text-gray-900"
            >
              Order
            </Link>
            <span className="text-tertiaryText mx-2">&gt;</span>
            <span className="text-[#5E5CE6]">Christine Brook</span>
          </nav>
        </div>
        <div className="mb-6 flex justify-end space-x-3">
          <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-gray-50">
            {/* <NotePencilIcon className="mr-2 h-4 w-4 text-[#8D8D8D]" /> */}
            Add Note
          </button>
          <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-gray-50">
            <ArrowPathIcon className="mr-2 h-4 w-4 text-[#8D8D8D]" />
            Update Status
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 rounded-lg border border-gray-200 px-2">
        {/* User Info Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-[#1F1F1F]">User Info</h2>
          <div className="text-tertiaryText space-y-2 text-base">
            <div>
              <span className="mr-2 text-sm font-normal">Name:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {userData.name}
              </span>
            </div>
            <div>
              <span className="mr-2 text-sm font-normal">Email:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {userData.email}
              </span>
            </div>
            <div>
              <span className="mr-2 text-sm font-normal">Phone:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {userData.phone}
              </span>
            </div>
          </div>
        </div>
        {/* Product Details Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-[#1F1F1F]">
            Product Details
          </h2>
          <div className="text-tertiaryText space-y-2 text-base">
            <div>
              <span className="mr-2 text-sm font-normal">Order ID:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {productDetails.orderID}
              </span>
            </div>
            <div>
              <span className="mr-2 text-sm font-normal">Product Name:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {productDetails.productName}
              </span>
            </div>
            <div>
              <span className="mr-2 text-sm font-normal">Submitted On:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {productDetails.submittedOn}
              </span>
            </div>
            <div>
              <span className="mr-2 text-sm font-normal">Vendor:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {productDetails.vendor}
              </span>
            </div>
            <div>
              <span className="mr-2 text-sm font-normal">Price:</span>
              <span className="font-semibold text-[#1F1F1F]">
                {productDetails.price}
              </span>
            </div>
          </div>
        </div>
        {/* Feedback Message Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-normal text-gray-600">
            Feedback Message:
          </h2>
          <div className="text-tertiaryText rounded-lg bg-gray-50 p-4 text-sm leading-relaxed font-medium">
            {feedbackMessage}
          </div>
        </div>
        {/* Order Item Table */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-black">Order Item</h2>
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Product Image",
                    "Product Name",
                    "Vendor",
                    "Price",
                    "Quantity",
                    "Subtotal",
                  ].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-[#1F1F1F] uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderItems.map((item) => (
                  <tr key={item.id} className="transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.productName}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#5C5C5C]">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#5C5C5C]">
                      {item.vendor}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#5C5C5C]">
                      {item.price}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#5C5C5C]">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-[#5C5C5C]">
                      {item.subtotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sticky Footer for Actions */}
      <footer className="right-0 bottom-0 left-0 z-10 flex justify-end space-x-4 p-4">
        <button className="flex items-center rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-[#1F1F1F] transition-colors hover:bg-gray-50">
          Update Status
          <ChevronDownIcon className="ml-2 h-5 w-5 text-[#8D8D8D]" />
        </button>
        <button
          className="flex items-center rounded-lg bg-[#1F1F1F] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800"
          onClick={() => setShowModal(true)}
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Add Note
        </button>
      </footer>
      {showModal && <ReplyFeedback onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default FeedbackDetail;
