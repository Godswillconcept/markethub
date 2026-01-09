const express = require('express');
const router = express.Router();
const {
  createNotificationValidator,
  getNotificationsValidator,
  notificationIdValidator,
  deleteAllValidator
} = require('../validators/notification.validator');
const {
  createNotification,
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStats
} = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth');

/**
 * Notification Routes
 * All routes require authentication
 */

// Create notification (admin/system use only - users shouldn't create their own)
router.post(
  '/',
  protect,
  createNotificationValidator,
  createNotification
);

// Get all notifications for authenticated user
router.get(
  '/',
  protect,
  getNotificationsValidator,
  getNotifications
);

// Get notification by ID
router.get(
  '/:id',
  protect,
  notificationIdValidator,
  getNotificationById
);

// Mark notification as read
router.patch(
  '/:id/read',
  protect,
  notificationIdValidator,
  markAsRead
);

// Mark all notifications as read
router.patch(
  '/read-all',
  protect,
  markAllAsRead
);

// Get unread count
router.get(
  '/unread-count',
  protect,
  getUnreadCount
);

// Get notification statistics
router.get(
  '/stats',
  protect,
  getNotificationStats
);

// Delete notification
router.delete(
  '/:id',
  protect,
  notificationIdValidator,
  deleteNotification
);

// Delete all notifications with optional filters
router.delete(
  '/',
  protect,
  deleteAllValidator,
  deleteAllNotifications
);

module.exports = router;
