const express = require("express");
const router = express.Router();

const supportFeedbackController = require("../controllers/support-feedback.controller");
const {
  createFeedbackValidator,
  getFeedbackValidator,
  updateFeedbackValidator,
  getAllFeedbacksValidator,
  addReplyValidator,
  validate
} = require("../validators/support-feedback.validator");
const { protect, isAdmin, isOwnerOrAdmin } = require("../middlewares/auth");
const { SupportFeedback } = require("../models");
const uploadSupportFiles = require("../middlewares/supportFileUpload");
const {
  feedbackRateLimiter,
  logFeedbackRequest,
  cacheMiddleware
} = require("../middlewares/support-feedback.middleware");

// Apply request logging to all feedback routes
router.use(logFeedbackRequest);

// Apply authentication protection to all routes
router.use(protect);

/**
 * Support Feedback Routes
 *
 * Security Measures:
 * - All routes require authentication (protect middleware)
 * - All requests are logged for audit trail
 * - Rate limiting applied to prevent abuse
 * - Admin authorization for sensitive operations
 * - Response caching for GET requests
 * - Owner or admin access for resource modification
 */

router
  .route("/")
  .post(
    // Security: Rate limit feedback submissions to prevent spam
    feedbackRateLimiter,
    uploadSupportFiles("attachments", 5, "support-attachments"),
    createFeedbackValidator,
    validate,
    supportFeedbackController.createFeedback
  )
  .get(
    // Security: Cache GET requests for better performance
    cacheMiddleware(5 * 60 * 1000), // 5 minutes cache
    supportFeedbackController.getMyFeedbacks
  );

router
  .route("/:id")
  .get(
    getFeedbackValidator,
    validate,
    // Security: Cache GET requests for better performance
    cacheMiddleware(5 * 60 * 1000), // 5 minutes cache
    supportFeedbackController.getFeedback
  )
  .patch(
    // Security: Only admins can update feedback status
    isAdmin,
    updateFeedbackValidator,
    validate,
    supportFeedbackController.updateFeedbackStatus
  )
  .delete(
    // Security: Only owner or admin can delete feedback
    // Using isOwnerOrAdmin middleware with SupportFeedback model
    isOwnerOrAdmin(SupportFeedback, "id", "user_id"),
    supportFeedbackController.deleteFeedback
  );

// ========================================
// Admin Routes
// ========================================

/**
 * Admin Feedback Management Routes
 *
 * Security Measures:
 * - All routes require admin role (isAdmin middleware)
 * - All requests are logged for audit trail
 * - Rate limiting applied to prevent abuse
 * - Input validation for all endpoints
 * - Response caching for GET requests
 */

// GET /admin/feedbacks - Get all feedbacks (Admin only)
router.get(
  "/admin/feedbacks",
  // Security: Only admins can access all feedbacks
  isAdmin,
  // Security: Validate query parameters
  getAllFeedbacksValidator,
  validate,
  // Security: Cache GET requests for better performance
  cacheMiddleware(2 * 60 * 1000), // 2 minutes cache
  supportFeedbackController.getAllFeedbacks
);

// GET /admin/feedbacks/stats - Get feedback statistics (Admin only)
router.get(
  "/admin/feedbacks/stats",
  // Security: Only admins can access statistics
  isAdmin,
  // Security: Cache GET requests for better performance
  cacheMiddleware(5 * 60 * 1000), // 5 minutes cache
  supportFeedbackController.getFeedbackStats
);

// POST /admin/feedbacks/:id/reply - Add admin reply to feedback (Admin only)
router.post(
  "/admin/feedbacks/:id/reply",
  // Security: Only admins can add replies
  isAdmin,
  // Security: Rate limit reply submissions to prevent spam
  feedbackRateLimiter,
  // Security: Validate request body
  addReplyValidator,
  validate,
  supportFeedbackController.addReply
);

module.exports = router;