// routes/cart.routes.js
const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cart.controller');

const { protect } = require('../middlewares/auth.middleware');

// All cart routes require authentication
router.use(protect);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// POST /api/cart/items - Add item to cart
router.post('/items', addToCart);

// PUT /api/cart/items/:itemIndex - Update cart item quantity
router.put('/items/:itemIndex', updateCartItem);

// DELETE /api/cart/items/:itemIndex - Remove item from cart
router.delete('/items/:itemIndex', removeFromCart);

// DELETE /api/cart - Clear cart
router.delete('/', clearCart);

module.exports = router;







