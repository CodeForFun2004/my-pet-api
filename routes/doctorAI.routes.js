const express = require('express');
const router = express.Router();
const { chat, uploadImages } = require('../controllers/doctorAI.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const createUploadMiddleware = require('../middlewares/upload.middleware.js');
const User = require('../models/user.model');

// Sử dụng upload middleware với Cloudinary (nhất quán với các routes khác)
const uploadDoctorAI = createUploadMiddleware({
  folderPrefix: 'my-pet/doctor-ai',
  nameField: 'username',
  model: User,
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 1200, height: 1200, crop: 'limit' }] // Cho phép ảnh lớn hơn cho AI phân tích
});

// Routes
router.post('/upload', protect, uploadDoctorAI.array('images', 5), uploadImages);
router.post('/chat', protect, chat);

module.exports = router;