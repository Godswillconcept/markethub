import { createSlice } from "@reduxjs/toolkit";

// Helper function to load cart from localStorage with enhanced error handling
const loadCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem("cart");
    if (!cart) return [];

    const parsedCart = JSON.parse(cart);

    // Validate that parsed cart is an array
    if (!Array.isArray(parsedCart)) {
      console.warn("Invalid cart format in localStorage, resetting to empty array");
      localStorage.removeItem("cart");
      return [];
    }

    // Validate cart items structure
    const validItems = parsedCart.filter(item => {
      if (!item || typeof item !== 'object') {
        console.warn("Invalid cart item found, removing:", item);
        return false;
      }

      // Ensure required fields exist
      if (!item.productId || !item.id) {
        console.warn("Cart item missing required fields, removing:", item);
        return false;
      }

      return true;
    });

    // If some items were invalid, update localStorage with cleaned data
    if (validItems.length !== parsedCart.length) {
      localStorage.setItem("cart", JSON.stringify(validItems));
    }

    return validItems;
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);

    // Try to recover by clearing corrupted data
    try {
      localStorage.removeItem("cart");
    } catch (clearError) {
      console.error("Failed to clear corrupted cart data:", clearError);
    }

    return [];
  }
};

const initialState = {
  items: loadCartFromLocalStorage(),
  lastUpdated: null,
};
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      try {
        const {
          id,
          productId,
          quantity = 1,
          selected_variants = [],
          name,
          price,
          thumbnail,
          color,
          size,
          newPrice,
        } = action.payload;

        if (!productId) {
          console.error('Cannot add to cart: Missing productId');
          return;
        }

        // Validate quantity
        const validQuantity = Math.max(1, Math.min(quantity || 1, 99));

        const existingItemIndex = state.items.findIndex(
          (item) =>
            item.productId === productId &&
            JSON.stringify(item.selected_variants) ===
            JSON.stringify(selected_variants)
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item with same variants already exists
          const newQuantity = state.items[existingItemIndex].quantity + validQuantity;
          state.items[existingItemIndex].quantity = Math.min(newQuantity, 99); // Cap at 99
        } else {
          // Add new item to cart
          state.items.push({
            id: id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId,
            quantity: validQuantity,
            selected_variants,
            name,
            newPrice: newPrice || price,
            price,
            thumbnail,
            color,
            size,
            addedAt: new Date().toISOString(),
          });
        }

        state.lastUpdated = new Date().toISOString();

        // Safely save to localStorage
        try {
          localStorage.setItem("cart", JSON.stringify(state.items));
        } catch (storageError) {
          console.error('Failed to save cart to localStorage:', storageError);
          // Try to free up space by removing oldest items if quota exceeded
          if (storageError.name === 'QuotaExceededError' && state.items.length > 1) {
            state.items = state.items.slice(-10); // Keep only last 10 items
            try {
              localStorage.setItem("cart", JSON.stringify(state.items));
            } catch (retryError) {
              console.error('Still failed to save cart after cleanup:', retryError);
            }
          }
        }
      } catch (error) {
        console.error('Error in addToCart reducer:', error);
      }
    },
    updateCartItem: (state, action) => {
      try {
        const { itemId, quantity } = action.payload;

        if (!itemId || quantity === undefined) {
          console.error('Invalid updateCartItem payload:', action.payload);
          return;
        }

        // Validate quantity
        const validQuantity = Math.max(0, Math.min(quantity, 99));

        const itemIndex = state.items.findIndex(
          (item) => item.id === itemId || item.productId === itemId
        );

        if (itemIndex >= 0) {
          if (validQuantity <= 0) {
            // Remove item if quantity is 0 or less
            state.items.splice(itemIndex, 1);
          } else {
            // Update quantity
            state.items[itemIndex].quantity = validQuantity;
            // Update the last updated timestamp
            state.items[itemIndex].updatedAt = new Date().toISOString();
          }
          state.lastUpdated = new Date().toISOString();

          // Safely save to localStorage
          try {
            localStorage.setItem("cart", JSON.stringify(state.items));
          } catch (storageError) {
            console.error('Failed to save cart to localStorage:', storageError);
          }
        } else {
          console.warn(`Item with ID ${itemId} not found in cart`);
        }
      } catch (error) {
        console.error('Error in updateCartItem reducer:', error);
      }
    },
    removeFromCart: (state, action) => {
      try {
        const itemId = action.payload?.itemId || action.payload?.id;
        if (!itemId) {
          console.error(
            'Cannot remove item: Missing itemId in payload',
            action.payload
          );
          return;
        }

        const initialLength = state.items.length;
        state.items = state.items.filter(
          (item) => item.id !== itemId && item.productId !== itemId
        );

        if (state.items.length < initialLength) {
          state.lastUpdated = new Date().toISOString();

          // Safely save to localStorage
          try {
            localStorage.setItem("cart", JSON.stringify(state.items));
          } catch (storageError) {
            console.error('Failed to save cart to localStorage:', storageError);
          }
        } else {
          console.warn(`Item with ID ${itemId} not found in cart`);
        }
      } catch (error) {
        console.error('Error in removeFromCart reducer:', error);
      }
    },
    setCartItems: (state, action) => {
      try {
        // Validate payload
        const newItems = action.payload;
        if (!Array.isArray(newItems)) {
          console.error('setCartItems: Payload must be an array');
          return;
        }

        state.items = newItems;
        state.lastUpdated = new Date().toISOString();

        // Safely save to localStorage
        try {
          localStorage.setItem("cart", JSON.stringify(state.items));
        } catch (storageError) {
          console.error('Failed to save cart to localStorage:', storageError);
          // If storage fails, try with reduced items
          if (storageError.name === 'QuotaExceededError' && state.items.length > 0) {
            state.items = state.items.slice(-5); // Keep only last 5 items
            try {
              localStorage.setItem("cart", JSON.stringify(state.items));
            } catch (retryError) {
              console.error('Still failed to save cart after reduction:', retryError);
            }
          }
        }
      } catch (error) {
        console.error('Error in setCartItems reducer:', error);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
      localStorage.removeItem("cart");
    },
  },
});

// Export actions
export const {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (total, item) => total + (parseFloat(item.price) || 0) * item.quantity,
    0
  );

export const selectIsInCart = (state, itemId) =>
  state.cart.items.some((item) => item.id === itemId);

export const selectCartLastUpdated = (state) => state.cart.lastUpdated;
