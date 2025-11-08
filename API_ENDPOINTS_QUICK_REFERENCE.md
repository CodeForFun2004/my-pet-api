# Shopping API - Quick Reference

## 📋 Tất cả Endpoints

### 🛍️ PRODUCTS
```
GET    /api/products              - Danh sách sản phẩm (Public)
GET    /api/products/:id          - Chi tiết sản phẩm (Public)
POST   /api/products/:id/reviews  - Thêm đánh giá (Private)
POST   /api/products              - Tạo sản phẩm (Admin)
PUT    /api/products/:id          - Cập nhật sản phẩm (Admin)
DELETE /api/products/:id         - Xóa sản phẩm (Admin)
```

### 📂 CATEGORIES
```
GET    /api/categories          - Danh sách danh mục (Public)
GET    /api/categories/:id      - Chi tiết danh mục (Public)
POST   /api/categories          - Tạo danh mục (Admin)
PUT    /api/categories/:id      - Cập nhật danh mục (Admin)
DELETE /api/categories/:id     - Xóa danh mục (Admin)
```

### 🛒 CART
```
GET    /api/cart                 - Xem giỏ hàng (Private)
POST   /api/cart/items           - Thêm vào giỏ (Private)
PUT    /api/cart/items/:index    - Cập nhật số lượng (Private)
DELETE /api/cart/items/:index    - Xóa khỏi giỏ (Private)
DELETE /api/cart                 - Xóa toàn bộ giỏ (Private)
```

### 📦 ORDERS
```
GET    /api/orders              - Đơn hàng của user (Private)
GET    /api/orders/all          - Tất cả đơn hàng (Admin)
GET    /api/orders/:id          - Chi tiết đơn hàng (Private)
POST   /api/orders              - Tạo đơn hàng (Private)
PUT    /api/orders/:id/status   - Cập nhật trạng thái (Private/Admin)
PUT    /api/orders/:id/cancel   - Hủy đơn hàng (Private)
```

### 🎟️ COUPONS
```
GET    /api/coupons             - Danh sách coupon (Public)
GET    /api/coupons/:code      - Chi tiết coupon (Public)
POST   /api/coupons/apply      - Áp dụng mã giảm giá (Private)

# Admin Coupon Routes
GET    /api/coupons/admin/all  - Tất cả coupons (Admin)
POST   /api/coupons/admin      - Tạo coupon (Admin)
PUT    /api/coupons/admin/:id  - Cập nhật coupon (Admin)
DELETE /api/coupons/admin/:id - Xóa coupon (Admin)
```

---

## 🔐 Access Levels

- **Public**: Không cần authentication
- **Private**: Cần Bearer token authentication
- **Admin**: Cần Bearer token + role = admin

---

## 📝 Request Examples

### Add to Cart (POST /api/cart/items)
```json
{
  "productId": "64f5e8d9...",
  "quantity": 2,
  "color": "Xanh",
  "size": "M",
  "weight": "500g"
}
```

### Create Order (POST /api/orders)
```json
{
  "items": [
    {
      "productId": "64f5e8d9...",
      "quantity": 2,
      "color": "Xanh",
      "size": "M"
    }
  ],
  "shippingInfo": {
    "fullName": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "test@example.com",
    "address": "123 ABC",
    "city": "HCM",
    "district": "Q1",
    "ward": "Phường 1"
  },
  "shippingOption": {
    "id": "express",
    "name": "Giao nhanh",
    "price": 60000,
    "description": "1-2 ngày"
  },
  "paymentMethod": "cod",
  "promoCode": "SAVE10"
}
```

### Apply Coupon (POST /api/coupons/apply)
```json
{
  "code": "SAVE10",
  "orderValue": 500000
}
```

---

## 🎯 Order Status Values

- `PENDING` - Chờ xử lý
- `PROCESSING` - Đang xử lý  
- `SHIPPED` - Đã giao hàng
- `DELIVERED` - Đã nhận hàng
- `CANCELLED` - Đã hủy

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error







