# Shopping API Documentation

## Overview
Hệ thống Shopping API được xây dựng dựa trên mock data từ frontend (my-pet-fe) để cung cấp các tính năng mua sắm cho thú cưng.

## Models Created

### 1. Product (`models/product.model.js`)
- Quản lý sản phẩm (thức ăn, đồ chơi, trang phục, cát vệ sinh)
- Fields: name, brand, price, originalPrice, image, description, category, rating, reviews, stock, etc.

### 2. Category (`models/category.model.js`)
- Quản lý danh mục sản phẩm
- Fields: name, slug, image, description, productCount, isActive

### 3. Cart (`models/cart.model.js`)
- Quản lý giỏ hàng của user
- Fields: user, items, totalItems, totalPrice
- Tự động tính toán tổng khi save

### 4. Order (`models/order.model.js`)
- Quản lý đơn hàng
- Fields: orderNumber, user, items, shippingInfo, shippingOption, paymentMethod, subtotal, shippingFee, discount, total, status

### 5. Coupon (`models/coupon.model.js`)
- Quản lý mã giảm giá
- Fields: code, discountType, discountValue, minOrderValue, validFrom, validUntil, usage tracking
- Methods: isValid(), calculateDiscount()

## API Endpoints

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | Get all products with filters | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/products/:id/reviews` | Add review to product | Private |

**Query Parameters for GET /api/products:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12, max: 50)
- `categoryId` - Filter by category
- `search` - Search in name, description, brand
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Filter in stock items only
- `sortBy` - Sort by: name, price, rating, createdAt
- `sortOrder` - asc or desc (default: desc)

### Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/categories` | Get all categories | Public |
| GET | `/api/categories/:id` | Get category by ID | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Cart
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/cart` | Get user's cart | Private |
| POST | `/api/cart/items` | Add item to cart | Private |
| PUT | `/api/cart/items/:itemIndex` | Update cart item quantity | Private |
| DELETE | `/api/cart/items/:itemIndex` | Remove item from cart | Private |
| DELETE | `/api/cart` | Clear cart | Private |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/orders` | Get user's orders | Private |
| GET | `/api/orders/all` | Get all orders | Admin |
| GET | `/api/orders/:id` | Get order by ID | Private |
| POST | `/api/orders` | Create new order | Private |
| PUT | `/api/orders/:id/status` | Update order status | Private/Admin |
| PUT | `/api/orders/:id/cancel` | Cancel order | Private |

**Order Status:**
- PENDING
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED

### Coupons
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/coupons` | Get all active coupons | Public |
| GET | `/api/coupons/:code` | Get coupon by code | Public |
| POST | `/api/coupons/apply` | Apply coupon code | Private |
| GET | `/api/coupons/admin/all` | Get all coupons with stats | Admin |
| POST | `/api/coupons/admin` | Create coupon | Admin |
| PUT | `/api/coupons/admin/:id` | Update coupon | Admin |
| DELETE | `/api/coupons/admin/:id` | Delete coupon | Admin |

## Features

### 1. Product Management
- Create, read, update, delete products
- Filter by category, price range, search
- Sort by name, price, rating, date
- Add reviews and ratings
- Stock management

### 2. Category Management
- Hierarchical category structure
- Product count per category
- Ordering support

### 3. Shopping Cart
- Add/remove items
- Update quantities
- Multiple product options (color, size, weight)
- Auto-calculate totals

### 4. Order Processing
- Create orders from cart
- Shipping information
- Multiple shipping options
- Payment methods (COD, bank transfer, e-wallet)
- Apply coupon codes
- Order status tracking

### 5. Coupon System
- Percentage or fixed amount discounts
- Minimum order value
- Maximum discount cap
- Usage limits (total and per user)
- Validity period
- Track coupon usage

## Middleware
- `protect` - Authentication required
- `isAdmin` - Admin only access

## Data Flow

### Shopping Flow
1. User browses products → GET /api/products
2. User views product details → GET /api/products/:id
3. User adds to cart → POST /api/cart/items
4. User views cart → GET /api/cart
5. User applies coupon → POST /api/coupons/apply
6. User creates order → POST /api/orders
7. Cart is automatically cleared after order
8. Order status updated → PUT /api/orders/:id/status

### Admin Flow
1. Admin creates products → POST /api/products
2. Admin creates categories → POST /api/categories
3. Admin creates coupons → POST /api/coupons/admin
4. Admin views all orders → GET /api/orders/all
5. Admin updates order status → PUT /api/orders/:id/status

## Notes
- All shopping routes require authentication except public product/category listing
- Product stock is automatically decremented when order is created
- Stock is restored if order is cancelled
- Cart is user-specific and managed per session
- Orders include full shipping and payment information
- Coupon validation happens before order creation







