/**
 * Centralized Cart Synchronization Manager
 * Handles all cart synchronization operations with singleton pattern
 */

import {
  validateAndSanitizeCart,
  getCartMigrationStatus,
  createCartRollbackPoint,
  recoverCorruptedCart,
  verifyCartIntegrity
} from '../utils/cartMigration.js';
import { syncCart } from '../services/apiCart.js';

class CartSyncManager {
  constructor() {
    this.instance = null;
    this.syncState = {
      isSyncing: false,
      progress: 0,
      currentPhase: 'idle',
      error: null,
      lastSyncTime: null,
      rollbackPoint: null,
      syncId: null,
    };
    this.listeners = new Map();
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    };
  }

  /**
   * Singleton pattern implementation
   */
  static getInstance() {
    if (!CartSyncManager.instance) {
      CartSyncManager.instance = new CartSyncManager();
    }
    return CartSyncManager.instance;
  }

  /**
   * Subscribe to sync state changes
   */
  subscribe(listenerId, callback) {
    this.listeners.set(listenerId, callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listenerId);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.syncState);
      } catch (error) {
        console.error('Error in cart sync listener:', error);
      }
    });
  }

  /**
   * Update sync state
   */
  updateSyncState(updates) {
    this.syncState = { ...this.syncState, ...updates };
    this.notifyListeners();
  }

  /**
   * Get local cart data from localStorage with validation
   */
  getLocalCart() {
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) {
        return { items: [], status: 'no-data' };
      }

      const parsedCart = JSON.parse(cartData);
      
      // Validate and sanitize cart data
      const migrationStatus = getCartMigrationStatus(parsedCart);
      
      if (!migrationStatus.isValid) {
        console.warn('Invalid cart data detected, attempting recovery');
        const recovery = recoverCorruptedCart(parsedCart);
        
        if (recovery.success && recovery.recoveredItems.length > 0) {
          // Update localStorage with recovered data
          localStorage.setItem('cart', JSON.stringify(recovery.recoveredItems));
          return { 
            items: recovery.recoveredItems, 
            status: 'recovered',
            recovery 
          };
        } else {
          console.error('Cart data recovery failed, clearing corrupted data');
          localStorage.removeItem('cart');
          return { items: [], status: 'corrupted-and-cleared' };
        }
      }

      const sanitizedItems = validateAndSanitizeCart(parsedCart);
      
      if (sanitizedItems.length !== parsedCart.length) {
        console.log('Cart data sanitized, updating localStorage');
        localStorage.setItem('cart', JSON.stringify(sanitizedItems));
      }

      return { 
        items: sanitizedItems, 
        status: migrationStatus.needsMigration ? 'needs-migration' : 'valid',
        migrationStatus 
      };
    } catch (error) {
      console.error('Error reading local cart:', error);
      localStorage.removeItem('cart');
      return { items: [], status: 'error', error: error.message };
    }
  }

  /**
   * Create rollback point before sync
   */
  createRollbackPoint() {
    try {
      const { items } = this.getLocalCart();
      const rollbackPoint = createCartRollbackPoint(items);
      this.syncState.rollbackPoint = rollbackPoint;
      console.log('Cart rollback point created:', rollbackPoint.itemCount, 'items');
      return rollbackPoint;
    } catch (error) {
      console.error('Failed to create rollback point:', error);
      return null;
    }
  }

  /**
   * Restore from rollback point
   */
  async restoreFromRollback() {
    try {
      const { rollbackPoint } = this.syncState;
      if (!rollbackPoint) {
        throw new Error('No rollback point available');
      }

      // Verify rollback data integrity
      const isValid = verifyCartIntegrity(rollbackPoint.items, rollbackPoint.checksum);
      if (!isValid) {
        throw new Error('Rollback data integrity check failed');
      }

      // Restore to localStorage
      localStorage.setItem('cart', JSON.stringify(rollbackPoint.items));
      
      this.updateSyncState({
        currentPhase: 'restored',
        error: null,
        rollbackPoint: null, // Clear after successful restore
      });

      console.log('Cart restored from rollback point successfully');
      return { success: true, restoredItems: rollbackPoint.items.length };
    } catch (error) {
      console.error('Failed to restore from rollback point:', error);
      this.updateSyncState({
        currentPhase: 'restore-failed',
        error: `Rollback failed: ${error.message}`,
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Main synchronization method
   */
  async synchronizeCart(options = {}) {
    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Prevent concurrent syncs
      if (this.syncState.isSyncing) {
        throw new Error('Cart sync already in progress');
      }

      this.updateSyncState({
        isSyncing: true,
        syncId,
        progress: 0,
        currentPhase: 'starting',
        error: null,
        lastSyncTime: new Date().toISOString(),
      });

      // Step 1: Get local cart data
      this.updateSyncState({ currentPhase: 'reading-local', progress: 10 });
      const localCart = this.getLocalCart();

      if (!localCart.items || localCart.items.length === 0) {
        this.updateSyncState({
          isSyncing: false,
          currentPhase: 'no-local-data',
          progress: 100,
        });
        return { 
          success: true, 
          message: 'No local cart data to synchronize',
          syncedItems: 0 
        };
      }

      // Step 2: Create rollback point
      this.updateSyncState({ currentPhase: 'creating-rollback', progress: 20 });
      this.createRollbackPoint();

      // Step 3: Sync with server
      this.updateSyncState({ currentPhase: 'syncing-server', progress: 30 });
      const syncResult = await this.syncWithServer(localCart.items, options);

      // Step 4: Handle sync result
      this.updateSyncState({ currentPhase: 'processing-result', progress: 80 });
      await this.handleSyncResult(syncResult);

      // Step 5: Complete sync
      this.updateSyncState({
        isSyncing: false,
        currentPhase: 'completed',
        progress: 100,
        rollbackPoint: null, // Clear rollback point on success
      });

      return {
        success: true,
        syncedItems: localCart.items.length,
        serverResult: syncResult,
        localCart: localCart,
      };

    } catch (error) {
      console.error('Cart synchronization failed:', error);
      
      // Attempt rollback on failure
      await this.handleSyncFailure(error);
      
      return {
        success: false,
        error: error.message,
        syncId,
        localCart: this.getLocalCart(),
      };
    }
  }

  /**
   * Sync cart items with server
   */
  async syncWithServer(localItems) {
    let lastError;
    const { maxRetries, retryDelay, backoffMultiplier } = this.retryConfig;

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        this.updateSyncState({
          currentPhase: `syncing-server-attempt-${attempt}`,
          progress: 30 + (attempt - 1) * 10,
        });

        // Use the existing syncCart API
        const result = await syncCart(localItems);
        
        return {
          success: true,
          data: result,
          attempt,
          localItemsCount: localItems.length,
        };

      } catch (error) {
        lastError = error;
        console.warn(`Sync attempt ${attempt} failed:`, error.message);

        // Don't retry on client errors (4xx), only server errors (5xx) or network issues
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }

        if (attempt <= maxRetries) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
          console.log(`Retrying sync in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }

    throw lastError || new Error('All sync attempts failed');
  }

  /**
   * Handle successful sync result
   */
  async handleSyncResult(syncResult) {
    try {
      if (syncResult.success && syncResult.data) {
        // Update local cart with server response if needed
        if (syncResult.data.mergedCart) {
          localStorage.setItem('cart', JSON.stringify(syncResult.data.mergedCart));
        }
        
        console.log('Cart sync completed successfully');
        this.updateSyncState({
          currentPhase: 'sync-completed',
          progress: 100,
        });
      } else {
        throw new Error('Server returned unsuccessful sync result');
      }
    } catch (error) {
      console.error('Error handling sync result:', error);
      throw error;
    }
  }

  /**
   * Handle sync failure with rollback
   */
  async handleSyncFailure(error) {
    this.updateSyncState({
      isSyncing: false,
      currentPhase: 'failed',
      error: error.message,
      progress: 0,
    });

    // Try to restore from rollback point
    if (this.syncState.rollbackPoint) {
      console.log('Attempting rollback due to sync failure...');
      try {
        await this.restoreFromRollback();
        this.updateSyncState({
          currentPhase: 'rolled-back',
          error: `Sync failed, rolled back: ${error.message}`,
        });
      } catch (rollbackError) {
        console.error('Rollback also failed:', rollbackError);
        this.updateSyncState({
          currentPhase: 'rollback-failed',
          error: `Sync failed and rollback failed: ${error.message}`,
        });
      }
    }
  }

  /**
   * Check if cart needs synchronization
   */
  needsSync() {
    try {
      const { items } = this.getLocalCart();
      return items && items.length > 0;
    } catch (error) {
      console.error('Error checking sync requirements:', error);
      return false;
    }
  }

  /**
   * Get current sync state
   */
  getSyncState() {
    return { ...this.syncState };
  }

  /**
   * Clear local cart data
   */
  clearLocalCart() {
    try {
      localStorage.removeItem('cart');
      this.updateSyncState({ currentPhase: 'local-cleared' });
      console.log('Local cart data cleared');
      return { success: true };
    } catch (error) {
      console.error('Failed to clear local cart:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual sync trigger (can be used for testing or manual sync)
   */
  async triggerSync(options = {}) {
    console.log('Manual cart sync triggered');
    return await this.synchronizeCart(options);
  }

  /**
   * Utility: delay function for retries
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup method for component unmount
   */
  cleanup() {
    this.listeners.clear();
    this.updateSyncState({
      isSyncing: false,
      currentPhase: 'cleaned',
      progress: 0,
    });
  }
}

// Export singleton instance
export const cartSyncManager = CartSyncManager.getInstance();
export default CartSyncManager;
