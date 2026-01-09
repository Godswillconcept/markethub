import { io } from 'socket.io-client';
const getToken = () => localStorage.getItem("token");

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

/**
 * WebSocket Service
 * Manages Socket.io client connection and events
 */

/**
 * Initialize WebSocket connection
 * @returns {Object} Socket.io instance
 */
export const initializeWebSocket = () => {
  if (socket) {
    console.log('WebSocket already initialized');
    return socket;
  }

  try {
    const token = getToken();
    
    if (!token) {
      console.warn('No authentication token available. WebSocket not initialized.');
      return null;
    }

    // Initialize Socket.io client
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: 20000
    });

    // Connection event handlers
    setupSocketListeners();

    console.log('WebSocket client initialized');
    return socket;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    return null;
  }
};

/**
 * Setup socket event listeners
 */
const setupSocketListeners = () => {
  if (!socket) return;

  // Connection established
  socket.on('connect', () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    
    // Join user room
    const userId = getUserId();
    if (userId) {
      socket.emit('join_user_room', { userId });
    }
  });

  // Connection error
  socket.on('connect_error', (error) => {
    console.error('WebSocket connection error:', error);
  });

  // Disconnection
  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
    
    // Attempt reconnection
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`Attempting reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    }
  });

  // Reconnection attempt
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
  });

  // Reconnection failed
  socket.on('reconnect_failed', () => {
    console.error('WebSocket reconnection failed after all attempts');
  });

  // New notification received
  socket.on('new_notification', (data) => {
    console.log('New notification received:', data);
    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
  });

  // Notification updated
  socket.on('notification_updated', (data) => {
    console.log('Notification updated:', data);
    window.dispatchEvent(new CustomEvent('notification_updated', { detail: data }));
  });

  // Notification deleted
  socket.on('notification_deleted', (data) => {
    console.log('Notification deleted:', data);
    window.dispatchEvent(new CustomEvent('notification_deleted', { detail: data }));
  });

  // Unread count updated
  socket.on('unread_count_updated', (data) => {
    console.log('Unread count updated:', data);
    window.dispatchEvent(new CustomEvent('unread_count_updated', { detail: data }));
  });

  // Error handler
  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};

/**
 * Get socket instance
 * @returns {Object|null} Socket.io instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Check if socket is connected
 * @returns {Boolean} Connection status
 */
export const isConnected = () => {
  return socket && socket.connected;
};

/**
 * Disconnect socket
 */
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('WebSocket disconnected');
  }
};

/**
 * Join user room
 * @param {Number} userId - User ID
 */
export const joinUserRoom = (userId) => {
  if (socket && isConnected()) {
    socket.emit('join_user_room', { userId });
    console.log(`Joined user room: ${userId}`);
  }
};

/**
 * Leave user room
 * @param {Number} userId - User ID
 */
export const leaveUserRoom = (userId) => {
  if (socket && isConnected()) {
    socket.emit('leave_user_room', { userId });
    console.log(`Left user room: ${userId}`);
  }
};

/**
 * Mark notification as read via WebSocket
 * @param {Number} notificationId - Notification ID
 */
export const markAsReadSocket = (notificationId) => {
  if (socket && isConnected()) {
    socket.emit('mark_as_read', { notificationId });
  }
};

/**
 * Get user ID from token
 * @returns {Number|null} User ID or null
 */
const getUserId = () => {
  try {
    const token = getToken();
    if (!token) return null;

    // Decode JWT token (simple decode without verification for client-side)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const jsonPayload = decodeURIComponent(window.atob(base64));
    const payload = JSON.parse(jsonPayload);
    
    return payload.id || null;
  } catch (error) {
    console.error('Error decoding user ID from token:', error);
    return null;
  }
};

/**
 * Reconnect socket
 */
export const reconnectWebSocket = () => {
  if (socket) {
    socket.connect();
    console.log('WebSocket reconnection initiated');
  }
};

export default {
  initializeWebSocket,
  getSocket,
  isConnected,
  disconnectWebSocket,
  joinUserRoom,
  leaveUserRoom,
  markAsReadSocket,
  reconnectWebSocket
};
