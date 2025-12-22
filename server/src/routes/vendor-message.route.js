const express = require("express");
const router = express.Router();

const vendorMessageController = require("../controllers/vendor-message.controller");
const {
  createVendorMessageValidator,
  getVendorMessageValidator,
  updateVendorMessageValidator,
  validate,
} = require("../validators/vendor-message.validator");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

// Vendor routes - vendors can only access their own messages
router
  .route("/vendor")
  .post(
    createVendorMessageValidator,
    validate,
    vendorMessageController.createVendorMessage
  )
  .get(vendorMessageController.getMyVendorMessages);

router
  .route("/vendor/:id")
  .get(
    getVendorMessageValidator,
    validate,
    vendorMessageController.getVendorMessage
  )
  .patch(
    updateVendorMessageValidator,
    validate,
    vendorMessageController.updateVendorMessageStatus
  )
  .delete(
    getVendorMessageValidator,
    validate,
    vendorMessageController.deleteVendorMessage
  );

// Admin routes - admins can access all vendor messages
router.use(restrictTo("admin"));


router.get("/admin/all", vendorMessageController.getAllVendorMessages);

router.get("/admin/:id", getVendorMessageValidator, validate, vendorMessageController.getVendorMessage);

router.patch("/admin/:id/resolve", getVendorMessageValidator, validate, vendorMessageController.resolveMessage);
module.exports = router;
