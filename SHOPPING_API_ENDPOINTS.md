# Shopping API Endpoints - Complete Documentation

## 📋 Tổng quan
API endpoints cho tính năng Shopping của hệ thống MyPet, bao gồm Products, Categories, Cart, Orders, và Coupons.

---

## 🛍️ PRODUCTS API

### 1. Lấy danh sách sản phẩm
```http
GET /api/products
```
**Access:** Public  
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 12, max: 50)
- `categoryId` (string) - Filter by category ID
- `search` (string) - Search in name, description, brand
- `minPrice` (number) - Minimum price filter
- `maxPrice` (number) - Maximum price filter
- `inStock` (boolean) - Filter in stock items only
- `sortBy` (string) - Sort by: name, price, rating, createdAt
- `sortOrder` (string) - asc or desc (default: desc)

**Response:**
```json
{
  "page": 1,
  "limit": 12,
  "total": 100,
  "totalPages": 9,
  "items": [...]
}
```

### 2. Lấy sản phẩm theo ID
```http
GET /api/products/:id
```
**Access:** Public  
**Response:** Product object with populated category and reviews

### 3. Tạo sản phẩm mới
```http
POST /api/products
```
**Access:** Admin only  
**Headers:** Authorization required  
**Body:**
```json
{
  "name": "Thức ăn hạt Canin cho chó",
  "brand": "Royal Canin",
  "price": 450000,
  "originalPrice": 520000,
  "image": "https://...",
  "description": "...",
  "category": "category_id",
  "weight": "500g",
  "weightOptions": [...],
  "colorOptions": [...],
  "sizeOptions": [...],
  "tags": ["dog", "food"],
  "inStock": true,
  "stockQuantity": 100
}
```

### 4. Cập nhật sản phẩm
```http
PUT /api/products/:id
```
**Access:** Admin only  
**Headers:** Authorization required

### 5. Xóa sản phẩm
```http
DELETE /api/products/:id
```
**Access:** Admin only  
**Headers:** Authorization required

### 6. Thêm đánh giá sản phẩm
```http
POST /api/products/:id/reviews
```
**Access:** Private (Authenticated users)  
**Headers:** Authorization required  
**Body:**
```json
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
```

---

## 📂 CATEGORIES API

### 1. Lấy tất cả danh mục
```http
GET /api/categories
```
**Access:** Public  
**Response:**
```json
{
  "categories": [
    {
      "id": "1",
      "name": "Thức Ăn",
      "slug": "thuc-an",
      "image": "https://...",
      "description": "...",
      "productCount": 24
    }
  ]
}
```

### 2. Lấy danh mục theo ID
```http
GET /api/categories/:id
```
**Access:** Public

### 3. Tạo danh mục mới
```http
POST /api/categories
```
**Access:** Admin only  
**Headers:** Authorization required  
**Body:**
```json
{
  "name": "Thức Ăn",
  "image": "https://...",
  "description": "Thức ăn dinh dưỡng cho thú cưng",
  "order": 0
}
```

### 4. Cập nhật danh mục
```http
PUT /api/categories/:id
```
**Access:** Admin only

### 5. Xóa danh mục
```http
DELETE /api/categories/:id
```
**Access:** Admin only  
**Note:** Chỉ xóa được khi category không còn sản phẩm

---

## 🛒 CART API

Tất cả cart endpoints yêu cầu authentication.

### 1. Lấy giỏ hàng của user
```http
GET /api/cart
```
**Access:** Private  
**Headers:** Authorization required  
**Response:**
```json
{
  "user": "user_id",
  "items": [
    {
      "product": {...},
      "quantity": 2,
      "price": 450000,
      "color": "Xanh",
      "size": "M",
      "weight": "500g"
    }
  ],
  "totalItems": 2,
  "totalPrice": 900000
}
```

### 2. Thêm sản phẩm vào giỏ hàng
```http
POST /api/cart/items
```
**Access:** Private  
**Body:**
```json
{
  "productId": "product_id",
  "quantity": 1,
  "color": "Xanh",
  "size": "M",
  "weight": "500g"
}
```

### 3. Cập nhật số lượng sản phẩm
```http
PUT /api/cart/items/:itemIndex
```
**Access:** Private  
**Body:**
```json
{
  "quantity": 3
}
```

### 4. Xóa sản phẩm khỏi giỏ hàng
```http
DELETE /api/cart/items/:itemIndex
```
**Access:** Private

### 5. Xóa toàn bộ giỏ hàng
```http
DELETE /api/cart
```
**Access:** Private

---

## 📦 ORDERS API

Tất cả order endpoints yêu cầu authentication.

### 1. Lấy danh sách đơn hàng của user
```http
GET /api/orders
```
**Access:** Private  
**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string) - Filter by status

**Response:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1,
  "orders": [...]
}
```

### 2. Lấy tất cả đơn hàng (Admin)
```http
GET /api/orders/all
```
**Access:** Admin only  
**Headers:** Authorization required

### 3. Lấy đơn hàng theo ID
```http
GET /api/orders/:id
```
**Access:** Private (Owner or Admin)

### 4. Tạo đơn hàng mới
```http
POST /api/orders
```
**Access:** Private  
**Body:**
```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2,
      "color": "Xanh",
      "size": "M",
      "weight": "500g"
    }
  ],
  "shippingInfo": {
    "fullName": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "nguyenvana@example.com",
    "address": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "district": "Quận 1",
    "ward": "Phường Bến Nghé",
    "notes": "Giao hàng giờ hành chính"
  },
  "shippingOption": {
    "id": "express",
    "name": "Giao hàng nhanh",
    "price": 60000,
    "description": "1-2 ngày làm việc"
  },
  "paymentMethod": "cod",
  "promoCode": "SAVE10"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "orderNumber": "ORD1234567890",
    "total": 465000,
    "status": "PENDING",
    ...
  }
}
```

### 5. Cập nhật trạng thái đơn hàng
```http
PUT /api/orders/:id/status
```
**Access:** Private/Admin  
**Body:**
```json
{
  "status": "SHIPPED"
}
```

**Status Values:**
- `PENDING` - Chờ xử lý
- `PROCESSING` - Đang xử lý
- `SHIPPED` - Đã giao hàng
- `DELIVERED` - Đã nhận hàng
- `CANCELLED` - Đã hủy

### 6. Hủy đơn hàng
```http
PUT /api/orders/:id/cancel
```
**Access:** Private  
**Note:** Chỉ hủy được đơn hàng ở trạng thái PENDING

---

## 🎟️ COUPONS API

### 1. Lấy tất cả coupon đang hoạt động
```http
GET /api/coupons
```
**Access:** Public

### 2. Lấy coupon theo code
```http
GET /api/coupons/:code
```
**Access:** Public  
**Response:**
```json
{
  "code": "SAVE10",
  "name": "Giảm 10%",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderValue": 0,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.999Z"
}
```

### 3. Áp dụng mã giảm giá
```http
POST /api/coupons/apply
```
**Access:** Private  
**Headers:** Authorization required  
**Body:**
```json
{
  "code": "SAVE10",
  "orderValue": 500000
}
```

**Response:**
```json
{
  "valid": true,
  "coupon": {...},
  "discountAmount": 50000,
  "message": "Coupon applied successfully"
}
```

### Admin Coupon Routes (Yêu cầu Admin)

### 4. Lấy tất cả coupons với thống kê
```http
GET /api/coupons/admin/all
```
**Access:** Admin only

### 5. Tạo coupon mới
```http
POST /api/coupons/admin
```
**Access:** Admin only  
**Body:**
```json
{
  "code": "SAVE10",
  "name": "Giảm 10%",
  "description": "Giảm 10% cho đơn hàng bất kỳ",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderValue": 0,
  "maxDiscountValue": 100000,
  "maxUses": 100,
  "maxUsesPerUser": 1,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.999Z",
  "applicableProducts": [],
  "applicableCategories": []
}
```

### 6. Cập nhật coupon
```http
PUT /api/coupons/admin/:id
```
**Access:** Admin only

### 7. Xóa coupon
```http
DELETE /api/coupons/admin/:id
```
**Access:** Admin only

---

## 🔐 Authentication

Tất cả các endpoint có label "Private" hoặc "Admin" yêu cầu Bearer token:

```http
Authorization: Bearer <token>
```

---

## 📝 Request/Response Examples

### Create Order Flow:
1. Browse products: `GET /api/products`
2. Add to cart: `POST /api/cart/items`
3. View cart: `GET /api/cart`
4. Apply coupon: `POST /api/coupons/apply`
5. Create order: `POST /api/orders`
6. Track order: `GET /api/orders/:id`
7. Update status: `PUT /api/orders/:id/status` (Admin)

### Admin Product Management:
1. List products: `GET /api/products`
2. Create product: `POST /api/products`
3. Update product: `PUT /api/products/:id`
4. Delete product: `DELETE /api/products/:id`

---

## ⚠️ Error Responses

**400 Bad Request:**
```json
{
  "message": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "message": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Server error message",
  "error": "Error details"
}
```

---

## 🎯 Quick Reference Table

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| GET | `/api/products` | Public | List products |
| GET | `/api/products/:id` | Public | Get product details |
| POST | `/api/products/:id/reviews` | Private | Add review |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | Public | List categories |
| GET | `/api/cart` | Private | Get user's cart |
| POST | `/api/cart/items` | Private | Add to cart |
| PUT | `/api/cart/items/:index` | Private | Update cart item |
| DELETE | `/api/cart/items/:index` | Private | Remove from cart |
| GET | `/api/orders` | Private | Get user's orders |
| POST | `/api/orders` | Private | Create order |
| PUT | `/api/orders/:id/status` | Private/Admin | Update order status |
| PUT | `/api/orders/:id/cancel` | Private | Cancel order |
| POST | `/api/coupons/apply` | Private | Apply coupon |
| GET | `/api/coupons` | Public | Get active coupons |

---

## 📊 Response Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **500** - Internal Server Error

---

**Note:** Tất cả endpoints đã được integrate vào `server.js` và sẵn sàng sử dụng.







