// Controller to test SendGrid email sending via SendGrid (CommonJS)
const sgMail = require('@sendgrid/mail');
const logPrefix = '[SendGridTestController]';

// Configure API key if provided
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Quick health-check endpoint
const ping = (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'SendGrid test controller is reachable',
    env: {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      senderEmail: process.env.SENDGRID_SENDER_EMAIL || null,
      fromName: process.env.SENDGRID_FROM_NAME || null,
    },
  });
};

// POST /api/email-test/send
// Body: { to: string, subject?: string, text?: string, html?: string }
const testSend = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body || {};

    if (!to) {
      return res.status(400).json({ ok: false, error: 'Missing "to" in request body' });
    }

    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
      return res.status(500).json({
        ok: false,
        error: 'Missing SendGrid config: SENDGRID_API_KEY or SENDGRID_SENDER_EMAIL',
      });
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_SENDER_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'My App',
      },
      subject: subject || 'SendGrid Test Email',
      text: text || 'This is a simple SendGrid test email.',
      html: html || '<p>This is a <strong>SendGrid</strong> test email.</p>',
    };

    await sgMail.send(msg);

    return res.status(200).json({
      ok: true,
      message: `Email dispatched to ${to} via SendGrid`,
    });
  } catch (error) {
     console.error(`${logPrefix} Error:`, error);
     const errMsg = (error && error.message) || 'Unexpected error while sending email';
     const errDetails =
       error && error.response && error.response.body
         ? error.response.body
         : undefined;
     return res.status(500).json({
       ok: false,
       error: errMsg,
       details: errDetails,
     });
  }
};

module.exports = { ping, testSend };