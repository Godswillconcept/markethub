const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Notification Validators
 * Input validation for notification endpoints
 */

/**
 * Validate notification creation
 */
const createNotificationValidator = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  body('type')
    .notEmpty()
    .withMessage('Notification type is required')
    .isIn([
      'welcome',
      'order_process',
      'maintenance',
      'policy_update',
      'delay_apology',
      'success',
      'apology',
      'order_created',
      'order_received',
      'order_cancelled',
      'order_shipped',
      'order_delivered'
    ])
    .withMessage('Invalid notification type'),
  
  body('message')
    .notEmpty()
    .withMessage('Notification message is required')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array')
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(item => 
          typeof item === 'string' || typeof item === 'object'
        );
      }
      return true;
    })
    .withMessage('Each item must be a string or object'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validate get notifications query parameters
 */
const getNotificationsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('type')
    .optional()
    .isIn([
      'welcome',
      'order_process',
      'maintenance',
      'policy_update',
      'delay_apology',
      'success',
      'apology',
      'order_created',
      'order_received',
      'order_cancelled',
      'order_shipped',
      'order_delivered'
    ])
    .withMessage('Invalid notification type'),
  
  query('is_read')
    .optional()
    .isBoolean()
    .withMessage('is_read must be a boolean')
    .toBoolean(),
  
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort must be asc or desc')
    .toLowerCase(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validate notification ID parameter
 */
const notificationIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Notification ID is required')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer')
    .toInt(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Validate delete all notifications query parameters
 */
const deleteAllValidator = [
  query('type')
    .optional()
    .isIn([
      'welcome',
      'order_process',
      'maintenance',
      'policy_update',
      'delay_apology',
      'success',
      'apology',
      'order_created',
      'order_received',
      'order_cancelled',
      'order_shipped',
      'order_delivered'
    ])
    .withMessage('Invalid notification type'),
  
  query('is_read')
    .optional()
    .isBoolean()
    .withMessage('is_read must be a boolean')
    .toBoolean(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  createNotificationValidator,
  getNotificationsValidator,
  notificationIdValidator,
  deleteAllValidator
};
