import { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";

// Dummy Data
const paymentOptions = [
  {
    id: "kora",
    label: "Pay Online with Kora",
    description:
      "Securely use your credit/debit card or other payment methods via Kora to complete your purchase",
    provider: "Paystack",
  },
  {
    id: "giftcard",
    label: "Pay with Stylay giftcard",
    description:
      "Securely use your credit/debit card or other payment methods via Kora to complete your purchase",
    provider: "Paystack",
  },
];

const orderSummary = {
  subtotal: 46399,
  vat: 46399,
  estimatedTotal: 100000,
  items: 3,
};

// Currency formatter
const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

function PaymentSummary() {
  const [selected, setSelected] = useState(null);

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
            className="mt-2 flex items-center text-sm text-gray-500 hover:text-gray-800"
          >
            <FiChevronLeft className="mr-1" />
            Confirm Order
          </button>
        </header>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 rounded-lg sm:p-8 md:grid-cols-2 lg:bg-white">
          {/* Left Section - Payment Methods */}
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <div className="space-y-4 md:space-y-6">
                {paymentOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${
                      selected === option.id
                        ? "border-black"
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
                      <div>
                        <p className="font-medium text-gray-800">
                          {option.label}
                        </p>
                        <p className="text-sm text-gray-500">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    {/* Provider button */}
                    <span className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600">
                      {option.provider}
                    </span>
                  </label>
                ))}
              </div>

              {/* Proceed Button */}
              <button
                disabled={!selected}
                className={`mt-6 w-full rounded-2xl py-4 text-base font-semibold transition sm:text-lg ${
                  selected
                    ? "bg-black text-white hover:bg-gray-900"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
              >
                Proceed to Payment
              </button>
            </section>
          </div>

          {/* Right Section - Order Summary */}
          <div className="md:col-span-1">
            <div className="sticky top-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold sm:text-xl">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600 sm:text-base">
                  <span>Subtotal ({orderSummary.items} items)</span>
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
              </div>

              <hr className="my-4" />

              <div className="flex justify-between text-base font-bold sm:text-lg">
                <span>Estimated total</span>
                <span>{formatCurrency(orderSummary.estimatedTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummary;
