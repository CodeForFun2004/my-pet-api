// controllers/coupon.controller.js
const Coupon = require('../models/coupon.model');

// @desc    Apply coupon code
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const validation = coupon.isValid(req.user.id, orderValue);
    
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const discountAmount = coupon.calculateDiscount(orderValue);

    res.status(200).json({
      valid: true,
      coupon: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountValue: coupon.maxDiscountValue
      },
      discountAmount,
      message: 'Coupon applied successfully'
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to apply coupon', error: err.message });
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ 
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).select('-usedBy').lean();

    res.status(200).json({ coupons });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: err.message });
  }
};

// @desc    Get coupon by code
// @route   GET /api/coupons/:code
// @access  Public
exports.getCouponByCode = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() })
      .select('-usedBy');
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json(coupon);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coupon', error: err.message });
  }
};

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Admin
exports.createCoupon = async (req, res) => {
  try {
    const {
      code, name, description, discountType, discountValue,
      minOrderValue, maxDiscountValue, maxUses, maxUsesPerUser,
      validFrom, validUntil, applicableProducts, applicableCategories
    } = req.body;

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountValue,
      maxUses,
      maxUsesPerUser: maxUsesPerUser || 1,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      applicableProducts,
      applicableCategories
    });

    await coupon.save();

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: 'Failed to create coupon', error: err.message });
  }
};

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Admin
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Update fields
    const allowedUpdates = ['name', 'description', 'discountType', 'discountValue',
                            'minOrderValue', 'maxDiscountValue', 'maxUses', 
                            'maxUsesPerUser', 'validFrom', 'validUntil', 
                            'isActive', 'applicableProducts', 'applicableCategories'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'validFrom' || field === 'validUntil') {
          coupon[field] = new Date(req.body[field]);
        } else if (field === 'applicableProducts' || field === 'applicableCategories') {
          coupon[field] = Array.isArray(req.body[field]) ? req.body[field] : [];
        } else {
          coupon[field] = req.body[field];
        }
      }
    });

    await coupon.save();

    res.status(200).json({
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update coupon', error: err.message });
  }
};

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete coupon', error: err.message });
  }
};

// @desc    Get all coupons with usage stats (Admin only)
// @route   GET /api/coupons/all
// @access  Admin
exports.getAllCouponsAdmin = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('applicableProducts', 'name')
      .populate('applicableCategories', 'name')
      .lean();

    res.status(200).json({ coupons });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coupons', error: err.message });
  }
};







