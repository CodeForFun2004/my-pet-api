// controllers/category.controller.js
const Category = require('../models/category.model');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category', error: err.message });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, image, description, order } = req.body;

    const category = new Category({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      image,
      description,
      order: order || 0
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    const allowedUpdates = ['name', 'image', 'description', 'order', 'isActive'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        category[field] = req.body[field];
      }
    });

    // Update slug if name changed
    if (req.body.name) {
      category.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
    }

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully',
      category
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate category name or slug' });
    }
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (category.productCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with products. Please remove products first.' 
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
};







