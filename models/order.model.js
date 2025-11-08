// models/order.model.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  productName: { type: String, required: true },
  productImage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: { type: String },
  size: { type: String },
  weight: { type: String }
}, { _id: false });

const shippingInfoSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  notes: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { 
      type: String, 
      unique: true, 
      required: true,
      index: true
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true,
      index: true
    },
    items: [orderItemSchema],
    shippingInfo: shippingInfoSchema,
    shippingOption: {
      id: String,
      name: String,
      price: Number,
      description: String
    },
    paymentMethod: { 
      type: String, 
      required: true 
    },
    
    // Pricing
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    // Order status
    status: { 
      type: String, 
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    
    // Coupon/Promo code
    promoCode: { type: String },
    
    // Payment info
    paymentStatus: { 
      type: String, 
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING'
    },
    paymentDate: { type: Date },
    
    // Shipping info
    shippedDate: { type: Date },
    deliveredDate: { type: Date }
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;







