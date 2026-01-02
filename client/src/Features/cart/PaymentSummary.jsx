import { useState } from "react";
import { FiChevronLeft, FiLoader, FiGift, FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router";
import { useAddresses } from "../dashboardFeature/useAddresses.js";
import { useCartSummary } from "./useCartSummary.js";
import { useCreateOrder } from "../productFeatures/useCreateOrder.js";
import toast from "react-hot-toast";

// Payment Options
const paymentOptions = [
  {
    id: "paystack",
    label: "Pay Online with Paystack",
    description:
      "Securely use your credit/debit card or other payment methods via Paystack to complete your purchase",
    provider: "Paystack",
    icon: <FiCreditCard className="text-[#09A5DB] text-2xl" />,
  },
  {
    id: "giftcard",
    label: "Pay with Stylay giftcard",
    description:
      "Use your Stylay gift card balance to pay for this order",
    provider: "Internal",
    icon: <FiGift className="text-gray-600 text-2xl" />,
  },
];

// Currency formatter
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount || 0);

function PaymentSummary() {
  const [selected, setSelected] = useState("paystack");
  const navigate = useNavigate();
  const { createDirectOrder, isCreatingOrder } = useCreateOrder();
  
  // Fetch real data
  const { addresses, isLoading: isLoadingAddress } = useAddresses();
  const { data: cartData, isLoading: isLoadingCart } = useCartSummary();

  const isLoading = isLoadingAddress || isLoadingCart;

  // Derive data
  const cartValues = cartData?.data || {};
  const defaultAddress = addresses?.find((addr) => addr.is_default) || addresses?.[0];

  const orderSummary = {
    subtotal: cartValues.subtotal || 0,
    vat: cartValues.tax || 0,
    estimatedTotal: cartValues.total || 0,
    itemsCount: cartValues.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
  };

  const handleProceedToPayment = () => {
    if (!defaultAddress) {
      toast.error("Please add a shipping address first");
      navigate("/settings/addresses");
      return;
    }

    if (selected === "giftcard") {
      toast.error("Gift card payment is currently not supported. Please use Paystack.");
      return;
    }

    const payload = {
      addressId: defaultAddress.id,
      items: cartValues.items?.map(item => ({
        productId: item.product?.id,
        quantity: item.quantity,
        selected_variants: item.selected_variants || [],
        combinationId: item.combination_id || null,
      })),
      shippingCost: 1500, // Matching CartSummary default or from API
      taxAmount: 750,    // Matching CartSummary default or from API
      notes: "Payment from Payment Summary",
      paymentMethod: selected,
      callbackUrl: `${window.location.origin}/payment/verify`,
    };

    createDirectOrder(payload, {
      onSuccess: (data) => {
        // useCreateOrder.js handles redirection if it finds authorization_url
        console.log("Order created successfully:", data);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7]">
        <div className="flex flex-col items-center gap-2">
           <FiLoader className="animate-spin text-3xl text-gray-500" />
           <p className="text-gray-500 font-medium">Loading payment details...</p>
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
            Payment Summary
          </h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-800"
          >
            <FiChevronLeft className="mr-1" />
            Back to Confirm Order
          </button>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 rounded-lg sm:p-8 md:grid-cols-2 lg:bg-white">
          {/* Left Section - Payment Methods */}
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Select Payment Method</h2>
              <div className="space-y-4 md:space-y-6">
                {paymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                      selected === option.id
                        ? "border-black bg-gray-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {/* Radio + text */}
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={option.id}
                        checked={selected === option.id}
                        onChange={() => setSelected(option.id)}
                        className="mt-1 h-4 w-4 cursor-pointer accent-black"
                      />
                      <div className="flex gap-4">
                        <div className="mt-1">
                          {option.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {option.label}
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Provider tag */}
                    <span className="hidden sm:inline-block rounded-md border border-gray-300 px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                      {option.provider}
                    </span>
                  </label>
                ))}
              </div>

              {/* Proceed Button */}
              <button
                disabled={!selected || isCreatingOrder}
                onClick={handleProceedToPayment}
                className={`mt-6 w-full rounded-2xl py-4 text-base font-semibold transition sm:text-lg flex items-center justify-center gap-2 ${
                  selected && !isCreatingOrder
                    ? "bg-black text-white hover:bg-gray-900"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
              >
                {isCreatingOrder ? (
                  <>
                    <FiLoader className="animate-spin text-xl" />
                    Processing Order...
                  </>
                ) : (
                  `Proceed to Payment (${formatCurrency(orderSummary.estimatedTotal)})`
                )}
              </button>
            </section>
          </div>

          {/* Right Section - Order Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl text-gray-800">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 sm:text-base">
                  <span>Subtotal ({orderSummary.itemsCount} items)</span>
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

                <div className="flex justify-between text-sm text-gray-600 sm:text-base">
                  <span>Shipping Cost</span>
                  <span className="font-medium">
                    {formatCurrency(1500)}
                  </span>
                </div>
              </div>

              <hr className="my-4 border-gray-100" />

              <div className="flex justify-between text-base font-bold sm:text-lg text-gray-900">
                <span>Estimated total</span>
                <span>{formatCurrency(orderSummary.estimatedTotal + 1500 + 750)}</span> 
                {/* Note: In CartSummary, estimatedTotal was cartValues.total which might already include shipping/tax */}
              </div>
              <p className="mt-2 text-[10px] text-gray-400 italic">
                * Prices are inclusive of all taxes and shipping fees where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummary;
