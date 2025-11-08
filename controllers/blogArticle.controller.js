// controllers/blogArticle.controller.js
const BlogArticle = require('../models/blogArticle.model');

// @desc    Get all blog articles
// @route   GET /api/blog-articles
// @access  Public
exports.getAllBlogArticles = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const query = { isPublished: true };
    
    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [articles, total] = await Promise.all([
      BlogArticle.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogArticle.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      articles
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blog articles', error: err.message });
  }
};

// @desc    Get blog article by ID
// @route   GET /api/blog-articles/:id
// @access  Public
exports.getBlogArticleById = async (req, res) => {
  try {
    const article = await BlogArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blog article', error: err.message });
  }
};

// @desc    Create blog article
// @route   POST /api/blog-articles
// @access  Admin
exports.createBlogArticle = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      image,
      author,
      tags,
      readTime,
      isPublished,
    } = req.body;

    const article = new BlogArticle({
      title,
      description,
      content: content || '',
      image: image || '',
      author: author || 'Admin',
      tags: tags || [],
      readTime: readTime || 5,
      isPublished: isPublished !== undefined ? isPublished : true,
      publishedAt: new Date(),
    });

    await article.save();

    res.status(201).json({
      message: 'Blog article created successfully',
      article
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create blog article', error: err.message });
  }
};

// @desc    Update blog article
// @route   PUT /api/blog-articles/:id
// @access  Admin
exports.updateBlogArticle = async (req, res) => {
  try {
    const article = await BlogArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    const allowedUpdates = ['title', 'description', 'content', 'image', 'author', 'tags', 'readTime', 'isPublished'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        article[field] = req.body[field];
      }
    });

    await article.save();

    res.status(200).json({
      message: 'Blog article updated successfully',
      article
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update blog article', error: err.message });
  }
};

// @desc    Delete blog article
// @route   DELETE /api/blog-articles/:id
// @access  Admin
exports.deleteBlogArticle = async (req, res) => {
  try {
    const article = await BlogArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Blog article not found' });
    }

    await BlogArticle.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Blog article deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete blog article', error: err.message });
  }
};

