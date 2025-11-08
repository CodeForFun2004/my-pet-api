// routes/blogArticle.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllBlogArticles,
  getBlogArticleById,
  createBlogArticle,
  updateBlogArticle,
  deleteBlogArticle
} = require('../controllers/blogArticle.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

// GET /api/blog-articles - Get all blog articles (Public)
router.get('/', getAllBlogArticles);

// GET /api/blog-articles/:id - Get blog article by ID (Public)
router.get('/:id', getBlogArticleById);

// POST /api/blog-articles - Create blog article (Admin only)
router.post('/', protect, isAdmin, createBlogArticle);

// PUT /api/blog-articles/:id - Update blog article (Admin only)
router.put('/:id', protect, isAdmin, updateBlogArticle);

// DELETE /api/blog-articles/:id - Delete blog article (Admin only)
router.delete('/:id', protect, isAdmin, deleteBlogArticle);

module.exports = router;

