// routes/coupon.routes.js
const express = require('express');
const router = express.Router();

const {
  applyCoupon,
  getAllCoupons,
  getCouponByCode,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCouponsAdmin
} = require('../controllers/coupon.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

// GET /api/coupons - Get all active coupons (Public)
router.get('/', getAllCoupons);

// GET /api/coupons/:code - Get coupon by code (Public)
router.get('/:code', getCouponByCode);

// POST /api/coupons/apply - Apply coupon code (Private)
router.post('/apply', protect, applyCoupon);

// Admin routes
// GET /api/coupons/admin/all - Get all coupons with stats (Admin only)
router.get('/admin/all', protect, isAdmin, getAllCouponsAdmin);

// POST /api/coupons/admin - Create coupon (Admin only)
router.post('/admin', protect, isAdmin, createCoupon);

// PUT /api/coupons/admin/:id - Update coupon (Admin only)
router.put('/admin/:id', protect, isAdmin, updateCoupon);

// DELETE /api/coupons/admin/:id - Delete coupon (Admin only)
router.delete('/admin/:id', protect, isAdmin, deleteCoupon);

module.exports = router;







