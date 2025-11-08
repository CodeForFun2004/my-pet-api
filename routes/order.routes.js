// routes/order.routes.js
const express = require('express');
const router = express.Router();

const {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../controllers/order.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

// All order routes require authentication
router.use(protect);

// GET /api/orders/all - Get all orders (Admin only)
router.get('/all', isAdmin, getAllOrders);

// GET /api/orders - Get user's orders
router.get('/', getUserOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrderById);

// POST /api/orders - Create new order
router.post('/', createOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', cancelOrder);

module.exports = router;







