const { param, query } = require('express-validator');
const suggestionService = require('../services/suggestion.service');
const AppError = require('../utils/appError');

/**
 * Get suggested products for a user
 * @route   GET /api/v1/suggestions
 * @access  Public (with optional user context)
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { limit = 10, exclude = '' } = req.query;
    const userId = req.user?.id;

    // Parse excluded product IDs
    const excludeProductIds = exclude ? exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    const suggestions = await suggestionService.getSuggestions({
      userId,
      limit: parseInt(limit),
      excludeProductIds
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: {
        total: suggestions.length,
        limit: parseInt(limit),
        userId: userId || null,
        algorithms_used: [...new Set(suggestions.map(s => s.suggestion_source))]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggestions by specific algorithm
 * @route   GET /api/v1/suggestions/:algorithm
 * @access  Public (with optional user context)
 */
const getSuggestionsByAlgorithm = async (req, res, next) => {
  try {
    const { algorithm } = req.params;
    const { limit = 10, exclude = '' } = req.query;
    const userId = req.user?.id;

    // Validate algorithm type
    const validAlgorithms = ['followed_vendor', 'recently_viewed', 'popular', 'random'];
    if (!validAlgorithms.includes(algorithm)) {
      return next(new AppError('Invalid suggestion algorithm', 400));
    }

    // Parse excluded product IDs
    const excludeProductIds = exclude ? exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    const suggestions = await suggestionService.getSuggestionsByAlgorithm({
      type: algorithm,
      userId,
      limit: parseInt(limit),
      excludeProductIds
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: {
        total: suggestions.length,
        limit: parseInt(limit),
        algorithm,
        userId: userId || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get followed vendor suggestions
 * @route   GET /api/v1/suggestions/followed-vendors
 * @access  Private (Vendor)
 */
const getFollowedVendorSuggestions = async (req, res, next) => {
  try {
    const { limit = 10, exclude = '' } = req.query;
    const userId = req.user.id;

    // Parse excluded product IDs
    const excludeProductIds = exclude ? exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    const suggestions = await suggestionService.getFollowedVendorSuggestions({
      userId,
      limit: parseInt(limit),
      excludeProductIds
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: {
        total: suggestions.length,
        limit: parseInt(limit),
        algorithm: 'followed_vendor',
        userId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recently viewed suggestions
 * @route   GET /api/v1/suggestions/recently-viewed
 * @access  Private (User)
 */
const getRecentlyViewedSuggestions = async (req, res, next) => {
  try {
    const { limit = 10, exclude = '' } = req.query;
    const userId = req.user.id;

    // Parse excluded product IDs
    const excludeProductIds = exclude ? exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    const suggestions = await suggestionService.getRecentlyViewedSuggestions({
      userId,
      limit: parseInt(limit),
      excludeProductIds
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: {
        total: suggestions.length,
        limit: parseInt(limit),
        algorithm: 'recently_viewed',
        userId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular suggestions
 * @route   GET /api/v1/suggestions/popular
 * @access  Public
 */
const getPopularSuggestions = async (req, res, next) => {
  try {
    const { limit = 10, exclude = '' } = req.query;

    // Parse excluded product IDs
    const excludeProductIds = exclude ? exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    const suggestions = await suggestionService.getPopularSuggestions({
      limit: parseInt(limit),
      excludeProductIds
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: {
        total: suggestions.length,
        limit: parseInt(limit),
        algorithm: 'popular',
        userId: req.user?.id || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get random suggestions
 * @route   GET /api/v1/suggestions/random
 * @access  Public
 */
const getRandomSuggestions = async (req, res, next) => {
  try {
    const { limit = 10, exclude = '' } = req.query;

    // Parse excluded product IDs
    const excludeProductIds = exclude ? exclude.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    const suggestions = await suggestionService.getRandomSuggestions({
      limit: parseInt(limit),
      excludeProductIds
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: {
        total: suggestions.length,
        limit: parseInt(limit),
        algorithm: 'random',
        userId: req.user?.id || null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear old suggestions for a user
 * @route   DELETE /api/v1/suggestions
 * @access  Private (User)
 */
const clearOldSuggestions = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.user.id;

    const result = await suggestionService.clearOldSuggestions({
      userId,
      daysToKeep: parseInt(days)
    });

    res.status(200).json({
      success: true,
      message: 'Old suggestions cleared successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggestion statistics for a user
 * @route   GET /api/v1/suggestions/stats
 * @access  Private (User)
 */
const getSuggestionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const stats = await suggestionService.getSuggestionStats({ userId });

    res.status(200).json({
      success: true,
      data: stats,
      meta: {
        userId,
        total_suggestions: Object.values(stats).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get suggestions validation rules
 */
const getSuggestionsValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('exclude')
    .optional()
    .isString()
    .withMessage('Exclude must be a comma-separated list of product IDs')
];

/**
 * Get suggestions by algorithm validation rules
 */
const getSuggestionsByAlgorithmValidation = [
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
    .withMessage('Exclude must be a comma-separated list of product IDs')
];

module.exports = {
  getSuggestions,
  getSuggestionsByAlgorithm,
  getFollowedVendorSuggestions,
  getRecentlyViewedSuggestions,
  getPopularSuggestions,
  getRandomSuggestions,
  clearOldSuggestions,
  getSuggestionStats,
  getSuggestionsValidation,
  getSuggestionsByAlgorithmValidation
};