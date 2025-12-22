import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const cartItems = useSelector((state) => state.cart.items);
  
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce(
    (total, item) => total + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0
  );

  const value = {
    cartItems,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
