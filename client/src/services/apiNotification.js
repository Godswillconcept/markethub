import axios from './axios';

const API_BASE_URL = '/api/v1/notifications';

/**
 * Notification API Service
 * Handles all HTTP requests for notifications
 */

/**
 * Get all notifications for authenticated user
 * @param {Object} params - Query parameters (page, limit, type, is_read, sort)
 * @returns {Promise<Object>} Notifications with pagination
 */
export const getNotifications = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get notification by ID
 * @param {Number} id - Notification ID
 * @returns {Promise<Object>} Notification details
 */
export const getNotificationById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    throw error;
  }
};

/**
 * Create a new notification (admin/system use)
 * @param {Object} data - Notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (data) => {
  try {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {Number} id - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markAsRead = async (id) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Result with updated count
 */
export const markAllAsRead = async () => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {Number} id - Notification ID
 * @returns {Promise<Object>} Success message
 */
export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications with optional filters
 * @param {Object} params - Query parameters (type, is_read)
 * @returns {Promise<Object>} Result with deleted count
 */
export const deleteAllNotifications = async (params = {}) => {
  try {
    const response = await axios.delete(API_BASE_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Get unread count
 * @returns {Promise<Object>} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/unread-count`);
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Get notification statistics
 * @returns {Promise<Object>} Notification statistics
 */
export const getNotificationStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStats
};
