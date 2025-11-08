# Shopping API - MyPet

## 📦 Tính năng Shopping hoàn chỉnh cho hệ thống MyPet

### ✅ Đã hoàn thành

#### 📁 Models (5 files)
- ✅ `models/product.model.js` - Quản lý sản phẩm
- ✅ `models/category.model.js` - Quản lý danh mục
- ✅ `models/cart.model.js` - Quản lý giỏ hàng
- ✅ `models/order.model.js` - Quản lý đơn hàng
- ✅ `models/coupon.model.js` - Quản lý mã giảm giá

#### 🎮 Controllers (5 files)
- ✅ `controllers/product.controller.js` - CRUD sản phẩm + reviews
- ✅ `controllers/category.controller.js` - CRUD danh mục
- ✅ `controllers/cart.controller.js` - Quản lý giỏ hàng
- ✅ `controllers/order.controller.js` - Xử lý đơn hàng
- ✅ `controllers/coupon.controller.js` - Quản lý mã giảm giá

#### 🛣️ Routes (5 files)
- ✅ `routes/product.routes.js`
- ✅ `routes/category.routes.js`
- ✅ `routes/cart.routes.js`
- ✅ `routes/order.routes.js`
- ✅ `routes/coupon.routes.js`

#### 📝 Documentation (3 files)
- ✅ `SHOPPING_API_ENDPOINTS.md` - Chi tiết tất cả endpoints
- ✅ `API_ENDPOINTS_QUICK_REFERENCE.md` - Tham khảo nhanh
- ✅ `SHOPPING_API_POSTMAN_COLLECTION.json` - Postman collection

---

## 🚀 Quick Start

### 1. Đã integrate vào server.js
```javascript
// Shopping routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
```

### 2. API Endpoints Summary

**Products:**
- GET `/api/products` - Danh sách sản phẩm
- GET `/api/products/:id` - Chi tiết sản phẩm
- POST `/api/products/:id/reviews` - Thêm đánh giá
- POST `/api/products` - Tạo sản phẩm (Admin)
- PUT `/api/products/:id` - Cập nhật (Admin)
- DELETE `/api/products/:id` - Xóa (Admin)

**Categories:**
- GET `/api/categories` - Danh sách
- POST `/api/categories` - Tạo (Admin)

**Cart:**
- GET `/api/cart` - Xem giỏ hàng
- POST `/api/cart/items` - Thêm vào giỏ
- PUT `/api/cart/items/:index` - Cập nhật
- DELETE `/api/cart/items/:index` - Xóa
- DELETE `/api/cart` - Xóa toàn bộ

**Orders:**
- GET `/api/orders` - Đơn hàng của user
- POST `/api/orders` - Tạo đơn hàng
- GET `/api/orders/:id` - Chi tiết đơn hàng
- PUT `/api/orders/:id/status` - Cập nhật trạng thái

**Coupons:**
- GET `/api/coupons` - Danh sách coupon
- POST `/api/coupons/apply` - Áp dụng mã
- GET `/api/coupons/admin/all` - Tất cả (Admin)
- POST `/api/coupons/admin` - Tạo (Admin)

---

## 📊 Tính năng chính

### 1. Product Management
- ✅ CRUD đầy đủ
- ✅ Filter theo category, price, search
- ✅ Sort by name, price, rating, date
- ✅ Stock management
- ✅ Reviews & ratings

### 2. Shopping Cart
- ✅ Add/Remove items
- ✅ Update quantities
- ✅ Multiple options (color, size, weight)
- ✅ Auto-calculate totals

### 3. Order Processing
- ✅ Create from cart
- ✅ Shipping info
- ✅ Multiple shipping options
- ✅ Payment methods (COD, bank, e-wallet)
- ✅ Apply coupons
- ✅ Order status tracking

### 4. Coupon System
- ✅ Percentage/Fixed discounts
- ✅ Min order value
- ✅ Usage limits
- ✅ Validity period
- ✅ Track usage

---

## 🔐 Authentication

### Public Endpoints
- GET `/api/products`
- GET `/api/categories`
- GET `/api/coupons`

### Private Endpoints (Bearer Token)
- Tất cả `/api/cart/*`
- Tất cả `/api/orders/*`
- POST `/api/coupons/apply`

### Admin Only (Bearer Token + Admin Role)
- Tất cả POST/PUT/DELETE `/api/products/*`
- Tất cả `/api/categories/*` (POST/PUT/DELETE)
- GET `/api/orders/all`
- Tất cả `/api/coupons/admin/*`

---

## 📝 Example Usage

### 1. User Flow
```
1. GET /api/products → Browse products
2. GET /api/products/:id → View details
3. POST /api/cart/items → Add to cart
4. GET /api/cart → View cart
5. POST /api/coupons/apply → Apply coupon
6. POST /api/orders → Create order
7. GET /api/orders → Track orders
```

### 2. Admin Flow
```
1. POST /api/products → Create product
2. POST /api/categories → Create category
3. POST /api/coupons/admin → Create coupon
4. GET /api/orders/all → View all orders
5. PUT /api/orders/:id/status → Update status
```

---

## 🔧 Configuration

### Environment Variables
No additional environment variables needed. Uses existing:
- MongoDB connection
- JWT authentication
- CORS settings

### Middleware
- `protect` - Authentication middleware (user routes)
- `isAdmin` - Admin verification middleware (admin routes)

---

## 📈 Data Models

### Product
```javascript
{
  name, brand, price, originalPrice,
  image, description, category,
  rating, reviewCount, stock,
  weightOptions, colorOptions, sizeOptions
}
```

### Cart
```javascript
{
  user, items[], totalItems, totalPrice
}
```

### Order
```javascript
{
  orderNumber, user, items[],
  shippingInfo, shippingOption,
  paymentMethod, subtotal,
  shippingFee, discount, total,
  status, promoCode
}
```

### Coupon
```javascript
{
  code, name, discountType,
  discountValue, minOrderValue,
  maxUses, validFrom, validUntil,
  usageCount, usedBy[]
}
```

---

## 🧪 Testing

### Postman Collection
Import file `SHOPPING_API_POSTMAN_COLLECTION.json` vào Postman

### Variables cần set:
- `baseUrl`: http://localhost:8080
- `userToken`: JWT token của user
- `adminToken`: JWT token của admin

### Test Cases
1. ✅ Browse products (Public)
2. ✅ Add to cart (Private)
3. ✅ Apply coupon (Private)
4. ✅ Create order (Private)
5. ✅ Admin create product (Admin)
6. ✅ Admin create coupon (Admin)

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `SHOPPING_API_ENDPOINTS.md` | Chi tiết tất cả endpoints |
| `API_ENDPOINTS_QUICK_REFERENCE.md` | Tham khảo nhanh |
| `SHOPPING_API_POSTMAN_COLLECTION.json` | Postman collection |
| `SHOPPING_API_README.md` | File này |

---

## ✨ Next Steps

### Suggested Improvements
1. Add image upload for products
2. Add product variants management
3. Add order tracking integration
4. Add payment gateway integration
5. Add email notifications
6. Add inventory alerts

---

## 📞 Support

Các endpoint đã sẵn sàng sử dụng. Import Postman collection để test.

**Base URL:** `http://localhost:8080`

**Authentication:** Bearer token trong header
```
Authorization: Bearer <your_jwt_token>
```







