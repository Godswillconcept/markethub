import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStats
} from '../services/apiNotification';

/**
 * Custom hook for notification management
 * Provides notification data and operations
 * @param {Object} options - Configuration options
 * @returns {Object} Notification state and operations
 */
const useNotifications = (options = {}) => {
  const {
    page = 1,
    limit = 20,
    type = null,
    is_read = null,
    sort = 'desc',
    autoFetch = true
  } = options;

  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getNotifications({
        page,
        limit,
        type,
        is_read,
        sort
      });
      
      setNotifications(response.data || []);
      setPagination(response.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
      setNotifications([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, is_read, sort]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await getNotificationStats();
      setStats(response.data || null);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, []);

  // Fetch single notification
  const fetchNotificationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getNotificationById(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch notification');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      const response = await markAsRead(id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark notification as read');
      throw err;
    }
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const response = await markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all notifications as read');
      throw err;
    }
  }, []);

  // Delete notification
  const handleDeleteNotification = useCallback(async (id) => {
    try {
      await deleteNotification(id);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Update unread count if it was unread
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notification');
      throw err;
    }
  }, [notifications]);

  // Delete all notifications
  const handleDeleteAll = useCallback(async (filters = {}) => {
    try {
      const response = await deleteAllNotifications(filters);
      
      // Fetch notifications again to get updated list
      await fetchNotifications();
      await fetchUnreadCount();
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notifications');
      throw err;
    }
  }, [fetchNotifications, fetchUnreadCount]);

  // Refetch notifications
  const refetch = useCallback(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [autoFetch, fetchNotifications, fetchUnreadCount]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    // Data
    notifications,
    unreadCount,
    stats,
    pagination,
    loading,
    error,
    
    // Operations
    fetchNotifications,
    fetchNotificationById,
    fetchUnreadCount,
    fetchStats,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    deleteAllNotifications: handleDeleteAll,
    refetch
  };
};

export default useNotifications;
