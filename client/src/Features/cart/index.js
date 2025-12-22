// Export all cart-related components and hooks
export * from './slice';
export * from './CartProvider';
export * from './useUnifiedCart';
// Export the main hook that will be used by components
export { useCart } from './CartProvider';
