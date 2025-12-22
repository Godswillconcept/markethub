import axiosInstance from "./axios.js";

// Get user's cart
export const getCart = async () => {
  try {
    const response = await axiosInstance.get(`/cart`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (product_id, quantity = 1, selected_variants = []) => {
  try {
    const response = await axiosInstance.post(
      `/cart/items`,
      { product_id, quantity, selected_variants },
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  console.log(itemId, quantity);
  try {
    const response = await axiosInstance.put(
      `/cart/items/${itemId}`,
      { quantity },
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await axiosInstance.delete(
      `/cart/items/${itemId}`,
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete(`/cart/clear`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

// Sync cart with server
export const syncCart = async (localItems) => {
  console.log(localItems);
  try {
    const response = await axiosInstance.post(
      `/cart/sync`,
      { localItems },
      { withCredentials: true }
    );
    return response.data; // Assume server returns merged cart
  } catch (error) {
    console.error("Error syncing cart:", error);
    throw error;
  }
};

export const getCartSummary = async () => {
  try {
    const response = await axiosInstance.get(`/cart/summary`, {
      withCredentials: true,
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart summary:", error);
    throw error;
  }
};

// Create direct order (Buy Now)
export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(`/orders`, orderData, {
      withCredentials: true,
    });
    console.log("Order created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};