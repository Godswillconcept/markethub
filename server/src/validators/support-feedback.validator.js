const { body, validationResult, query, param } = require('express-validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const AppError = require('../utils/appError');

const createFeedbackValidator = [
  body('subject')
    .isLength({ min: 10, max: 150 })
    .withMessage('Subject must be between 10-150 characters')
    .trim()
    .escape(),
  body('order_number')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Order number can only contain alphanumeric characters and hyphens')
    .trim()
    .escape(),
  body('issue_type')
    .isIn([
      'Order Not Delivered',
      'Wrong Item Received',
      'Payment Issue',
      'Return/Refund Request',
      'Account Issue',
      'Technical Issue',
      'Other'
    ])
    .withMessage('Invalid issue type')
    .trim()
    .escape(),
  body('description')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20-2000 characters')
    .trim()
    .escape(),
  body('preferred_support_method')
    .isIn(['Email', 'Phone', 'Chat'])
    .withMessage('Invalid preferred support method')
    .trim()
    .escape(),
  body('contact_email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .trim()
    .escape(),
  body('contact_phone')
    .optional()
    .custom((value) => {
      if (!value) return true;
      const phoneNumber = parsePhoneNumberFromString(value);
      if (!phoneNumber || !phoneNumber.isValid()) {
        throw new Error('Invalid international phone number');
      }
      return true;
    })
    .trim()
    .escape(),
  body().custom((value, { req }) => {
    if (!req.body.contact_email && !req.body.contact_phone) {
      throw new Error('At least one contact method (email or phone) is required');
    }
    return true;
  })
];

const getFeedbackValidator = [
  param('id').isInt().withMessage('Invalid feedback ID')
];

const updateFeedbackValidator = [
  param('id').isInt().withMessage('Invalid feedback ID'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status')
];

const getAllFeedbacksValidator = [
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
  query('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status value'),
  query('issue_type')
    .optional()
    .isIn([
      'Order Not Delivered',
      'Wrong Item Received',
      'Payment Issue',
      'Return/Refund Request',
      'Account Issue',
      'Technical Issue',
      'Other'
    ])
    .withMessage('Invalid issue type'),
  query('sort_by')
    .optional()
    .isIn(['created_at', 'status', 'issue_type'])
    .withMessage('Invalid sort field'),
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_from'),
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for date_to')
    .custom((value, { req }) => {
      if (req.query.date_from && value < req.query.date_from) {
        throw new Error('date_to must be after date_from');
      }
      return true;
    })
];

const addReplyValidator = [
  param('id').isInt().withMessage('Invalid feedback ID'),
  body('reply_content')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Reply content must be between 10 and 2000 characters')
    .trim()
    .escape(),
  body('update_status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status value')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array(), 400));
  }
  next();
};

module.exports = {
  createFeedbackValidator,
  getFeedbackValidator,
  updateFeedbackValidator,
  getAllFeedbacksValidator,
  addReplyValidator,
  validate
};