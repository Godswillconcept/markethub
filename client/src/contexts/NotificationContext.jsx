import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initializeWebSocket, disconnectWebSocket } from '../services/websocket';
import { getUnreadCount } from '../services/apiNotification';

/**
 * Notification Context
 * Global state management for notifications across the application
 */

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [socketInitialized, setSocketInitialized] = useState(false);

  // Initialize WebSocket on mount
  useEffect(() => {
    const socket = initializeWebSocket();
    
    if (socket) {
      setSocketInitialized(true);
      
      // Fetch initial unread count
      fetchUnreadCount();
    }

    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    if (!socketInitialized) return;

    // Handle new notification
    const handleNewNotification = (event) => {
      const { notification } = event.detail;
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev]);
      
      // Increment unread count
      setUnreadCount(prev => prev + 1);
      
      // Show toast notification
      if ('Notification' in window) {
        window.Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new window.Notification(notification.message);
          }
        });
      }
    };

    // Handle notification update
    const handleNotificationUpdated = (event) => {
      const { notification, notificationId, isRead } = event.detail;
      
      if (notification) {
        // Update notification in list
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, ...notification } : n
          )
        );
      } else if (notificationId && isRead !== undefined) {
        // Update by ID
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: isRead } : n
          )
        );
        
        // Update unread count if marked as read
        if (isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    };

    // Handle notification deletion
    const handleNotificationDeleted = (event) => {
      const { notificationId } = event.detail;
      
      // Remove from list
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count (if it was unread)
      const deletedNotif = notifications.find(n => n.id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    };

    // Handle unread count update
    const handleUnreadCountUpdated = (event) => {
      const { count } = event.detail;
      setUnreadCount(count);
    };

    // Add event listeners
    window.addEventListener('new_notification', handleNewNotification);
    window.addEventListener('notification_updated', handleNotificationUpdated);
    window.addEventListener('notification_deleted', handleNotificationDeleted);
    window.addEventListener('unread_count_updated', handleUnreadCountUpdated);

    // Cleanup
    return () => {
      window.removeEventListener('new_notification', handleNewNotification);
      window.removeEventListener('notification_updated', handleNotificationUpdated);
      window.removeEventListener('notification_deleted', handleNotificationDeleted);
      window.removeEventListener('unread_count_updated', handleUnreadCountUpdated);
    };
  }, [socketInitialized, notifications]);

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    setDropdownOpen(prev => !prev);
  }, []);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setDropdownOpen(false);
  }, []);

  // Add notification to list (for testing/admin use)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Update notification in list
  const updateNotification = useCallback((notificationId, updates) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, ...updates } : n
      )
    );
  }, []);

  // Remove notification from list
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === notificationId);
      if (notif && !notif.is_read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  }, []);

  const value = {
    // State
    notifications,
    unreadCount,
    dropdownOpen,
    socketInitialized,
    
    // Actions
    toggleDropdown,
    closeDropdown,
    addNotification,
    updateNotification,
    removeNotification,
    clearNotifications,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to use notification context
 * @returns {Object} Notification context value
 */
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
