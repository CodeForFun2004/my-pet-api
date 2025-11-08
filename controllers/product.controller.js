// controllers/product.controller.js
const Product = require('../models/product.model');
const Category = require('../models/category.model');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    // Filter by category
    if (req.query.categoryId) {
      query.category = req.query.categoryId;
    }
    
    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Price range
    if (req.query.minPrice) {
      query.price = { ...query.price, $gte: parseFloat(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(req.query.maxPrice) };
    }
    
    // In stock filter
    if (req.query.inStock === 'true') {
      query.inStock = true;
      query.stockQuantity = { $gt: 0 };
    }

    // Build sort
    let sort = {};
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price':
          sort.price = req.query.sortOrder === 'desc' ? -1 : 1;
          break;
        case 'rating':
          sort.rating = -1;
          break;
        case 'createdAt':
          sort.createdAt = -1;
          break;
        case 'name':
        default:
          sort.name = 1;
          break;
      }
    } else {
      sort.createdAt = -1; // Default: newest first
    }

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      items
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug description')
      .populate('reviews.userId', 'fullname avatar');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name, brand, price, originalPrice, image, description,
      category, weight, weightOptions, colorOptions, sizeOptions,
      tags, inStock, stockQuantity
    } = req.body;

    // Validate category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const product = new Product({
      name,
      brand,
      price,
      originalPrice,
      image,
      description,
      category,
      weight,
      weightOptions,
      colorOptions,
      sizeOptions,
      tags,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity || 0,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    });

    await product.save();

    // Update category product count
    await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Product with this slug already exists' });
    }
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    const allowedUpdates = ['name', 'brand', 'price', 'originalPrice', 'image', 
                            'description', 'category', 'weight', 'weightOptions', 
                            'colorOptions', 'sizeOptions', 'tags', 'inStock', 
                            'stockQuantity', 'isActive'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Update category product count
    await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = {
      id: Date.now(),
      userId: req.user.id,
      name: req.user.fullname || 'Anonymous',
      avatar: req.user.avatar,
      rating: parseInt(rating),
      comment,
      date: new Date().toLocaleDateString('vi-VN')
    };

    product.reviews.push(review);
    
    // Recalculate average rating
    const ratings = product.reviews.map(r => r.rating);
    product.rating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    product.reviewCount = product.reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
};







