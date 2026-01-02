import { createContext, useContext } from 'react';

export const CartContext = createContext();

import { useUnifiedCart } from './useUnifiedCart.js';

export function CartProvider({ children }) {
  const cartData = useUnifiedCart();
  
  // Expose all data and methods from useUnifiedCart
  // This ensures sync logic runs globally and unified data is available
  const value = {
    ...cartData
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
