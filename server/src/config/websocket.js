const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance
 * @returns {Object} Socket.io instance
 */
const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Extract token from Bearer header if present
      const authToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

      // Verify JWT token
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET, {
        issuer: process.env.APP_NAME || 'Stylay',
        audience: 'user'
      });

      // Attach user data to socket
      socket.user = decoded;
      socket.userId = decoded.id;

      next();
    } catch (error) {
      logger.error('WebSocket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`WebSocket client connected: ${userId}`, { socketId: socket.id });

    // Join user-specific room
    const userRoom = `user_${userId}`;
    socket.join(userRoom);
    logger.info(`User ${userId} joined room: ${userRoom}`);

    // Handle join user room event
    socket.on('join_user_room', (data) => {
      if (data.userId === userId) {
        const room = `user_${data.userId}`;
        socket.join(room);
        logger.info(`User ${userId} joined room: ${room}`);
      }
    });

    // Handle leave user room event
    socket.on('leave_user_room', (data) => {
      if (data.userId === userId) {
        const room = `user_${data.userId}`;
        socket.leave(room);
        logger.info(`User ${userId} left room: ${room}`);
      }
    });

    // Handle mark as read via WebSocket
    socket.on('mark_as_read', async (data) => {
      try {
        const { notificationId } = data;
        
        // Broadcast to user's room
        io.to(userRoom).emit('notification_updated', {
          notificationId,
          isRead: true
        });

        logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
      } catch (error) {
        logger.error('Error marking notification as read via WebSocket:', error);
      }
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket client disconnected: ${userId}`, { 
        socketId: socket.id, 
        reason 
      });
      socket.leave(userRoom);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};

/**
 * Get Socket.io instance
 * @returns {Object} Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeWebSocket first.');
  }
  return io;
};

/**
 * Broadcast notification to specific user
 * @param {Number} userId - User ID to send notification to
 * @param {Object} notification - Notification object
 * @param {Array} items - Notification items (optional)
 */
const broadcastNotification = (userId, notification, items = []) => {
  try {
    const io = getIO();
    const userRoom = `user_${userId}`;
    
    io.to(userRoom).emit('new_notification', {
      notification,
      items
    });

    logger.info(`Notification broadcasted to user ${userId}`, { 
      notificationId: notification.id,
      type: notification.type 
    });
  } catch (error) {
    logger.error('Error broadcasting notification:', error);
  }
};

/**
 * Broadcast notification update to specific user
 * @param {Number} userId - User ID to send update to
 * @param {Object} notification - Updated notification object
 */
const broadcastNotificationUpdate = (userId, notification) => {
  try {
    const io = getIO();
    const userRoom = `user_${userId}`;
    
    io.to(userRoom).emit('notification_updated', {
      notification
    });

    logger.info(`Notification update broadcasted to user ${userId}`, { 
      notificationId: notification.id 
    });
  } catch (error) {
    logger.error('Error broadcasting notification update:', error);
  }
};

/**
 * Broadcast notification deletion to specific user
 * @param {Number} userId - User ID to send deletion to
 * @param {Number} notificationId - Deleted notification ID
 */
const broadcastNotificationDeletion = (userId, notificationId) => {
  try {
    const io = getIO();
    const userRoom = `user_${userId}`;
    
    io.to(userRoom).emit('notification_deleted', {
      notificationId
    });

    logger.info(`Notification deletion broadcasted to user ${userId}`, { 
      notificationId 
    });
  } catch (error) {
    logger.error('Error broadcasting notification deletion:', error);
  }
};

/**
 * Broadcast unread count update to specific user
 * @param {Number} userId - User ID to send update to
 * @param {Number} count - New unread count
 */
const broadcastUnreadCount = (userId, count) => {
  try {
    const io = getIO();
    const userRoom = `user_${userId}`;
    
    io.to(userRoom).emit('unread_count_updated', {
      count
    });

    logger.info(`Unread count broadcasted to user ${userId}`, { count });
  } catch (error) {
    logger.error('Error broadcasting unread count:', error);
  }
};

module.exports = {
  initializeWebSocket,
  getIO,
  broadcastNotification,
  broadcastNotificationUpdate,
  broadcastNotificationDeletion,
  broadcastUnreadCount
};
