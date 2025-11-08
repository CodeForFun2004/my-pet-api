const mongoose = require('mongoose');

const blogArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: 'Admin',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    readTime: {
      type: Number,
      default: 5, // minutes
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
blogArticleSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('BlogArticle', blogArticleSchema);

