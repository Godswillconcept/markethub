const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");
const {
  registerVendorValidation,
  completeOnboardingValidation,
  rejectVendorValidation,
  initializeOnboardingValidation,
  updateVendorProfileValidation,
  validate,
} = require("../validators/vendor.validator");
const { protect, restrictTo } = require("../middlewares/auth");
const { requirePermission } = require("../middlewares/permissions");
const {
  setVendorId,
  handleOnboardingUploads,
  processOnboardingFiles,
} = require("../middlewares/vendorOnboarding");
const {
  getVendorProductsValidation,
} = require("../validators/product.validator");
const uploadFiles = require("../middlewares/fileUpload");

// Public routes
const businessImagesUpload = uploadFiles("businessImages", 5, "vendor-assets");

router.post(
  "/",
  businessImagesUpload,
  registerVendorValidation,
  validate,
  vendorController.registerVendor
);

router.get("/", vendorController.getAllVendors);
// Dynamic parameter routes (must come after specific routes)
router.get(
  "/:id/products",
  getVendorProductsValidation,
  validate,
  vendorController.getVendorProducts
);
router.get("/:id", vendorController.getVendor);

// Protected routes (require authentication)
router.use(protect);

// Vendor profile route (accessible by vendor or admin)
router.get(
  "/vendor/profile",
  restrictTo('vendor'),
  vendorController.getVendorProfile
);

// Update vendor profile
router.patch(
  "/vendor/profile",
  restrictTo("vendor"),
  handleOnboardingUploads,
  processOnboardingFiles,
  updateVendorProfileValidation,
  validate,
  vendorController.updateVendorProfile
);

// Admin access to vendor profile by ID
router.get(
  "/:id/profile",
  restrictTo('admin'),
  vendorController.getVendorProfile
);



// Initialize vendor onboarding (vendor only)
router.post(
  "/initialize-onboarding",
  restrictTo("vendor"),
  initializeOnboardingValidation,
  validate,
  vendorController.initializeVendorOnboarding
);

// Complete vendor onboarding (vendor only)
router.patch(
  "/complete-onboarding",
  restrictTo("vendor"),
  setVendorId,
  handleOnboardingUploads,
  processOnboardingFiles,
  completeOnboardingValidation,
  validate,
  vendorController.completeOnboarding
);

// Follower routes (authenticated users)
router.post("/:vendorId/follow", vendorController.followVendor);
router.delete("/:vendorId/follow", vendorController.unfollowVendor);
router.get("/vendor/:vendorId/followers", vendorController.getVendorFollowers);
router.get("/vendor/:vendorId/follow-status", vendorController.checkFollowStatus);

// User following routes
router.get("/user/:userId/following", vendorController.getUserFollowing);
router.get("/user/following", vendorController.getUserFollowing);

// Vendor-specific follower routes (vendor only)
router.get("/profile/followers", restrictTo("vendor"), vendorController.getMyFollowers);

// Admin routes

// Approve vendor
router.patch(
  "/:id/approve",
  requirePermission('vendors_approve'),
  vendorController.approveVendor
);

// Reject vendor
router.patch("/:id/reject", requirePermission('vendors_reject'), rejectVendorValidation, validate, vendorController.rejectVendor);

// Approve vendor logo change
router.patch(
  "/:id/logo/approve",
  requirePermission('vendors_update'),
  vendorController.approveVendorLogo
);

// Reject vendor logo change
router.patch(
  "/:id/logo/reject",
  requirePermission('vendors_update'),
  vendorController.rejectVendorLogo
);

module.exports = router;
