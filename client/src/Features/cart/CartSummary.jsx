import { FiChevronRight, FiMapPin, FiShoppingCart, FiLoader, FiChevronLeft } from "react-icons/fi";
import SummaryItem from "./SummaryItem.jsx";
import { useNavigate } from "react-router";
import { useAddresses } from "../dashboardFeature/useAddresses.js";
import { useCartSummary } from "./useCartSummary.js";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtil.js";

// --- Helper for Currency Formatting ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
};

function CartSummary() {
  const navigate = useNavigate();
  
  // Fetch real data
  const { addresses, isLoading: isLoadingAddress } = useAddresses();
  const { data: cartData, isLoading: isLoadingCart } = useCartSummary();

  const isLoading = isLoadingAddress || isLoadingCart;

  // Derive data
  // Access the nested data property if it exists
  const cartValues = cartData?.data || {};

  // Get default address or fallback to first one
  const formatAddress = (addr) => {
    if (!addr) return "No address found";
    return `${addr.address_line}, ${addr.city}, ${addr.state}. | ${addr.phone}`;
  };

  const defaultAddress = addresses?.find((addr) => addr.is_default) || addresses?.[0];
  
  // Use a generic name or fetch user details if needed. 
  // For now, we'll use the address label or a generic "Customer" if name isn't available in address.
  const customerAddress = defaultAddress ? {
    id: defaultAddress.id,
    name: defaultAddress.label || "Customer Address", 
    address: formatAddress(defaultAddress),
  } : null;

  // Calculate dynamic delivery date
  const calculateDeliveryDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 5);

    // Function to add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const formatDate = (date) => {
      const day = getOrdinal(date.getDate());
      const month = date.toLocaleDateString('en-US', { month: 'long' });
      return `${day} ${month}`;
    };

    return `${formatDate(today)} - ${formatDate(futureDate)}`;
  };

  const deliveryDateString = calculateDeliveryDate();
  console.log('Cart items:', cartValues.items);

  // Map cart items from API response
  const cartItems = cartValues.items?.map(item => ({
    id: item.product?.id || Math.random(), // Fallback ID
    productId: item.product?.id, // Add explicit productId field
    category: item.product?.category?.name || "General",
    name: item.product?.name || "Unknown Item",
    price: parseFloat(item.product?.price || 0),
    quantity: item.quantity,
    deliveryDate: deliveryDateString, 
    imageUrl: getImageUrl(item.product?.thumbnail) || "/default-product.jpg",
    selected_variants: item.selected_variants || [],
    combination_id: item.combination_id || null,
  })) || [];

  console.log('Mapped cart items:', cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate or use provided summary
  const orderSummary = {
    subtotal: cartValues.subtotal || 0,
    vat: cartValues.tax || 0, // Tax might be missing in valid response, default to 0
    estimatedTotal: cartValues.total || 0, 
    checkoutAmount: cartValues.total || 0, 
  };

  const handleCheckout = () => {
    if (!defaultAddress) {
      toast.error("Please add a shipping address first");
      return;
    }

    // Instead of creating order here, navigate to payment summary
    navigate("/cart/payment");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
        <div className="flex flex-col items-center gap-2">
           <FiLoader className="animate-spin text-3xl text-gray-500" />
           <p className="text-gray-500 font-medium">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl rounded-lg bg-[#1018281A] p-4 lg:p-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
            Customer Address
          </h1>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 rounded-lg sm:p-8 md:grid-cols-2 lg:bg-white">
          {/* Left Section */}
          <div className="space-y-4 md:space-y-6">
            {/* Customer Address */}
            <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E5FE] text-[#F26732]">
                    <FiMapPin size={20} />
                  </div>
                  <h2 className="text-lg font-semibold sm:text-xl">
                    Customer Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/settings/addresses")}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-black"
                >
                  Change <FiChevronRight />
                </button>
              </div>
              <div className="text-gray-600">
                {customerAddress ? (
                    <>
                        <p className="font-semibold text-gray-800">
                        {customerAddress.name}
                        </p>
                        <p className="text-sm">{customerAddress.address}</p>
                    </>
                ) : (
                    <p className="text-sm text-red-500">Please add a delivery address</p>
                )}
              </div>
            </section>

            {/* Cart Summary */}
            <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E5FE] text-[#F26732]">
                    <FiShoppingCart size={20} />
                  </div>
                  <h2 className="text-lg font-semibold sm:text-xl">
                    Cart Summary
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-black"
                >
                  <FiChevronLeft /> Back to cart
                </button>
              </div>
              <div className="space-y-6">
                {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                    <SummaryItem key={item.id} item={item} />
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-4">Your cart is empty.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Section (Order Summary) */}
          <div className="md:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 sm:text-base">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium">
                    {formatCurrency(orderSummary.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 sm:text-base">
                  <span>VAT</span>
                  <span className="font-medium">
                    {formatCurrency(orderSummary.vat)}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-gray-600">JUST LIKE US</span>
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <hr className="my-4" />

              <div className="mb-6 flex justify-between text-base font-bold sm:text-lg">
                <span>Estimated total</span>
                <span>{formatCurrency(orderSummary.estimatedTotal)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || !customerAddress}
                className={`w-full rounded-2xl py-4 text-base font-semibold text-white transition sm:text-lg ${
                    cartItems.length === 0 || !customerAddress
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-black hover:bg-gray-900"
                }`}
              >
                Proceed to Checkout ({formatCurrency(orderSummary.checkoutAmount)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartSummary;
