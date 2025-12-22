/**
 * Enhanced Cart Synchronization Hook
 * Advanced sync state management with progress tracking and React Query integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cartSyncManager } from '../managers/CartSyncManager.js';
import { toast } from 'react-hot-toast';

export const useEnhancedCartSync = (options = {}) => {
  const queryClient = useQueryClient();
  const [syncState, setSyncState] = useState({
    isSyncing: false,
    progress: 0,
    currentPhase: 'idle',
    error: null,
    lastSyncTime: null,
    syncId: null,
    needsSync: false,
    localCartItems: 0,
  });
  
  const [syncOptions, setSyncOptions] = useState({
    autoSync: true,
    showNotifications: true,
    enableRollback: true,
    maxRetries: 3,
    ...options,
  });

  const syncUnsubscribeRef = useRef(null);
  const retryCountRef = useRef(0);
  const syncInProgressRef = useRef(false);

  // Initialize sync state from CartSyncManager
  useEffect(() => {
    const updateSyncState = (newSyncState) => {
      setSyncState(prev => ({
        ...prev,
        ...newSyncState,
        needsSync: cartSyncManager.needsSync(),
        localCartItems: cartSyncManager.getLocalCart().items?.length || 0,
      }));
    };

    // Subscribe to cart sync manager updates
    const listenerId = `enhanced-sync-${Date.now()}`;
    syncUnsubscribeRef.current = cartSyncManager.subscribe(listenerId, updateSyncState);

    // Get initial state
    const initialState = cartSyncManager.getSyncState();
    updateSyncState(initialState);

    return () => {
      if (syncUnsubscribeRef.current) {
        syncUnsubscribeRef.current();
      }
    };
  }, []);

  /**
   * Enhanced sync with advanced error handling and retry logic
   */
  const performEnhancedSync = useCallback(async (customOptions = {}) => {
    // Prevent concurrent syncs
    if (syncInProgressRef.current) {
      console.log('Sync already in progress, skipping...');
      return { success: false, message: 'Sync already in progress' };
    }

    syncInProgressRef.current = true;
    retryCountRef.current = 0;

    const mergedOptions = { ...syncOptions, ...customOptions };
    const syncId = `enhanced-sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Update UI state
      setSyncState(prev => ({
        ...prev,
        isSyncing: true,
        progress: 0,
        currentPhase: 'starting-enhanced-sync',
        error: null,
        syncId,
        lastSyncTime: new Date().toISOString(),
      }));

      if (mergedOptions.showNotifications) {
        toast.loading('Starting cart synchronization...', { id: syncId });
      }

      // Check if sync is needed
      if (!cartSyncManager.needsSync()) {
        const result = {
          success: true,
          message: 'No cart data to synchronize',
          syncedItems: 0,
        };

        setSyncState(prev => ({
          ...prev,
          isSyncing: false,
          currentPhase: 'no-sync-needed',
          progress: 100,
        }));

        if (mergedOptions.showNotifications) {
          toast.success('Cart is already up to date', { id: syncId });
        }

        return result;
      }

      // Perform the actual sync with retry logic
      const result = await performSyncWithRetry(mergedOptions, syncId);

      // Update final state
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        currentPhase: result.success ? 'completed' : 'failed',
        progress: result.success ? 100 : 0,
        error: result.success ? null : result.error,
        needsSync: cartSyncManager.needsSync(),
        localCartItems: cartSyncManager.getLocalCart().items?.length || 0,
      }));

      // Show success/error notifications
      if (mergedOptions.showNotifications) {
        if (result.success) {
          toast.success(
            `Cart synchronized! ${result.syncedItems} items synced.`,
            { id: syncId }
          );
        } else {
          toast.error(
            `Cart sync failed: ${result.error}`,
            { id: syncId }
          );
        }
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });

      return result;

    } catch (error) {
      console.error('Enhanced cart sync error:', error);
      
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        currentPhase: 'error',
        error: error.message,
        progress: 0,
      }));

      if (mergedOptions.showNotifications) {
        toast.error(`Sync error: ${error.message}`, { id: syncId });
      }

      return { success: false, error: error.message };

    } finally {
      syncInProgressRef.current = false;
    }
  }, [syncOptions, queryClient]);

  /**
   * Sync with retry logic and exponential backoff
   */
  const performSyncWithRetry = async (options, syncId) => {
    const maxRetries = options.maxRetries || 3;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // Update progress
        setSyncState(prev => ({
          ...prev,
          currentPhase: `sync-attempt-${attempt}`,
          progress: Math.min(90, (attempt - 1) * 30),
        }));

        // Perform the actual sync
        const result = await cartSyncManager.synchronizeCart(options);

        if (result.success) {
          return {
            success: true,
            syncedItems: result.syncedItems || 0,
            serverResult: result.serverResult,
            attempt,
            localCart: result.localCart,
          };
        } else {
          throw new Error(result.error || 'Sync operation failed');
        }

      } catch (error) {
        console.warn(`Sync attempt ${attempt} failed:`, error.message);
        retryCountRef.current = attempt;

        // If it's the last attempt, throw the error
        if (attempt > maxRetries) {
          throw new Error(`All ${maxRetries} sync attempts failed. Last error: ${error.message}`);
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        
        setSyncState(prev => ({
          ...prev,
          currentPhase: `retrying-${attempt}`,
          progress: Math.min(80, (attempt - 1) * 20),
        }));

        if (options.showNotifications) {
          toast.loading(`Retrying sync in ${delay/1000}s... (${attempt}/${maxRetries})`, { 
            id: syncId 
          });
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Unexpected error in sync retry logic');
  };

  /**
   * Manual sync trigger
   */
  const triggerSync = useCallback(async (customOptions = {}) => {
    console.log('Manual cart sync triggered');
    return await performEnhancedSync(customOptions);
  }, [performEnhancedSync]);

  /**
   * Check if cart needs synchronization
   */
  const checkSyncNeed = useCallback(() => {
    const needsSync = cartSyncManager.needsSync();
    setSyncState(prev => ({
      ...prev,
      needsSync,
      localCartItems: cartSyncManager.getLocalCart().items?.length || 0,
    }));
    return needsSync;
  }, []);

  /**
   * Get sync statistics
   */
  const getSyncStats = useCallback(() => {
    const localCart = cartSyncManager.getLocalCart();
    return {
      needsSync: cartSyncManager.needsSync(),
      localItemsCount: localCart.items?.length || 0,
      lastSyncTime: syncState.lastSyncTime,
      syncState: syncState.currentPhase,
      isCurrentlySyncing: syncState.isSyncing,
      progress: syncState.progress,
    };
  }, [syncState]);

  /**
   * Force clear local cart (for testing or manual cleanup)
   */
  const clearLocalCart = useCallback(() => {
    const result = cartSyncManager.clearLocalCart();
    if (result.success) {
      setSyncState(prev => ({
        ...prev,
        needsSync: false,
        localCartItems: 0,
        currentPhase: 'local-cleared',
      }));
    }
    return result;
  }, []);

  /**
   * Get current local cart data
   */
  const getLocalCart = useCallback(() => {
    return cartSyncManager.getLocalCart();
  }, []);

  /**
   * Reset sync state
   */
  const resetSyncState = useCallback(() => {
    setSyncState(prev => ({
      ...prev,
      isSyncing: false,
      progress: 0,
      currentPhase: 'idle',
      error: null,
      syncId: null,
    }));
    retryCountRef.current = 0;
    syncInProgressRef.current = false;
  }, []);

  // Auto-sync effect
  useEffect(() => {
    if (syncOptions.autoSync && syncState.needsSync && !syncState.isSyncing && !syncInProgressRef.current) {
      // Debounce auto-sync to avoid excessive syncing
      const timeoutId = setTimeout(() => {
        performEnhancedSync();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [syncState.needsSync, syncState.isSyncing, syncOptions.autoSync, performEnhancedSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncUnsubscribeRef.current) {
        syncUnsubscribeRef.current();
      }
    };
  }, []);

  return {
    // State
    ...syncState,
    
    // Actions
    triggerSync,
    checkSyncNeed,
    clearLocalCart,
    resetSyncState,
    
    // Utilities
    getSyncStats,
    getLocalCart,
    
    // Configuration
    updateSyncOptions: setSyncOptions,
    syncOptions,
    
    // Computed
    canSync: !syncState.isSyncing,
    syncInProgress: syncState.isSyncing,
    hasLocalCart: syncState.localCartItems > 0,
  };
};

export default useEnhancedCartSync;
