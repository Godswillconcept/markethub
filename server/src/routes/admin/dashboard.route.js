const express = require('express');
const {
  getAdminDashboard,
  getTopSellingVendors,
  getAdminSalesStats,
  getAdminTopCategories,
  getRecentOrders,
  getTopSellingItems,
  getVendorOnboardingStats,
  getVendorOverview,
  getAdminProducts,
} = require('../../controllers/dashboard.controller');

const { cache, invalidate } = require('../../utils/cache');

const router = express.Router();

// Admin routes - protected by global checkPermission middleware
// The checkPermission middleware handles both authentication and permission checks

// Core dashboard metrics with admin-specific caching
router.get('/metrics', getAdminDashboard);

// Recent orders with shorter cache due to high update frequency
router.get('/recent-orders', getRecentOrders);

// Top selling vendors with medium cache duration
router.get('/top-selling-vendors', getTopSellingVendors);

// Top selling items with medium cache duration
router.get('/top-selling-items', getTopSellingItems);

// Sales statistics with longer cache due to calculation complexity
router.get('/sales-stats', getAdminSalesStats);

// Top categories with medium cache duration
router.get('/top-categories', getAdminTopCategories);

// Vendor onboarding statistics with longer cache
router.get('/vendor-onboarding-stats', getVendorOnboardingStats);

// Vendor overview with specific vendor ID in key for targeted caching
router.get('/vendor-overview/:vendorId', getVendorOverview);

// Admin products with products-specific caching
router.get('/products', getAdminProducts);

module.exports = router;
