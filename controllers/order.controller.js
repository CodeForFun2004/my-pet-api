// controllers/order.controller.js
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Coupon = require('../models/coupon.model');
const Product = require('../models/product.model');

// Helper function to generate order number
const generateOrderNumber = () => {
  return `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name image')
      .populate('user', 'fullname email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingInfo, shippingOption, paymentMethod, promoCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemPrice = product.price;
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        price: itemPrice,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        weight: item.weight
      });

      subtotal += itemPrice * item.quantity;
    }

    // Apply coupon if provided
    let discount = 0;
    let usedCoupon = null;
    
    if (promoCode) {
      const coupon = await Coupon.findOne({ code: promoCode.toUpperCase() });
      
      if (coupon) {
        const validation = coupon.isValid(req.user.id, subtotal);
        
        if (validation.valid) {
          discount = coupon.calculateDiscount(subtotal);
          
          // Update coupon usage
          coupon.usageCount += 1;
          coupon.usedBy.push({
            userId: req.user.id,
            usedAt: new Date(),
            discountAmount: discount
          });
          await coupon.save();
          
          usedCoupon = coupon._id;
        }
      }
    }

    // Calculate shipping fee
    const shippingFee = shippingOption?.price || 0;

    // Calculate total
    const total = subtotal + shippingFee - discount;

    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      user: req.user.id,
      items: orderItems,
      shippingInfo,
      shippingOption,
      paymentMethod,
      promoCode: promoCode || undefined,
      subtotal,
      shippingFee,
      discount,
      total,
      status: 'PENDING',
      paymentStatus: 'PENDING'
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Clear cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Populate before returning
    await order.populate('items.product');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (User or Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions (user can only cancel, admin can do anything)
    if (status === 'CANCELLED' && order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    if (status !== 'CANCELLED' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can update order to this status' });
    }

    // Update status and dates
    order.status = status;
    if (status === 'SHIPPED') {
      order.shippedDate = new Date();
    }
    if (status === 'DELIVERED') {
      order.deliveredDate = new Date();
      order.paymentStatus = 'PAID';
      order.paymentDate = new Date();
    }

    await order.save();

    res.status(200).json({
      message: 'Order status updated successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    order.status = 'CANCELLED';
    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel order', error: err.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/all
// @access  Admin
exports.getAllOrders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'fullname email phone')
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};







