import { useState, useEffect } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import NotificationCard from '../../components/NotificationCard';
import Pagination from '../../components/Pagination';

/**
 * Notifications List Page
 * Displays all notifications with filtering and pagination
 */

const NotificationsListPage = () => {
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    removeNotification,
    updateNotification
  } = useNotificationContext();

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    if (filter === 'read') return notification.is_read;
    return true;
  });

  // Get paginated notifications
  const totalPages = Math.ceil(filteredNotifications.length / limit);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * limit,
    page * limit
  );

  // Handle mark as read
  const handleMarkAsRead = async (id) => {
    try {
      await updateNotification(id, { is_read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await removeNotification(id);
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (confirm('Mark all notifications as read?')) {
      try {
        await markAllAsRead();
      } catch (error) {
        console.error('Error marking all as read:', error);
      }
    }
  };

  // Get unread count for filter
  const getFilteredUnreadCount = () => {
    if (filter === 'unread') return unreadCount;
    if (filter === 'read') return notifications.filter(n => n.is_read).length;
    return notifications.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              All ({notifications.length})
            </button>
            
            <button
              onClick={() => setFilter('unread')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${filter === 'unread'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              Unread ({unreadCount})
            </button>
            
            <button
              onClick={() => setFilter('read')}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${filter === 'read'
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }
              `}
            >
              Read ({notifications.filter(n => n.is_read).length})
            </button>
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {paginatedNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2 2v7h2a2 2 0 00-2 2v7zm0-10h11"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? 'You have no unread notifications'
                : filter === 'read'
                ? 'You have no read notifications'
                : 'You have no notifications'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onViewDetails={(notif) => console.log('View details:', notif)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && paginatedNotifications.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}

        {/* Stats Summary */}
        {notifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Notification Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Unread</p>
                <p className="text-2xl font-bold text-green-600">
                  {unreadCount}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Read</p>
                <p className="text-2xl font-bold text-gray-600">
                  {notifications.filter(n => n.is_read).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsListPage;
