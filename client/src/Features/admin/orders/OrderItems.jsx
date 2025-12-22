import { getImageUrl } from "../../../utils/imageUtil.js";

const OrderItems = ({ actualOrder }) => {
  // Or directly in the main component
  if (!actualOrder?.items || actualOrder.items.length === 0) {
    return (
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 inline-block border-b-2 border-black text-lg font-bold text-gray-900">
          Order Items
        </h2>
        <p className="text-gray-500">No items in this order.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 inline-block border-b-2 border-black text-lg font-bold text-gray-900">
        Order Items
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Product Image
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Product Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Vendor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Quantity
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {actualOrder.items.map((item) => {
              // Helper to get the featured/primary image
              const productImage =
                getImageUrl(item.product?.images?.find((img) => img.is_featured)?.image_url) ||
                getImageUrl(item.product?.thumbnail) ||
                "/placeholder-image.jpg"; // Fallback to placeholder if needed
              const productName = item.product?.name || "Unknown Product";
              const vendorName =
                item.vendor?.store?.business_name || "Unknown Vendor";
              const price = `$${item.price}`; // Add currency; format as needed
              const quantity = item.quantity;
              const subtotal = `$${item.sub_total}`; // Use sub_total from data

              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={productImage}
                      alt={productName}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }} // Fallback on load error
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    {productName}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {vendorName}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {price}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                    {quantity}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                    {subtotal}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrderItems;
