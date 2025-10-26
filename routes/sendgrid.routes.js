const express = require('express');
const router = express.Router();
const { ping, testSend } = require('../controllers/sendgrid.controller');

// Health-check for SendGrid test controller
router.get('/ping', ping);

// Send a test email via SendGrid
// Body: { to, subject?, text?, html? }
router.post('/send', testSend);

module.exports = router;