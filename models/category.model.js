// models/category.model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    image: { type: String },
    description: { type: String },
    productCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 } // For display ordering
  },
  { timestamps: true }
);

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;







