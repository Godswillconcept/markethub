import React from "react";
import CartDetails from "./CartDetails.jsx";
import CartErrorBoundary from "./CartErrorBoundary.jsx";
import { BsCartX } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router-dom";
import { useUnifiedCart } from "./useUnifiedCart.js";
import { useUser } from "../authentication/useUser.js";
import { LoadingOverlay } from "../../ui/Loading/LoadingOverlay.jsx";
import { useSuggesstedProduct } from "../productFeatures/useSugesstedProduct.js";
import ProductCarousel from "../../ui/ProductCarousel.jsx";


function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { suggestedProduct, totalItems } = useSuggesstedProduct()
  const {
    cartItems,
    cartTotal,
    isLoading,
    isSyncing,
  } = useUnifiedCart();
  console.log("suggestedProduct", suggestedProduct);


  const handleCheckout = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
          returnTo: '/cart',
          message: 'Please login to checkout'
        },
      });
    } else {
      navigate("/cart/summary");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
      </div>
    );
  }

  return (
    <CartErrorBoundary>
      <div className="min-h-screen p-4 sm:p-8">
        <div className="mx-auto max-w-6xl bg-[#1018281A] p-4 sm:p-10">
          <h1 className="mb-2 text-3xl font-bold text-black">
            Cart ({cartItems.length})
          </h1>

          <div className="rounded-xl bg-white p-6 shadow-lg sm:p-8">
            {!cartItems || cartItems.length === 0 ? (
              // --- Empty Cart State ---
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BsCartX className="mb-4 text-6xl text-gray-300" />
                <h2 className="mb-2 text-2xl font-semibold">
                  Your cart is empty
                </h2>
                <p className="mb-6 text-gray-500">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8 lg:flex-row">
                {/* Left Section: Your Order */}
                <div className="w-full rounded-lg border border-gray-200 p-4 sm:p-6 lg:w-2/3">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-wide uppercase">
                      Your Order
                    </h2>
                    <span className="text-lg font-bold text-blue-600">
                      ({cartItems.length})
                    </span>
                  </div>

                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <CartDetails
                        key={item.productId}
                        item={item}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </div>

                  {/* Continue Shopping Button */}
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => navigate(-1)}
                      className="flex items-center text-gray-600 hover:text-black"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                      </svg>
                      Continue Shopping
                    </button>
                  </div>
                </div>

                {/* Right Section: Order Summary */}
                <div className="h-fit w-full rounded-lg border border-gray-200 p-6 lg:w-1/3">
                  <h2 className="mb-6 text-xl font-bold tracking-wide uppercase">
                    Order Summary
                  </h2>

                  {/* Order Total */}
                  <div className="space-y-4 border-b border-gray-200 pb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-6 mb-6 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    {user ? "Proceed to Checkout" : "Login to Checkout"}
                  </button>

                  {/* Secure Checkout */}
                  <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <ProductCarousel title="Suggested Products" newArrival={suggestedProduct} totalItems={totalItems} />

        <LoadingOverlay
          isLoading={isSyncing}
          message="Syncing cart..."
          fullScreen={true}
        />
      </div>
    </CartErrorBoundary>
  );
}

export default Cart;
