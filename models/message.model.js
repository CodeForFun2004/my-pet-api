const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: {
    text: String,
    imageUrls: [String]
  },
  timestamp: { type: Date, default: Date.now },
  aiModel: String,
  tokensUsed: Number
});

module.exports = mongoose.model('Message', messageSchema);