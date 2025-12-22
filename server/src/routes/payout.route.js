const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payout.controller');
const { protect, restrictTo } = require('../middlewares/auth');

router.use(protect);

// Admin only routes for now
router.post('/initiate', restrictTo('admin'), payoutController.initiatePayout);

module.exports = router;
