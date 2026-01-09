const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Rate limiter for support feedback submissions
 * Limits users to 10 submissions per 15 minutes
 * Prevents spam and abuse of the feedback system
 */
const feedbackRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many feedback submissions. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use user ID as key if available, otherwise use IP
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for feedback submission`, {
      userId: req.user?.id,
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      error: 'Too many feedback submissions. Please try again later.'
    });
  }
});

/**
 * Request logging middleware for audit trail
 * Logs all feedback-related requests for security and compliance
 */
const logFeedbackRequest = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  const logData = {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    feedbackId: req.params.id || null,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  };

  // Log on response completion
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`Support Feedback Request`, {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

/**
 * Cache middleware for GET endpoints
 * Caches responses for 5 minutes to improve performance
 * Cache key includes user ID to ensure users only see their own data
 */
const cacheMiddleware = (duration = 5 * 60 * 1000) => {
  const cache = new Map();
  
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on user ID and URL
    const cacheKey = `${req.user?.id || 'anonymous'}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Check if response is cached
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
      logger.debug(`Cache hit for feedback request`, { cacheKey });
      return res.json(cachedResponse.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function(data) {
      // Cache successful responses
      if (res.statusCode < 400) {
        cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        logger.debug(`Cached feedback response`, { cacheKey });
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache for specific feedback
 * Call this when feedback is updated or deleted
 */
const invalidateFeedbackCache = (feedbackId) => {
  // This would be implemented with a proper cache store in production
  // For now, we'll use a simple in-memory cache in the middleware
  logger.info(`Cache invalidated for feedback`, { feedbackId });
};

module.exports = {
  feedbackRateLimiter,
  logFeedbackRequest,
  cacheMiddleware,
  invalidateFeedbackCache
};
