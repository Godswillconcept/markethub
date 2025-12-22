const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const suggestionController = require('../controllers/suggestion.controller');
const { protect, isVendor } = require('../middlewares/auth');
const validate = require('../middlewares/validation');

// Public routes - can be accessed without authentication
// These will provide general suggestions or use user context if available

/**
 * @route   GET /api/v1/suggestions
 * @desc    Get suggested products for a user (combines all algorithms)
 * @access  Public
 * @query   limit - Number of suggestions (1-50, default: 10)
 * @query   exclude - Comma-separated list of product IDs to exclude
 */
router.get('/', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs'),
  validate
], suggestionController.getSuggestions);

/**
 * @route   GET /api/v1/suggestions/popular
 * @desc    Get popular products (based on sales and views)
 * @access  Public
 * @query   limit - Number of suggestions (1-50, default: 10)
 * @query   exclude - Comma-separated list of product IDs to exclude
 */
router.get('/popular', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs'),
  validate
], suggestionController.getPopularSuggestions);

/**
 * @route   GET /api/v1/suggestions/random
 * @desc    Get random products
 * @access  Public
 * @query   limit - Number of suggestions (1-50, default: 10)
 * @query   exclude - Comma-separated list of product IDs to exclude
 */
router.get('/random', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs'),
  validate
], suggestionController.getRandomSuggestions);

// Protected routes - require authentication

// Apply authentication middleware to all routes below
router.use(protect);

/**
 * @route   GET /api/v1/suggestions/followed-vendors
 * @desc    Get products from followed vendors
 * @access  Private (User)
 * @query   limit - Number of suggestions (1-50, default: 10)
 * @query   exclude - Comma-separated list of product IDs to exclude
 */
router.get('/followed-vendors', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs'),
  validate
], suggestionController.getFollowedVendorSuggestions);

/**
 * @route   GET /api/v1/suggestions/recently-viewed
 * @desc    Get products based on user's viewing history
 * @access  Private (User)
 * @query   limit - Number of suggestions (1-50, default: 10)
 * @query   exclude - Comma-separated list of product IDs to exclude
 */
router.get('/recently-viewed', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs'),
  validate
], suggestionController.getRecentlyViewedSuggestions);

/**
 * @route   GET /api/v1/suggestions/:algorithm
 * @desc    Get suggestions by specific algorithm
 * @access  Public
 * @param   algorithm - Algorithm type (followed_vendor, recently_viewed, popular, random)
 * @query   limit - Number of suggestions (1-50, default: 10)
 * @query   exclude - Comma-separated list of product IDs to exclude
 */
router.get('/:algorithm', [
  param('algorithm')
    .isIn(['followed_vendor', 'recently_viewed', 'popular', 'random'])
    .withMessage('Invalid algorithm type'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs'),
  validate
], suggestionController.getSuggestionsByAlgorithm);

/**
 * @route   DELETE /api/v1/suggestions
 * @desc    Clear old suggestions for the authenticated user
 * @access  Private (User)
 * @query   days - Number of days to keep (default: 7)
 */
router.delete('/', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('Days must be between 1 and 90'),
  validate
], suggestionController.clearOldSuggestions);

/**
 * @route   GET /api/v1/suggestions/stats
 * @desc    Get suggestion statistics for the authenticated user
 * @access  Private (User)
 */
router.get('/stats', suggestionController.getSuggestionStats);

module.exports = router;