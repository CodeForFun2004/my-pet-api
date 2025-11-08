// routes/product.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview
} = require('../controllers/product.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

// GET /api/products - Get all products (Public)
router.get('/', getAllProducts);

// GET /api/products/:id - Get product by ID (Public)
router.get('/:id', getProductById);

// POST /api/products/:id/reviews - Add review to product (Private)
router.post('/:id/reviews', protect, addProductReview);

// POST /api/products - Create product (Admin only)
router.post('/', protect, isAdmin, createProduct);

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', protect, isAdmin, updateProduct);

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', protect, isAdmin, deleteProduct);

module.exports = router;







