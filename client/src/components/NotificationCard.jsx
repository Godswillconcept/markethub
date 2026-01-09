import { useState } from 'react';
import { Clock, Trash2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Notification Card Component
 * Displays single notification with actions
 */

const NotificationCard = ({ notification, onMarkAsRead, onDelete, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);

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

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    const labels = {
      welcome: 'Welcome',
      order_process: 'Order Update',
      maintenance: 'Maintenance',
      policy_update: 'Policy Update',
      delay_apology: 'Apology',
      success: 'Success',
      apology: 'Apology',
      order_created: 'New Order',
      order_received: 'Order Received',
      order_cancelled: 'Order Cancelled',
      order_shipped: 'Order Shipped',
      order_delivered: 'Order Delivered'
    };
    return labels[type] || 'Notification';
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

  // Handle mark as read
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (onMarkAsRead && !notification.is_read) {
      await onMarkAsRead(notification.id);
    }
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(notification.id);
    }
  };

  // Handle view details
  const handleViewDetails = () => {
    setExpanded(!expanded);
    if (onViewDetails) {
      onViewDetails(notification);
    }
  };

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all duration-200
        ${notification.is_read 
          ? 'bg-white border-gray-200' 
          : 'bg-blue-50 border-blue-200'
        }
        hover:shadow-md
      `}
      onClick={handleViewDetails}
    >
      <div className="flex items-start gap-4">
        {/* Notification Icon */}
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl
            ${notification.is_read ? 'bg-gray-100' : 'bg-blue-100'}
          `}
        >
          <span>{getNotificationIcon(notification.type)}</span>
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {getNotificationTypeLabel(notification.type)}
              </span>
              {!notification.is_read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
              )}
            </div>
            
            {/* Timestamp */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(notification.created_at)}</span>
            </div>
          </div>

          {/* Message */}
          <p
            className={`
              text-sm font-medium leading-relaxed
              ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}
            `}
          >
            {notification.message}
          </p>

          {/* Notification Metadata (if any) */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Order Details:
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {notification.metadata.orderId && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Order ID:</span> {notification.metadata.orderId}
                    </span>
                  </div>
                )}
                {notification.metadata.status && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Status:</span> {notification.metadata.status}
                    </span>
                  </div>
                )}
                {notification.metadata.amount && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Amount:</span> {notification.metadata.amount}
                    </span>
                  </div>
                )}
                {notification.metadata.total && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Total:</span> {notification.metadata.total}
                    </span>
                  </div>
                )}
                {notification.metadata.trackingNumber && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Tracking:</span> {notification.metadata.trackingNumber}
                    </span>
                  </div>
                )}
                {notification.metadata.estimatedDelivery && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span className="text-gray-700">
                      <span className="font-medium">Est. Delivery:</span> {notification.metadata.estimatedDelivery}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notification Items (if any) */}
          {notification.items && notification.items.length > 0 && expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Items:
              </p>
              <ul className="space-y-2">
                {notification.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {item.item_details && typeof item.item_details === 'object' ? (
                      <div className="bg-gray-50 rounded p-2">
                        {item.item_details.productName && (
                          <div className="font-medium text-gray-900 mb-1">
                            {item.item_details.productName}
                          </div>
                        )}
                        {item.item_details.quantity && (
                          <div className="text-xs text-gray-600">
                            Quantity: {item.item_details.quantity}
                          </div>
                        )}
                        {item.item_details.price && (
                          <div className="text-xs text-gray-600">
                            Price: {item.item_details.price}
                          </div>
                        )}
                        {item.item_details.size && (
                          <div className="text-xs text-gray-600">
                            Size: {item.item_details.size}
                          </div>
                        )}
                        {item.item_details.color && (
                          <div className="text-xs text-gray-600">
                            Color: {item.item_details.color}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600">{typeof item.item_details === 'string' ? item.item_details : 'No details available'}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
            {/* Mark as Read Button */}
            {!notification.is_read && onMarkAsRead && (
              <button
                onClick={handleMarkAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
                <span>Mark as read</span>
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors ml-auto"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
