import {
  FiPlus,
  FiMinus,
  FiTrash,
  FiLoader,
  FiAlertTriangle,
  FiWifiOff,
} from "react-icons/fi";
import { useUnifiedCart } from "./useUnifiedCart.js";
import { useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import { getImageUrl } from "../../utils/imageUtil.js";

function CartDetails({ item, formatCurrency }) {
  const {
    updateQuantity,
    removeFromCart,
    isUpdating,
    isRemoving,
    optimisticUpdates,
    isProcessingQueue,
    currentErrors,
    isOnline,
  } = useUnifiedCart();

  // Check if this item is being optimistically updated or removed
  const isItemOptimistic = Array.from(optimisticUpdates.values()).some(
    (update) =>
      (update.type === "update" || update.type === "remove") &&
      update.itemId === item.id,
  );

  // Check if item is being processed in queue
  const isItemInQueue = isProcessingQueue;

  // Check if there are any errors related to this item`
  const itemErrors = Array.from(currentErrors.values()).filter(
    (error) => error.context?.itemId === item.id,
  );

  const MAX_QUANTITY = 10; // Or get from item.stock if available
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdatingLocal, setIsUpdatingLocal] = useState(false);

  // Update local quantity when item prop changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Debounced update function using useRef to maintain reference stability
  const debouncedUpdateRef = useRef(
    debounce((itemId, newQuantity) => {
      if (newQuantity > 0 && newQuantity <= MAX_QUANTITY) {
        updateQuantity(itemId, newQuantity);
      }
      setIsUpdatingLocal(false);
    }, 300),
  );

  // Update the ref when updateQuantity changes
  useEffect(() => {
    debouncedUpdateRef.current = debounce((itemId, newQuantity) => {
      if (newQuantity > 0 && newQuantity <= MAX_QUANTITY) {
        updateQuantity(itemId, newQuantity);
      }
      setIsUpdatingLocal(false);
    }, 300);
  }, [updateQuantity]);

  const handleQuantityChange = (itemId, change) => {
    const newQuantity = localQuantity + change;

    // Immediate local update for better UX
    setLocalQuantity(newQuantity);
    setIsUpdatingLocal(true);

    // Debounced API update
    debouncedUpdateRef.current(itemId, newQuantity);
  };

  // Direct remove handler - no debounce for delete actions
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // Combined loading state
  const isLoading =
    isUpdating || isUpdatingLocal || isItemOptimistic || isItemInQueue;

  // ADDED: Cleanup debounced functions on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      debouncedUpdateRef.current?.cancel?.();
    };
  }, []);

  return (
    <div
      key={item.productId}
      className={`flex flex-col items-center gap-4 border-b border-gray-200 pb-6 sm:flex-row ${
        isItemOptimistic ? "bg-blue-50 opacity-75" : ""
      } ${itemErrors.length > 0 ? "border-red-200 bg-red-50" : ""}`}
      aria-busy={isLoading}
    >
      <img
        src={getImageUrl(item.thumbnail) || "/default-product.jpg"}
        alt={item.name}
        className="h-[163px] w-[130px] rounded-lg object-cover"
      />

      <div className="flex-grow text-center sm:text-left">
        <div className="flex flex-col gap-7">
          <div className="flex justify-between">
            <div className="flex flex-col items-start">
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-gray-500">
                {item.color && <span>{item.color}</span>}
                {item.size && <span> / {item.size}</span>}
              </p>
              {isItemOptimistic && (
                <div className="mt-1 flex items-center text-xs text-blue-600">
                  <FiLoader className="mr-1 animate-spin" size={12} />
                  Updating...
                </div>
              )}
              {!isOnline && (
                <div className="mt-1 flex items-center text-xs text-orange-600">
                  <FiWifiOff className="mr-1" size={12} />
                  Offline - Changes will sync when online
                </div>
              )}
              {itemErrors.length > 0 && (
                <div className="mt-1 flex items-center text-xs text-red-600">
                  <FiAlertTriangle className="mr-1" size={12} />
                  {itemErrors[0].message}
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                disabled={isRemoving || isItemOptimistic}
                className={`mt-2 flex items-center hover:text-red-500 md:mt-0 ${
                  isRemoving || isItemOptimistic
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                aria-label={isRemoving ? "Removing item" : "Remove item"}
              >
                <FiTrash size={18} className="block md:hidden" />
                <span className="hidden text-sm underline md:block">
                  {isRemoving ? "Removing..." : "Delete"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center p-1">
              {/* decrement */}
              <button
                onClick={() => handleQuantityChange(item.id, -1)}
                disabled={isLoading || localQuantity <= 1}
                className={`rounded-md border border-gray-300 p-1 px-1.5 ${
                  isLoading || localQuantity <= 1
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                aria-label="Decrease quantity"
              >
                <FiMinus size={16} />
              </button>
              <span className="w-6 text-center font-bold" aria-live="polite">
                {isLoading ? (
                  <FiLoader className="mx-auto animate-spin" size={16} />
                ) : (
                  `(${localQuantity})`
                )}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, 1)}
                disabled={isLoading || localQuantity >= MAX_QUANTITY}
                className={`rounded-md border border-gray-300 p-1 px-1.5 ${
                  isLoading || localQuantity >= MAX_QUANTITY
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                aria-label="Increase quantity"
              >
                <FiPlus size={16} />
              </button>
            </div>
            <div>
              <div className="text-right">
                <p className="w-20 font-semibold">
                  {formatCurrency(item.price * localQuantity)}
                </p>
                {localQuantity >= MAX_QUANTITY && (
                  <p className="mt-1 text-xs text-red-500">
                    Max {MAX_QUANTITY} per order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDetails;
