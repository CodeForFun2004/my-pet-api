const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // hoặc SMTP khác
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (email, otpCode) => {
  await transporter.sendMail({
    from: `"My Pet" <${process.env.EMAIL_USER}>`,
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
    `
  });
};
  
// Gửi email OTP đặt lại mật khẩu
exports.sendResetPasswordEmail = async (email, otpCode) => {
  await transporter.sendMail({
    from: `"My Pet" <${process.env.EMAIL_USER}>`,
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
    `
  });
};
  