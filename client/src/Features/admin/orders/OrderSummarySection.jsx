import { format } from "date-fns";
function OrderSummarySection({ order }) {
  // Or directly in the main component
  if (!order?.data?.order) {
    return <div>No order data available</div>; // Fallback for safety
  }

  const actualOrder = order.data.order; // Extract the nested order for cleaner access
  console.log(actualOrder);

  // Optional: Calculate estimated delivery (e.g., 7 days from order_date; adjust logic as needed)
  const estimatedDelivery = actualOrder.order_date
    ? format(
        new Date(
          new Date(actualOrder.order_date).getTime() + 7 * 24 * 60 * 60 * 1000,
        ),
        "MMM dd, yyyy",
      )
    : "TBD";

  return (
    <section className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
      </div>
      <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <div className="p-4">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Order Number
          </div>
          <div className="text-sm font-medium text-gray-900">
            {actualOrder.order_number || actualOrder.id}{" "}
            {/* Use order_number for display; fallback to id */}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Order Date
          </div>
          <div className="text-sm text-gray-900">
            {actualOrder.order_date
              ? new Date(actualOrder.order_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Estimated Delivery
          </div>
          <div className="text-sm text-gray-900">{estimatedDelivery}</div>
        </div>
        <div className="p-4">
          <div className="mb-1 text-sm font-medium text-gray-500">
            Order Status
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              {actualOrder.order_status}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            Total Amount
          </span>
          <span className="text-lg font-bold text-gray-900">
            ${actualOrder.total_amount}{" "}
            {/* Add currency prefix if needed; format as decimal */}
          </span>
        </div>
      </div>
    </section>
  );
}

export default OrderSummarySection;
