// routes/category.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

// GET /api/categories - Get all categories (Public)
router.get('/', getAllCategories);

// GET /api/categories/:id - Get category by ID (Public)
router.get('/:id', getCategoryById);

// POST /api/categories - Create category (Admin only)
router.post('/', protect, isAdmin, createCategory);

// PUT /api/categories/:id - Update category (Admin only)
router.put('/:id', protect, isAdmin, updateCategory);

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router;







