const AppError = require('../utils/appError');
const {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStats
} = require('../services/notification.service');
const logger = require('../utils/logger');

/**
 * Notification Controller
 * Handles all HTTP requests for notifications
 */

/**
 * Create a new notification
 * POST /api/v1/notifications
 */
exports.createNotification = async (req, res, next) => {
  try {
    const { user_id, type, message, items, metadata } = req.body;

    // Create notification via service
    const result = await createNotification({ user_id, type, message, metadata }, items);

    res.status(201).json({
      status: 'success',
      message: 'Notification created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error in createNotification controller:', error);
    next(error);
  }
};

/**
 * Get all notifications for authenticated user
 * GET /api/v1/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, type, is_read, sort } = req.query;

    // Get notifications via service
    const result = await getUserNotifications(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      type,
      is_read: is_read === 'true' ? true : is_read === 'false' ? false : null,
      sort: sort || 'desc'
    });

    res.status(200).json({
      status: 'success',
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getNotifications controller:', error);
    next(error);
  }
};

/**
 * Get notification by ID
 * GET /api/v1/notifications/:id
 */
exports.getNotificationById = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Get notification via service
    const notification = await getNotificationById(notificationId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Notification retrieved successfully',
      data: notification
    });
  } catch (error) {
    logger.error('Error in getNotificationById controller:', error);
    
    if (error.message === 'Notification not found') {
      return next(new AppError('Notification not found', 404));
    }
    
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Mark as read via service
    const notification = await markAsRead(notificationId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    logger.error('Error in markAsRead controller:', error);
    
    if (error.message === 'Notification not found') {
      return next(new AppError('Notification not found', 404));
    }
    
    next(error);
  }
};

/**
 * Mark all notifications as read for authenticated user
 * PATCH /api/v1/notifications/read-all
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Mark all as read via service
    const updatedCount = await markAllAsRead(userId);

    res.status(200).json({
      status: 'success',
      message: `${updatedCount} notifications marked as read`,
      data: { updatedCount }
    });
  } catch (error) {
    logger.error('Error in markAllAsRead controller:', error);
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.id;

    // Delete notification via service
    await deleteNotification(notificationId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteNotification controller:', error);
    
    if (error.message === 'Notification not found') {
      return next(new AppError('Notification not found', 404));
    }
    
    next(error);
  }
};

/**
 * Delete all notifications for authenticated user
 * DELETE /api/v1/notifications
 */
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type, is_read } = req.query;

    // Delete all via service
    const deletedCount = await deleteAllNotifications(userId, {
      type,
      is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined
    });

    res.status(200).json({
      status: 'success',
      message: `${deletedCount} notifications deleted successfully`,
      data: { deletedCount }
    });
  } catch (error) {
    logger.error('Error in deleteAllNotifications controller:', error);
    next(error);
  }
};

/**
 * Get unread count for authenticated user
 * GET /api/v1/notifications/unread-count
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get unread count via service
    const count = await getUnreadCount(userId);

    res.status(200).json({
      status: 'success',
      message: 'Unread count retrieved successfully',
      data: { unreadCount: count }
    });
  } catch (error) {
    logger.error('Error in getUnreadCount controller:', error);
    next(error);
  }
};

/**
 * Get notification statistics for authenticated user
 * GET /api/v1/notifications/stats
 */
exports.getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get stats via service
    const stats = await getNotificationStats(userId);

    res.status(200).json({
      status: 'success',
      message: 'Notification statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    logger.error('Error in getNotificationStats controller:', error);
    next(error);
  }
};
