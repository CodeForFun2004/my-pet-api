// models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    image: { type: String, required: true },
    description: { type: String },
    
    // Category
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category',
      required: true,
      index: true
    },
    
    // Reviews & Ratings
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    
    // Product options
    weight: { type: String },
    weightOptions: [{
      id: Number,
      weight: String,
      price: Number,
      selected: { type: Boolean, default: false }
    }],
    colorOptions: [{
      id: Number,
      color: String,
      selected: { type: Boolean, default: false }
    }],
    sizeOptions: [{
      id: Number,
      size: String,
      selected: { type: Boolean, default: false }
    }],
    
    // Reviews
    reviews: [{
      id: Number,
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      avatar: String,
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: String
    }],
    
    // Product metadata
    tags: [{ type: String }],
    inStock: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    
    // SEO
    slug: { type: String, unique: true, sparse: true },
    
    // Timestamps
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;







