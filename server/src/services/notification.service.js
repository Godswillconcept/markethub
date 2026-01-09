const { Notification, NotificationItem, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { 
  broadcastNotification, 
  broadcastNotificationUpdate, 
  broadcastNotificationDeletion,
  broadcastUnreadCount 
} = require('../config/websocket');
const logger = require('../utils/logger');

/**
 * Notification Service
 * Handles all notification business logic and WebSocket broadcasting
 */

/**
 * Create a new notification with optional items
 * @param {Object} notificationData - Notification data
 * @param {Array} items - Optional notification items
 * @returns {Promise<Object>} Created notification with items
 */
const createNotification = async (notificationData, items = []) => {
  try {
    const { user_id, type, message, metadata } = notificationData;

    // Validate user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Create notification
    const notification = await Notification.create({
      user_id,
      type,
      message,
      is_read: false,
      metadata
    });

    // Create notification items if provided
    let createdItems = [];
    if (items && items.length > 0) {
      createdItems = await Promise.all(
        items.map(item =>
          NotificationItem.create({
            notification_id: notification.id,
            item_details: typeof item === 'string' ? item : JSON.stringify(item)
          })
        )
      );
    }

    // Broadcast real-time notification
    broadcastNotification(user_id, notification.get({ plain: true }), createdItems);

    logger.info(`Notification created for user ${user_id}`, {
      notificationId: notification.id,
      type
    });

    return {
      notification: notification.get({ plain: true }),
      items: createdItems.map(item => ({
        ...item.get({ plain: true }),
        item_details: item.item_details ? JSON.parse(item.item_details) : null
      }))
    };
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user with pagination and filters
 * @param {Number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Notifications with pagination info
 */
const getUserNotifications = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      type = null,
      is_read = null,
      sort = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      user_id: userId
    };

    // Add type filter if provided
    if (type) {
      where.type = type;
    }

    // Add read status filter if provided
    if (is_read !== null) {
      where.is_read = is_read;
    }

    // Get notifications with pagination
    const { count, rows: notifications } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: NotificationItem,
          as: 'items',
          required: false
        }
      ],
      order: [['created_at', sort.toUpperCase()]],
      limit,
      offset
    });

    // Parse item_details from JSON strings
    const parsedNotifications = notifications.map(n => {
      const notification = n.get({ plain: true });
      if (notification.items && notification.items.length > 0) {
        notification.items = notification.items.map(item => ({
          ...item,
          item_details: item.item_details ? JSON.parse(item.item_details) : null
        }));
      }
      return notification;
    });

    return {
      notifications: parsedNotifications,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error fetching user notifications:', error);
    throw error;
  }
};

/**
 * Get notification by ID
 * @param {Number} notificationId - Notification ID
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Object>} Notification with items
 */
const getNotificationById = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId
      },
      include: [
        {
          model: NotificationItem,
          as: 'items',
          required: false
        }
      ]
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    const parsedNotification = notification.get({ plain: true });
    
    // Parse item_details from JSON strings
    if (parsedNotification.items && parsedNotification.items.length > 0) {
      parsedNotification.items = parsedNotification.items.map(item => ({
        ...item,
        item_details: item.item_details ? JSON.parse(item.item_details) : null
      }));
    }

    return parsedNotification;
  } catch (error) {
    logger.error('Error fetching notification by ID:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {Number} notificationId - Notification ID
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Object>} Updated notification
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.is_read) {
      return notification.get({ plain: true }); // Already read
    }

    await notification.update({ is_read: true });

    const updatedNotification = notification.get({ plain: true });

    // Broadcast update via WebSocket
    broadcastNotificationUpdate(userId, updatedNotification);

    logger.info(`Notification ${notificationId} marked as read`, { userId });

    return updatedNotification;
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {Number} userId - User ID
 * @returns {Promise<Number>} Number of notifications updated
 */
const markAllAsRead = async (userId) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );

    logger.info(`Marked ${updatedCount} notifications as read for user ${userId}`);

    // Get updated unread count
    const unreadCount = await getUnreadCount(userId);

    // Broadcast unread count update
    broadcastUnreadCount(userId, unreadCount);

    return updatedCount;
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {Number} notificationId - Notification ID
 * @param {Number} userId - User ID (for authorization)
 * @returns {Promise<Boolean>} Success status
 */
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Delete associated notification items
    await NotificationItem.destroy({
      where: {
        notification_id: notificationId
      }
    });

    // Delete notification
    await notification.destroy();

    // Broadcast deletion via WebSocket
    broadcastNotificationDeletion(userId, notificationId);

    logger.info(`Notification ${notificationId} deleted`, { userId });

    return true;
  } catch (error) {
    logger.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Get unread count for a user
 * @param {Number} userId - User ID
 * @returns {Promise<Number>} Unread notification count
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return count;
  } catch (error) {
    logger.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Delete all notifications for a user
 * @param {Number} userId - User ID
 * @param {Object} filters - Optional filters (type, is_read)
 * @returns {Promise<Number>} Number of notifications deleted
 */
const deleteAllNotifications = async (userId, filters = {}) => {
  try {
    const where = {
      user_id: userId
    };

    // Add type filter if provided
    if (filters.type) {
      where.type = filters.type;
    }

    // Add read status filter if provided
    if (filters.is_read !== undefined) {
      where.is_read = filters.is_read;
    }

    // Get notification IDs to delete
    const notifications = await Notification.findAll({
      where,
      attributes: ['id']
    });

    const notificationIds = notifications.map(n => n.id);

    // Delete notification items
    if (notificationIds.length > 0) {
      await NotificationItem.destroy({
        where: {
          notification_id: {
            [Op.in]: notificationIds
          }
        }
      });
    }

    // Delete notifications
    const deletedCount = await Notification.destroy({ where });

    logger.info(`Deleted ${deletedCount} notifications for user ${userId}`, filters);

    return deletedCount;
  } catch (error) {
    logger.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Get notification statistics for a user
 * @param {Number} userId - User ID
 * @returns {Promise<Object>} Notification statistics
 */
const getNotificationStats = async (userId) => {
  try {
    const total = await Notification.count({
      where: { user_id: userId }
    });

    const unread = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    const read = total - unread;

    // Get count by type
    const byType = await Notification.findAll({
      where: { user_id: userId },
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      raw: true
    });

    const typeStats = {};
    byType.forEach(item => {
      typeStats[item.type] = parseInt(item.count);
    });

    return {
      total,
      unread,
      read,
      byType: typeStats
    };
  } catch (error) {
    logger.error('Error fetching notification stats:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStats
};
