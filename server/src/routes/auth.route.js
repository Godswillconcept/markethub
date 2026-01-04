const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validate } = require("../validators/auth.validator");
const { protect, localAuth, restrictTo, enhancedLogout } = require("../middlewares/auth");
const uploadFiles = require("../middlewares/fileUpload");
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  requestPhoneChangeValidation,
  cancelPhoneChangeValidation,
} = require("../validators/auth.validator");

// New validation rules for refresh token system
const { body, param } = require('express-validator');

const refreshTokenValidation = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid refresh token format'),
  body('session_id')
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid session ID format')
];

const sessionValidation = [
  param('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ min: 10 })
    .withMessage('Invalid session ID format')
];

const logoutValidation = [
  body('session_id')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Invalid session ID format'),
  body('logout_all')
    .optional()
    .isBoolean()
    .withMessage('logout_all must be a boolean')
];

const revokeRefreshTokenValidation = [
  body('refresh_token')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid refresh token format')
];

// Public routes
router.post("/register", registerValidation, validate,  authController.register);
router.post("/register-admin", registerValidation, validate, authController.registerAdmin);

// Login with Passport local strategy (original)
router.post(
  "/login",
  loginValidation,
  validate,
  localAuth(),
  authController.login
);

// Enhanced login with refresh token support
router.post(
  "/login-enhanced",
  loginValidation,
  validate,
  localAuth(),
  authController.loginEnhanced
);

router.post(
  "/verify-email",
  verifyEmailValidation,
  validate,
  authController.verifyEmail
);
router.post(
  "/resend-verification",
  resendVerificationValidation,
  validate,
  authController.resendVerificationCode
);

// Password reset flow - Token embedded in URL
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

// Verify reset token is valid (called when user clicks the email link)
router.get(
  "/verify-reset-token/:token",
  authController.verifyResetToken
);

// Reset password with token in URL (user submits new password)
router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

// Phone change verification (public route)
router.get("/verify-phone-change/:token", authController.verifyPhoneChange);

// Refresh token endpoint
router.post(
  "/refresh",
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

// Alias for refresh token (to match client calls)
router.post(
  "/refresh-token",
  refreshTokenValidation,
  validate,
  authController.refreshToken
);

// Revoke specific refresh token
router.post(
  "/revoke-refresh-token",
  revokeRefreshTokenValidation,
  validate,
  authController.revokeRefreshToken
);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get("/me", authController.getMe);
router.put(
  "/me",
  updateProfileValidation,
  validate,
  uploadFiles('profile_image', 1, 'user-avatars'), // Add file upload middleware
  authController.updateProfile
);
router.patch(
  "/update-password",
  updatePasswordValidation,
  validate,
  authController.updatePassword
);

// Phone change routes
router.post(
  "/request-phone-change",
  requestPhoneChangeValidation,
  validate,
  authController.requestPhoneChange
);
router.post(
  "/cancel-phone-change",
  cancelPhoneChangeValidation,
  validate,
  authController.cancelPhoneChange
);



// Enhanced logout with session management
router.post(
  "/logout",
  logoutValidation,
  validate,
  enhancedLogout,
  authController.logoutEnhanced
);

// Logout all devices
router.post(
  "/logout-all-devices",
  enhancedLogout,
  authController.logoutAllDevices
);

// Get user sessions
router.get(
  "/sessions",
  authController.getSessions
);

// Revoke specific session
router.delete(
  "/sessions/:sessionId",
  sessionValidation,
  validate,
  authController.revokeSession
);

// Revoke all sessions
router.delete(
  "/sessions",
  authController.revokeAllSessions
);

// Get token statistics
router.get(
  "/token-stats",
  authController.getTokenStats
);



// Get user blacklist entries
router.get(
  "/blacklist",
  authController.getUserBlacklist
);

// Original logout (maintained for backward compatibility)
router.get("/logout-original", authController.logout);

// Add GET route for logout to handle the current issue
router.get("/logout", authController.logout);

// Admin routes (require admin role)
router.use(restrictTo("admin"));

// Phone change admin routes
router.get("/pending-phone-changes", authController.getPendingPhoneChanges);
router.patch(
  "/approve-phone-change/:userId",
  authController.approvePhoneChange
);
router.patch("/reject-phone-change/:userId", authController.rejectPhoneChange);

// Admin blacklist statistics
router.get("/admin/blacklist-stats", authController.getBlacklistStats);

module.exports = router;
