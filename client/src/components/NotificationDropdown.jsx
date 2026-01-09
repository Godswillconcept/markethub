import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

/**
 * Notification Dropdown Component
 * Displays notification bell icon with dropdown panel
 */

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    dropdownOpen,
    toggleDropdown,
    closeDropdown,
    markAllAsRead
  } = useNotificationContext();

  const dropdownRef = useRef(null);
  const [showAll, setShowAll] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeDropdown]);

  // Display notifications (limit to 5 in dropdown, or all if expanded)
  const displayNotifications = showAll ? notifications : notifications.slice(0, 5);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      welcome: '👋',
      order_process: '📦',
      maintenance: '🔧',
      policy_update: '📜',
      delay_apology: '⏰',
      success: '✅',
      apology: '😔',
      order_created: '🛒',
      order_received: '📥',
      order_cancelled: '❌',
      order_shipped: '🚚',
      order_delivered: '📬'
    };
    return icons[type] || '🔔';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const diff = formatDistanceToNow(date, { addSuffix: true });
    
    if (diff.includes('ago')) {
      return diff;
    }
    return 'Just now';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell with Badge */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-6 h-6 text-gray-600" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {/* Mark All as Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAllAsRead();
                    closeDropdown();
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
              
              {/* View All Button */}
              {!showAll && notifications.length > 5 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  View all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="text-gray-400 mb-2">
                  <Bell className="w-12 h-12" />
                </div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      // Navigate to notification details or mark as read
                      // For now, just close dropdown
                      closeDropdown();
                    }}
                  >
                    <div className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {/* Notification Icon */}
                        <span className="text-2xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {notification.message}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          
                          {/* Timestamp */}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {showAll && notifications.length > 5 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => setShowAll(false)}
                className="w-full text-sm text-gray-600 hover:text-gray-700 font-medium py-2"
              >
                Show recent (5)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
