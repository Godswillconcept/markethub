const { Vendor, Store, Payout, sequelize } = require("../models");
const paymentService = require("../services/payment.service");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

/**
 * Initiate a payout to a vendor
 * @param {import('express').Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {number} req.body.amount - Amount to payout
 * @param {number} req.body.vendorId - Vendor ID (Admin only, or inferred from auth for vendor)
 */
const initiatePayout = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { amount, vendorId } = req.body;
    
    // Authorization check (Admin can pay anyone, Vendor can only request for themselves - simplified to Admin initiates for now)
    // Assuming this is an Admin endpoint based on "Payment Out" requirement usually being controlled.
    
    const vendor = await Vendor.findByPk(vendorId, {
      include: [{ model: Store, as: "store" }],
      transaction
    });

    if (!vendor) {
      throw new AppError("Vendor not found", 404);
    }

    if (!vendor.store.paystack_recipient_code) {
      throw new AppError("Vendor does not have a valid payment account set up.", 400);
    }

    if (vendor.total_earnings < amount) {
      throw new AppError("Insufficient vendor balance", 400);
    }

    // Initiate Transfer
    const transferData = {
      source: "balance", // Pay from Paystack Balance
      reason: `Payout to ${vendor.store.business_name}`,
      amount: amount,
      recipient: vendor.store.paystack_recipient_code,
    };

    const transferResponse = await paymentService.transfers.initiate(transferData);

    // Record Payout in DB
    const payout = await Payout.create({
      vendor_id: vendor.id,
      amount: amount,
      status: "pending", // Paystack status is usually pending/success/failed
      reference: transferResponse.data.reference,
      transfer_code: transferResponse.data.transfer_code
    }, { transaction });

    // Deduct from Vendor Earnings (Optimistic update, reconcile on webhook)
    await vendor.decrement('total_earnings', { by: amount, transaction });

    await transaction.commit();

    res.status(200).json({
      status: "success",
      message: "Payout initiated successfully",
      data: {
        payout,
        paystack: transferResponse.data
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Payout Error:", error);
    return next(new AppError(error.message || "Payout failed", 500));
  }
});

module.exports = {
  initiatePayout
};
