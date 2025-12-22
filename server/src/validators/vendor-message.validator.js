const { body, validationResult, query, param } = require('express-validator');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const AppError = require('../utils/appError');

const createVendorMessageValidator = [
  body('full_name')
    .isLength({ min: 2, max: 200 })
    .withMessage('Full name must be between 2-200 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces')
    .trim()
    .escape(),
  body('phone')
    .custom((value) => {
      if (!value) return true;
      const phoneNumber = parsePhoneNumberFromString(value);
      if (!phoneNumber || !phoneNumber.isValid()) {
        throw new Error('Invalid international phone number');
      }
      return true;
    }),
  body('topic')
    .isIn(['Loan', 'Product Support', 'Technical Issue', 'General Inquiry', 'Other'])
    .withMessage('Invalid topic selection'),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10-2000 characters')
    .trim()
    .escape()
];

const getVendorMessageValidator = [
  param('id').isInt().withMessage('Invalid message ID')
];

const updateVendorMessageValidator = [
  param('id').isInt().withMessage('Invalid message ID'),
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array(), 400));
  }
  next();
};

module.exports = {
  createVendorMessageValidator,
  getVendorMessageValidator,
  updateVendorMessageValidator,
  validate
};