const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
});

module.exports = mongoose.model('Conversation', conversationSchema);