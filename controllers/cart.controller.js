// controllers/cart.controller.js
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product');

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ 
      message: 'Failed to fetch cart', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { productId, quantity = 1, color, size, weight } = req.body;

    // Validate required fields
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.inStock || product.stockQuantity < quantity) {
      return res.status(400).json({ 
        message: 'Product out of stock',
        availableStock: product.stockQuantity 
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if item already exists in cart with same options
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.product.toString() === productId.toString() &&
        item.color === (color || null) &&
        item.size === (size || null) &&
        item.weight === (weight || null)
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      // Check stock again for updated quantity
      if (product.stockQuantity < newQuantity) {
        return res.status(400).json({ 
          message: 'Insufficient stock for requested quantity',
          availableStock: product.stockQuantity,
          currentInCart: cart.items[existingItemIndex].quantity
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: product.price,
        color: color || undefined,
        size: size || undefined,
        weight: weight || undefined
      });
    }

    await cart.save();

    // Populate before returning
    await cart.populate('items.product');

    res.status(200).json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ 
      message: 'Failed to add item to cart', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemIndex
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemIndex = parseInt(req.params.itemIndex);

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Validate stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (!product.inStock || product.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate('items.product');

    res.status(200).json({
      message: 'Cart item updated successfully',
      cart
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update cart item', error: err.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemIndex
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const itemIndex = parseInt(req.params.itemIndex);

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate('items.product');

    res.status(200).json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item from cart', error: err.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
};







