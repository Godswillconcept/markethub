import { Dialog, DialogPanel } from "@headlessui/react";
import { BiX, BiMap } from "react-icons/bi";
import { getImageUrl } from "../../utils/imageUtil.js";
import { formatDateGB } from "../../utils/helper.js";

// Dummy shipment data
// const shipmentData = {
//   status: "Preparing", // options: "Preparing", "Out for delivery", "Delivered"
//   size: "Medium",
//   content: "Electronics - Laptop",
//   address: "24 Adeola Odeku St, Victoria Island, Lagos, Nigeria",
//   duration: "3 - 5 business days",
//   company: "DHL Express",
//   title: "Dell XPS 15 Laptop",
//   image:
//     "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop",
//   weight: "3.2 kg",
//   pieces: "1",
//   price: "$120",
// };

// function ShipmentModal({ shipment, isOpen, onClose }) {
//   // Steps for progress
//   const steps = ["Preparing", "Out for delivery", "Delivered"];

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <DialogPanel className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
//           {/* Header */}
//           <div className="flex items-center justify-between border-b px-6 py-4">
//             <h2 className="flex items-center gap-2 font-medium text-gray-800">
//               <span className="flex inline-block h-5 w-5 items-center justify-center rounded-sm bg-gray-800 text-xs text-white">
//                 🚚
//               </span>
//               Shipment no. #{shipment?.id}
//             </h2>
//             <button
//               onClick={onClose}
//               className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
//             >
//               <BiX className="h-6 w-6" />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="space-y-6 px-6 py-5">
//             <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//               {/* Left section */}
//               <div className="space-y-4">
//                 {/* Status bar */}
//                 <div>
//                   <p className="text-sm text-gray-500">Shipment status</p>
//                   <div className="flex flex-wrap items-center gap-3">
//                     {steps.map((step, i) => {
//                       const isActive = steps.indexOf(shipment?.status) >= i;
//                       return (
//                         <div key={step} className="flex items-center gap-2">
//                           <span
//                             className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-400"
//                               }`}
//                           >
//                             {step}
//                           </span>
//                           {i < steps.length - 1 && (
//                             <span
//                               className={`h-1 w-10 rounded md:w-12 ${isActive ? "bg-green-500" : "bg-gray-300"
//                                 }`}
//                             />
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500">Shipment Size</p>
//                   <p className="text-gray-800">{shipmentData.size}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Shipment Content</p>
//                   <p className="text-gray-800">{shipment?.name}</p>
//                 </div>
//               </div>

//               {/* Right section */}
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm text-gray-500">Deliver Address</p>
//                   <p className="flex items-center gap-1 break-words text-green-600">
//                     <BiMap className="h-4 w-4 shrink-0" />{" "}
//                     {shipmentData.address}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">
//                     Estimated shipping duration
//                   </p>
//                   <p className="text-gray-800">{shipmentData.duration}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Shipment Company</p>
//                   <p className="text-gray-800">{shipmentData.company}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Table with horizontal scroll on small screens */}
//             <div className="overflow-x-auto">
//               <div className="min-w-[500px] rounded-md border">
//                 <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
//                   <div>Ad Title</div>
//                   <div>Total Weight</div>
//                   <div>Number of pieces</div>
//                   <div>Shipment Price</div>
//                 </div>
//                 <div className="grid grid-cols-4 items-center bg-green-50 px-4 py-3 text-gray-800">
//                   <div className="flex items-center gap-2">
//                     <img
//                       src={shipmentData.image}
//                       alt={shipment?.name}
//                       className="h-10 w-10 rounded object-cover"
//                     />
//                     {shipmentData.title}
//                   </div>
//                   <div>{shipmentData.weight}</div>
//                   <div>{shipmentData.pieces}</div>
//                   <div>{shipment?.price}</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-center border-t px-6 py-4">
//             <button
//               onClick={onClose}
//               className="rounded-lg border border-green-600 px-6 py-2 font-medium text-green-600 hover:bg-green-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </DialogPanel>
//       </div>
//     </Dialog>
//   );
// }

// function ShipmentModal({ shipment = {}, isOpen, onClose, isLoading, error }) {
//   const steps = ["Preparing", "Out for delivery", "Delivered"];
//   const { details, items } = shipment

//   console.log("shipment modal shipment", shipment);
//   console.log("shipment modal details", details);

//   // Early return for loading state
//   if (isLoading) {
//     return (
//       <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//         <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
//         <div className="fixed inset-0 flex items-center justify-center">
//           <div className="rounded-xl bg-white p-8 shadow-lg text-center">
//             <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
//             <p className="text-gray-600 font-medium">Loading shipment details...</p>
//           </div>
//         </div>
//       </Dialog>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//         <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
//         <div className="fixed inset-0 flex items-center justify-center">
//           <div className="rounded-xl bg-white p-8 shadow-lg text-center">
//             <div className="text-red-600 mb-4">
//               <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//               </svg>
//             </div>
//             <p className="text-gray-800 font-medium mb-2">Failed to load shipment details</p>
//             <p className="text-gray-600 text-sm mb-4">Please try again later</p>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </Dialog>
//     );
//   }

//   // Prevent crash if shipment not yet ready
//   if (!shipment) return null;

//   // Use fallback safely
//   const shipmentData = {
//     size: shipment.size || "N/A",
//     name: shipment.name || "Unknown item",
//     address: `${details?.address?.address_line}, ${details?.address?.city}, ${details?.address?.state}` || "No address available",
//     duration: shipment.duration || "N/A",
//     company: shipment.company || "N/A",
//     image: shipment.image || "/placeholder.png",
//     title: shipment.title || shipment.name || "No title",
//     weight: shipment.weight || "—",
//     pieces: shipment.pieces || 1,
//     price: shipment.price || "—",
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <DialogPanel className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
//           {/* Header */}
//           <div className="flex items-center justify-between border-b px-6 py-4">
//             <h2 className="flex items-center gap-2 font-medium text-gray-800">
//               <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-gray-800 text-xs text-white">
//                 🚚
//               </span>
//               Shipment no. #{details?.id}
//             </h2>
//             <button
//               onClick={onClose}
//               className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
//             >
//               <BiX className="h-6 w-6" />
//             </button>
//           </div>

//           {/* Content */}
//           <div className="space-y-6 px-6 py-5">
//             <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//               {/* Left section */}
//               <div className="space-y-4">
//                 {/* Status bar */}
//                 <div>
//                   <p className="text-sm text-gray-500">Shipment status</p>
//                   <div className="flex flex-wrap items-center gap-3">
//                     {steps.map((step, i) => {
//                       const isActive = steps.indexOf(shipment?.status) >= i;
//                       return (
//                         <div key={step} className="flex items-center gap-2">
//                           <span
//                             className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-400"
//                               }`}
//                           >
//                             {step}
//                           </span>
//                           {i < steps.length - 1 && (
//                             <span
//                               className={`h-1 w-10 rounded md:w-12 ${isActive ? "bg-green-500" : "bg-gray-300"
//                                 }`}
//                             />
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-sm text-gray-500">Shipment Size</p>
//                   <p className="text-gray-800">{shipmentData.size}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Shipment Content</p>
//                   <p className="text-gray-800">{shipmentData.name}</p>
//                 </div>
//               </div>

//               {/* Right section */}
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm text-gray-500">Delivery Address</p>
//                   <p className="flex items-center gap-1 break-words text-green-600">
//                     <BiMap className="h-4 w-4 shrink-0" /> {shipmentData.address}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">
//                     Estimated shipping duration
//                   </p>
//                   <p className="text-gray-800">{shipmentData.duration}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500">Shipment Company</p>
//                   <p className="text-gray-800">{shipmentData.company}</p>
//                 </div>
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto">
//               <div className="min-w-[500px] rounded-md border">
//                 <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
//                   <div>Item Title</div>
//                   <div>Item Weight</div>
//                   <div>Number of pieces</div>
//                   <div>Item Price</div>
//                 </div>
//                 <div className="grid grid-cols-4 items-center bg-green-50 px-4 py-3 text-gray-800">
//                   <div className="flex items-center gap-2">
//                     <img
//                       src={shipmentData.image}
//                       alt={shipment?.name}
//                       className="h-10 w-10 rounded object-cover"
//                     />
//                     {shipmentData.title}
//                   </div>
//                   <div>{shipmentData.weight}</div>
//                   <div>{shipmentData.pieces}</div>
//                   <div>{shipmentData.price}</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-center border-t px-6 py-4">
//             <button
//               onClick={onClose}
//               className="rounded-lg border border-green-600 px-6 py-2 font-medium text-green-600 hover:bg-green-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </DialogPanel>
//       </div>
//     </Dialog>
//   );
// }

// export default ShipmentModal;
// import { Dialog, DialogPanel } from "@headlessui/react";
// import { BiX, BiMap } from "react-icons/bi";

function ShipmentModal({ shipment = {}, isOpen, onClose, isLoading, error }) {
  // Map order status to steps
  const statusSteps = {
    "processing": 0,
    "shipped": 1,
    "out-for-delivery": 2,
    "delivered": 3,
  };

  const steps = ["Processing", "Shipped", "Out for delivery", "Delivered"];

  console.log("shipment modal shipment", shipment);

  // Early return for loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-white p-8 shadow-lg text-center">
            <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading shipment details...</p>
          </div>
        </div>
      </Dialog>
    );
  }

  // Error state
  if (error) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="rounded-xl bg-white p-8 shadow-lg text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-800 font-medium mb-2">Failed to load shipment details</p>
            <p className="text-gray-600 text-sm mb-4">Please try again later</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    );
  }

  // Prevent crash if shipment not yet ready
  if (!shipment || !shipment.id) return null;

  // Extract data from shipment object
  const details = shipment.details || {};
  const address = details.address || {};
  const items = shipment.items || [];
  const user = shipment.user || {};

  // Calculate total items count
  const totalItems = items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  // Format address
  const deliveryAddress = address.address_line
    ? `${address.address_line}, ${address.city}, ${address.state}, ${address.country}`
    : "No address available";

  // Format date
  const orderDate = shipment.order_date ? formatDateGB(shipment.order_date) : "N/A";

  // Get current step index
  const currentStepIndex = statusSteps[shipment.order_status] || 0;

  // Format price
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? "$0.00" : `$${numPrice.toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
            <h2 className="flex items-center gap-2 font-medium text-gray-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-gray-800 text-xs text-white">
                🚚
              </span>
              Order #{shipment.id}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            >
              <BiX className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 px-6 py-5">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left section */}
              <div className="space-y-4">
                {/* Status bar */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Order status</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {steps.map((step, i) => {
                      const isActive = currentStepIndex >= i;
                      return (
                        <div key={step} className="flex items-center gap-2">
                          <span
                            className={`text-xs md:text-sm font-medium ${isActive ? "text-green-600" : "text-gray-400"
                              }`}
                          >
                            {step}
                          </span>
                          {i < steps.length - 1 && (
                            <span
                              className={`h-1 w-8 md:w-12 rounded ${isActive ? "bg-green-500" : "bg-gray-300"
                                }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="text-gray-800">{orderDate}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="text-gray-800 capitalize">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${shipment.payment_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {shipment.payment_status || "N/A"}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-gray-800">{totalItems} item(s)</p>
                </div>
              </div>

              {/* Right section */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Information</p>
                  <p className="text-gray-800">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Delivery Address</p>
                  <p className="flex items-start gap-1 break-words text-green-600">
                    <BiMap className="h-4 w-4 shrink-0 mt-1" />
                    {deliveryAddress}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-gray-800 capitalize">
                    {shipment.payment_method || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-800">{formatPrice(shipment.summary?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-800">{formatPrice(details.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-800">{formatPrice(details.tax_amount || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span className="text-gray-800">Total:</span>
                  <span className="text-green-600">{formatPrice(shipment.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[600px] rounded-md border">
                  <div className="grid grid-cols-5 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                    <div className="col-span-2">Product</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Price</div>
                    <div className="text-right">Subtotal</div>
                  </div>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <img
                            src={
                              getImageUrl(item.product?.images?.[0]?.image_url) ||
                              getImageUrl(item.product?.thumbnail) ||
                              "/placeholder.png"
                            }
                            alt={item.product?.name}
                            className="h-12 w-12 rounded object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder.png";
                            }}
                          />
                          <div>
                            <p className="font-medium">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.vendor?.store?.business_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-center">{item.quantity}</div>
                        <div className="text-right">{formatPrice(item.price)}</div>
                        <div className="text-right font-medium">
                          {formatPrice(item.sub_total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-center gap-3 border-t bg-white px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-green-600 px-6 py-2 font-medium text-green-600 hover:bg-green-50"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default ShipmentModal;