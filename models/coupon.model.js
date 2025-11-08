// models/coupon.model.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: { type: String, required: true },
    description: { type: String },
    
    // Discount info
    discountType: { 
      type: String, 
      enum: ['percentage', 'fixed'],
      required: true 
    },
    discountValue: { type: Number, required: true },
    
    // Conditions
    minOrderValue: { type: Number, default: 0 },
    maxDiscountValue: { type: Number }, // For percentage discounts
    maxUses: { type: Number }, // Total usage limit
    maxUsesPerUser: { type: Number, default: 1 },
    
    // Validity
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    
    // Applied to
    applicableProducts: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    }],
    applicableCategories: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category' 
    }],
    
    // Tracking
    usageCount: { type: Number, default: 0 },
    usedBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      usedAt: { type: Date, default: Date.now },
      discountAmount: Number
    }]
  },
  { timestamps: true }
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ 'usedBy.userId': 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function(userId, orderValue) {
  if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
  
  const now = new Date();
  if (now < this.validFrom) return { valid: false, message: 'Coupon not yet valid' };
  if (now > this.validUntil) return { valid: false, message: 'Coupon has expired' };
  
  if (orderValue < this.minOrderValue) {
    return { valid: false, message: `Minimum order value is ${this.minOrderValue}` };
  }
  
  if (this.maxUses && this.usageCount >= this.maxUses) {
    return { valid: false, message: 'Coupon has reached maximum usage limit' };
  }
  
  if (this.maxUsesPerUser && userId) {
    const userUsageCount = this.usedBy.filter(u => u.userId.toString() === userId.toString()).length;
    if (userUsageCount >= this.maxUsesPerUser) {
      return { valid: false, message: 'You have reached maximum usage limit for this coupon' };
    }
  }
  
  return { valid: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderValue) {
  if (this.discountType === 'percentage') {
    const discount = (orderValue * this.discountValue) / 100;
    if (this.maxDiscountValue && discount > this.maxDiscountValue) {
      return this.maxDiscountValue;
    }
    return discount;
  } else {
    // Fixed amount
    return this.discountValue;
  }
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;







