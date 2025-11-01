const { chatWithDoctorAI } = require('../services/doctorAI.service');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

exports.chat = async (req, res) => {
  try {
    const { conversationId, userText, imageUrls = [], createIfMissing } = req.body;
    const userId = req.user?.id || req.userId; // Hỗ trợ cả req.user và req.userId

    if (!userId) {
      return res.status(401).json({ 
        message: 'Người dùng chưa đăng nhập' 
      });
    }

    // Lấy imageUrls từ req.files (Cloudinary) nếu có upload trong request này
    const uploadedImages = req.files ? req.files.map(file => file.path) : [];
    const allImageUrls = [...imageUrls, ...uploadedImages];

    // Find or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ conversationId, userId });
    }
    
    if (!conversation && createIfMissing) {
      conversation = await Conversation.create({
        conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        createdAt: new Date(),
        status: 'active'
      });
    }

    if (!conversation) {
      return res.status(404).json({ 
        message: 'Không tìm thấy cuộc trò chuyện' 
      });
    }

    // Save user message
    await Message.create({
      conversationId: conversation.conversationId,
      userId,
      role: 'user',
      content: { text: userText, imageUrls: allImageUrls },
      timestamp: new Date()
    });

    // Get AI response - SỬA BUG: chatWithGemini → chatWithDoctorAI
    const reply = await chatWithDoctorAI({ userText, imageUrls: allImageUrls });

    // Save AI response
    await Message.create({
      conversationId: conversation.conversationId,
      userId,
      role: 'assistant',
      content: { text: reply },
      timestamp: new Date()
    });

    // Update last activity
    await Conversation.updateOne(
      { conversationId: conversation.conversationId },
      { lastActivityAt: new Date() }
    );

    res.json({
      conversationId: conversation.conversationId,
      reply
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      message: 'Có lỗi xảy ra khi xử lý tin nhắn',
      error: error.message 
    });
  }
};

// Upload images và trả về URLs (Cloudinary)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'Vui lòng chọn ít nhất một ảnh' 
      });
    }

    // req.files[].path đã chứa Cloudinary URL từ upload middleware
    const urls = req.files.map(file => file.path);

    res.json({ urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Không thể tải ảnh lên',
      error: error.message 
    });
  }
};