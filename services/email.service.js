const sgMail = require('@sendgrid/mail');

const logPrefix = '[EmailService/SendGridAPI]';

// Configure SendGrid API key once at startup
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn(`${logPrefix} Missing SENDGRID_API_KEY in environment`);
}

// Helper: retry with exponential backoff
const sendEmailWithRetry = async (emailOptions, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${logPrefix} Attempt ${attempt}/${maxRetries} sending email...`);

      const fromEmail = process.env.SENDGRID_SENDER_EMAIL;
      const fromName = process.env.SENDGRID_FROM_NAME || 'My Pet';
      if (!fromEmail) {
        throw new Error('Missing SENDGRID_SENDER_EMAIL in environment');
      }

      const msg = {
        to: emailOptions.to,
        from: { email: fromEmail, name: fromName },
        subject: emailOptions.subject || 'Notification',
        text: emailOptions.text || 'You have a new message',
        html: emailOptions.html || '<p>You have a new message</p>',
      };

      const resp = await sgMail.send(msg);
      console.log(`${logPrefix} Email sent successfully`, {
        statusCode: resp?.[0]?.statusCode,
      });
      return resp?.[0];
    } catch (error) {
      console.error(`${logPrefix} Attempt ${attempt} failed:`, error?.message || error);
      if (error?.response?.body) {
        console.error(error.response.body);
      }
      if (attempt === maxRetries) throw error;
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`${logPrefix} Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

exports.sendOTPEmail = async (email, otpCode) => {
  try {
    console.log(`${logPrefix} Sending OTP email to: ${email}`);

    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
      throw new Error('Missing SendGrid config (SENDGRID_API_KEY or SENDGRID_SENDER_EMAIL)');
    }

    const emailOptions = {
      to: email,
      subject: '🐾 Kích Hoạt Tài Khoản My Pet của bạn',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #f5f8fa;">
          <div style="background-color: #2a7eab; padding: 20px; text-align: center;">
            <img src="URL_BANNER_PETS" alt="My Pet Banner" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 12px 12px 0 0;" />
          </div>
          <div style="padding: 30px; text-align: center;">
            <img src="URL_LOGO_PETS" alt="My Pet Logo" width="80" style="margin-top: -60px; border: 4px solid #fff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background-color: #fff;" />
            <h2 style="color: #2a7eab; margin-top: 20px;">Chào mừng đến với My Pet!</h2>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại My Pet. Để hoàn tất, vui lòng sử dụng mã xác nhận một lần (OTP) dưới đây để kích hoạt tài khoản của bạn.
            </p>
            <div style="margin: 30px 0;">
              <span style="font-size: 36px; letter-spacing: 4px; background-color: #e3f2fd; padding: 15px 30px; border-radius: 8px; display: inline-block; color: #1e5a80; font-weight: bold; border: 1px dashed #b3e5fc;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 14px; color: #777;">
              Mã này chỉ có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
            </p>
          </div>
          <div style="background-color: #2a7eab; padding: 15px; text-align: center; color: #fff; border-radius: 0 0 12px 12px;">
            <p style="font-size: 12px; margin: 0;">© 2025 My Pet. All rights reserved.</p>
            <p style="font-size: 12px; margin: 5px 0 0;">
              Cần hỗ trợ? Vui lòng liên hệ: <a href="mailto:dinhquochuy.2004hl@gmail.com" style="color: #fff; text-decoration: underline;">dinhquochuy.2004hl@gmail.com</a>
            </p>
          </div>
        </div>
      `,
    };

    const data = await sendEmailWithRetry(emailOptions);
    console.log(`${logPrefix} OTP email sent to ${email}:`, data?.statusCode);
    return data;
  } catch (error) {
    console.error(`${logPrefix} Error sending OTP email to ${email}:`, error?.message || error);
    throw error;
  }
};

// Gửi email OTP đặt lại mật khẩu
exports.sendResetPasswordEmail = async (email, otpCode) => {
  try {
    console.log(`${logPrefix} Sending reset password email to: ${email}`);

    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_SENDER_EMAIL) {
      throw new Error('Missing SendGrid config (SENDGRID_API_KEY or SENDGRID_SENDER_EMAIL)');
    }

    const emailOptions = {
      to: email,
      subject: '🔑 Mã Đặt Lại Mật Khẩu My Pet',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #f5f8fa;">
          <div style="background-color: #2a7eab; padding: 20px; text-align: center;">
            <img src="https://res.cloudinary.com/dgyb5zpqr/image/upload/v1758856754/banner_s9ocek.jpg" alt="My Pet Banner" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 12px 12px 0 0;" />
          </div>
          <div style="padding: 30px; text-align: center;">
            <img src="https://res.cloudinary.com/dgyb5zpqr/image/upload/v1758856331/my-pet_logo_jeercf.jpg" alt="My Pet Logo" width="80" style="margin-top: -60px; border: 4px solid #fff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background-color: #fff;" />
            <h2 style="color: #2a7eab; margin-top: 20px;">Yêu Cầu Đặt Lại Mật Khẩu</h2>
            <p style="font-size: 16px; color: #444; line-height: 1.6;">
              Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản My Pet của bạn. Vui lòng sử dụng mã xác nhận một lần (OTP) dưới đây để tiếp tục.
            </p>
            <div style="margin: 30px 0;">
              <span style="font-size: 36px; letter-spacing: 4px; background-color: #e3f2fd; padding: 15px 30px; border-radius: 8px; display: inline-block; color: #1e5a80; font-weight: bold; border: 1px dashed #b3e5fc;">
                ${otpCode}
              </span>
            </div>
            <p style="font-size: 14px; color: #777;">
              Mã này chỉ có hiệu lực trong <strong>5 phút</strong>. Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này.
            </p>
          </div>
          <div style="background-color: #2a7eab; padding: 15px; text-align: center; color: #fff; border-radius: 0 0 12px 12px;">
            <p style="font-size: 12px; margin: 0;">© 2025 My Pet. All rights reserved.</p>
            <p style="font-size: 12px; margin: 5px 0 0;">
              Cần hỗ trợ? Vui lòng liên hệ: <a href="mailto:dinhquochuy.2004hl@gmail.com" style="color: #fff; text-decoration: underline;">dinhquochuy.2004hl@gmail.com</a>
            </p>
          </div>
        </div>
      `,
    };

    const data = await sendEmailWithRetry(emailOptions);
    console.log(`${logPrefix} Reset password email sent to ${email}:`, data?.statusCode);
    return data;
  } catch (error) {
    console.error(`${logPrefix} Error sending reset password email to ${email}:`, error?.message || error);
    throw error;
  }
};