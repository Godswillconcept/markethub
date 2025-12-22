/**
 * Cart Migration Utilities
 * Handles data validation, sanitization, and migration for cart synchronization
 */

/**
 * Validates a single cart item structure
 * @param {Object} item - Cart item to validate
 * @returns {Object} - Validated and sanitized item
 */
export const validateCartItem = (item) => {
  if (!item || typeof item !== 'object') {
    throw new Error('Invalid cart item: not an object');
  }

  // Required fields
  if (!item.productId) {
    throw new Error('Invalid cart item: missing productId');
  }

  // Validate and sanitize data
  const validatedItem = {
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productId: String(item.productId),
    quantity: Math.max(1, Math.min(parseInt(item.quantity) || 1, 99)),
    selected_variants: Array.isArray(item.selected_variants) ? item.selected_variants : [],
    name: item.name || 'Unknown Product',
    price: parseFloat(item.price) || 0,
    newPrice: parseFloat(item.newPrice || item.price) || 0,
    thumbnail: item.thumbnail || '',
    color: item.color || '',
    size: item.size || '',
    addedAt: item.addedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return validatedItem;
};

/**
 * Validates and sanitizes entire cart array
 * @param {Array} cartItems - Array of cart items
 * @returns {Array} - Validated and sanitized cart items
 */
export const validateAndSanitizeCart = (cartItems) => {
  if (!Array.isArray(cartItems)) {
    console.warn('Cart data is not an array, returning empty array');
    return [];
  }

  const validatedItems = [];
  const errors = [];

  cartItems.forEach((item, index) => {
    try {
      const validatedItem = validateCartItem(item);
      validatedItems.push(validatedItem);
    } catch (error) {
      console.warn(`Invalid cart item at index ${index}:`, error.message);
      errors.push({ index, error: error.message, item });
    }
  });

  // Remove duplicates based on productId and variants
  const uniqueItems = removeDuplicateItems(validatedItems);

  if (errors.length > 0) {
    console.warn(`Cart validation completed with ${errors.length} errors:`, errors);
  }

  return uniqueItems;
};

/**
 * Removes duplicate cart items based on productId and selected_variants
 * @param {Array} items - Array of cart items
 * @returns {Array} - Array with duplicates removed
 */
export const removeDuplicateItems = (items) => {
  const seen = new Set();
  
  return items.filter(item => {
    const key = `${item.productId}-${JSON.stringify(item.selected_variants)}`;
    if (seen.has(key)) {
      console.warn(`Duplicate cart item found: productId ${item.productId}`);
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Checks if cart data is corrupted or invalid
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - Validation result with isValid flag and errors
 */
export const validateCartDataIntegrity = (cartItems) => {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    totalItems: 0,
    validItems: 0,
  };

  if (!Array.isArray(cartItems)) {
    result.isValid = false;
    result.errors.push('Cart data is not an array');
    return result;
  }

  result.totalItems = cartItems.length;
  result.validItems = cartItems.length;

  cartItems.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      result.isValid = false;
      result.errors.push(`Item at index ${index} is not an object`);
      result.validItems--;
      return;
    }

    if (!item.productId) {
      result.isValid = false;
      result.errors.push(`Item at index ${index} missing productId`);
      result.validItems--;
    }

    if (!item.quantity || item.quantity < 1) {
      result.warnings.push(`Item at index ${index} has invalid quantity`);
    }

    if (item.price && (isNaN(parseFloat(item.price)) || parseFloat(item.price) < 0)) {
      result.warnings.push(`Item at index ${index} has invalid price`);
    }
  });

  return result;
};

/**
 * Migrates cart data to new format if needed
 * @param {Array} cartItems - Array of cart items
 * @returns {Array} - Migrated cart items
 */
export const migrateCartData = (cartItems) => {
  try {
    const validation = validateCartDataIntegrity(cartItems);
    
    if (!validation.isValid) {
      throw new Error(`Cart data is invalid: ${validation.errors.join(', ')}`);
    }

    const sanitizedItems = validateAndSanitizeCart(cartItems);
    
    // Add migration metadata
    const migratedItems = sanitizedItems.map(item => ({
      ...item,
      migrated: true,
      migrationTimestamp: new Date().toISOString(),
      migrationVersion: '1.0'
    }));

    console.log(`Cart migration completed: ${cartItems.length} items processed, ${sanitizedItems.length} valid items`);
    
    return migratedItems;
  } catch (error) {
    console.error('Cart migration failed:', error);
    throw new Error(`Cart migration failed: ${error.message}`);
  }
};

/**
 * Gets cart migration status and statistics
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} - Migration status and statistics
 */
export const getCartMigrationStatus = (cartItems) => {
  const validation = validateCartDataIntegrity(cartItems);
  
  return {
    hasCartData: cartItems && cartItems.length > 0,
    isValid: validation.isValid,
    totalItems: validation.totalItems,
    validItems: validation.validItems,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
    errors: validation.errors,
    warnings: validation.warnings,
    needsMigration: !validation.isValid || validation.warnings.length > 0,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Creates a rollback point for cart data
 * @param {Array} currentCartItems - Current cart items
 * @returns {Object} - Rollback data structure
 */
export const createCartRollbackPoint = (currentCartItems) => {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    items: [...currentCartItems], // Deep copy
    itemCount: currentCartItems.length,
    checksum: generateCartChecksum(currentCartItems),
  };
};

/**
 * Generates a checksum for cart data integrity verification
 * @param {Array} cartItems - Array of cart items
 * @returns {string} - Checksum string
 */
export const generateCartChecksum = (cartItems) => {
  const cartString = JSON.stringify(cartItems.sort((a, b) => a.productId.localeCompare(b.productId)));
  let hash = 0;
  for (let i = 0; i < cartString.length; i++) {
    const char = cartString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Verifies cart data integrity using checksum
 * @param {Array} cartItems - Current cart items
 * @param {string} expectedChecksum - Expected checksum
 * @returns {boolean} - True if integrity is verified
 */
export const verifyCartIntegrity = (cartItems, expectedChecksum) => {
  const currentChecksum = generateCartChecksum(cartItems);
  return currentChecksum === expectedChecksum;
};

/**
 * Recovers corrupted cart data by removing invalid items
 * @param {Array} cartItems - Potentially corrupted cart items
 * @returns {Object} - Recovery result with cleaned data and statistics
 */
export const recoverCorruptedCart = (cartItems) => {
  if (!Array.isArray(cartItems)) {
    return {
      success: false,
      recoveredItems: [],
      originalCount: 0,
      recoveredCount: 0,
      removedItems: [],
      error: 'Cart data is not an array'
    };
  }

  const removedItems = [];
  const recoveredItems = [];

  cartItems.forEach((item, index) => {
    try {
      const validatedItem = validateCartItem(item);
      recoveredItems.push(validatedItem);
    } catch (error) {
      removedItems.push({
        index,
        item,
        reason: error.message,
        removedAt: new Date().toISOString()
      });
    }
  });

  return {
    success: true,
    recoveredItems,
    originalCount: cartItems.length,
    recoveredCount: recoveredItems.length,
    removedItems,
    recoveryRate: cartItems.length > 0 ? (recoveredItems.length / cartItems.length) : 1,
    timestamp: new Date().toISOString()
  };
};

const cartMigrationUtils = {
  validateCartItem,
  validateAndSanitizeCart,
  removeDuplicateItems,
  validateCartDataIntegrity,
  migrateCartData,
  getCartMigrationStatus,
  createCartRollbackPoint,
  generateCartChecksum,
  verifyCartIntegrity,
  recoverCorruptedCart
};

export default cartMigrationUtils;
