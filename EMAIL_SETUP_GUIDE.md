# Hướng dẫn cấu hình Email cho Production

## Vấn đề Connection Timeout

Lỗi "Connection timeout" khi deploy thường xảy ra vì:

1. **Gmail SMTP bị chặn** trên một số hosting platform
2. **Cấu hình SMTP không phù hợp** với môi trường production
3. **Thiếu biến môi trường** hoặc cấu hình sai

## Giải pháp đã áp dụng

### 1. Cấu hình SMTP linh hoạt
- **Development**: Sử dụng Gmail service (như cũ)
- **Production**: Sử dụng SMTP trực tiếp với cấu hình tối ưu

### 2. Cơ chế Retry
- Thử lại 3 lần với exponential backoff
- Tạo transporter mới cho mỗi lần thử
- Logging chi tiết để debug

### 3. Error Handling tốt hơn
- Phân loại lỗi cụ thể
- Xóa dữ liệu tạm khi gửi email thất bại
- Trả về message phù hợp cho user

## Cấu hình biến môi trường

### Cho Development (.env.local)
```env
NODE_ENV=development
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Cho Production
```env
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Lưu ý**: Render tự động set `RENDER=true`, nên không cần set thêm biến này.

## Tạo App Password cho Gmail

1. Vào Google Account Settings
2. Security → 2-Step Verification (bật nếu chưa có)
3. App passwords → Generate new password
4. Chọn "Mail" và "Other (custom name)"
5. Copy password và dùng làm EMAIL_PASS

## Các hosting platform khuyến nghị

### 1. Heroku
```bash
heroku config:set NODE_ENV=production
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

### 2. Vercel
```bash
vercel env add NODE_ENV
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
```

### 3. Railway
Thêm vào Railway dashboard:
- NODE_ENV=production
- EMAIL_USER=your-email@gmail.com
- EMAIL_PASS=your-app-password

### 4. Render
Render tự động set `RENDER=true`, chỉ cần thêm:
- NODE_ENV=production (optional, vì RENDER=true đã đủ)
- EMAIL_USER=your-email@gmail.com
- EMAIL_PASS=your-app-password

## Kiểm tra sau khi deploy

1. **Xem logs**:
   ```bash
   # Heroku
   heroku logs --tail
   
   # Vercel
   vercel logs
   ```

2. **Test endpoint**:
   ```bash
   curl -X POST https://your-api.com/api/auth/register-request \
     -H "Content-Type: application/json" \
     -d '{"fullname":"Test","username":"test","email":"test@example.com","password":"123456"}'
   ```

3. **Kiểm tra response**:
   - Thành công: `200` với message
   - Lỗi email: `503` với EMAIL_SERVICE_UNAVAILABLE
   - Lỗi config: `500` với EMAIL_CONFIG_ERROR

## Troubleshooting

### Nếu vẫn bị timeout:
1. Kiểm tra firewall của hosting platform
2. Thử sử dụng SMTP khác (SendGrid, Mailgun)
3. Kiểm tra IP có bị Gmail block không

### Nếu không nhận được email:
1. Kiểm tra Spam folder
2. Kiểm tra App Password có đúng không
3. Kiểm tra 2FA đã bật chưa

## Alternative: Sử dụng Email Service khác

Nếu Gmail vẫn không hoạt động, có thể dùng:

### SendGrid
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Mailgun
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS
  }
});
```
