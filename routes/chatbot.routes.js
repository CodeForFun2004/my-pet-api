// routes/chatbot.routes.js
const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/gemini.controller'); // Import controller AI

// Định nghĩa route POST cho chatbot
// Khi có yêu cầu POST đến '/chatbot', hàm askAIAboutMyPetClinic trong geminiController sẽ được gọi
router.post('/', geminiController.askAIAboutMyPetClinic);

module.exports = router;
