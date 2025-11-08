# Database Information - MyPet API

## 📍 Database Location

### MongoDB Atlas (Cloud - Production)
**Hiện tại đang sử dụng:**

```
mongodb+srv://huydqds180257:knvqmEdkbPIBFnPd@backenddb.n2u4owd.mongodb.net/my_pet?retryWrites=true&w=majority&appName=BackendDB
```

**Database Name:** `my_pet`

**Cluster Location:** BackendDB on MongoDB Atlas

---

## 🗂️ Database Structure

### Collections Hiện Có:

#### 1. **users** - Người dùng
- Thông tin user, authentication
- Roles: customer, admin, clinic-owner, doctor

#### 2. **clinics** - Phòng khám
- Thông tin phòng khám, địa chỉ

#### 3. **doctors** - Bác sĩ
- Thông tin bác sĩ, chuyên khoa

#### 4. **pets** - Thú cưng
- Thông tin thú cưng của user

#### 5. **appointments** - Lịch hẹn
- Lịch hẹn khám bệnh

#### 6. **doctorschedules** - Lịch làm việc
- Lịch làm việc của bác sĩ

#### 7. **encounters** - Phiên khám
- Lịch sử khám bệnh

#### 8. **pendingusers** - User chờ xác nhận
- User đăng ký chờ xác nhận email

#### 9. **otps** - Mã OTP
- Mã xác thực OTP

---

## 🆕 Collections Shopping (Vừa Tạo):

#### 10. **products** - Sản phẩm
```javascript
{
  name, brand, price, originalPrice,
  image, description, category,
  rating, reviewCount, stock,
  weightOptions, colorOptions, sizeOptions
}
```

#### 11. **categories** - Danh mục
```javascript
{
  name, slug, image, description,
  productCount, isActive, order
}
```

#### 12. **carts** - Giỏ hàng
```javascript
{
  user, items[], totalItems, totalPrice
}
```

#### 13. **orders** - Đơn hàng
```javascript
{
  orderNumber, user, items[],
  shippingInfo, shippingOption,
  paymentMethod, subtotal,
  shippingFee, discount, total,
  status, promoCode
}
```

#### 14. **coupons** - Mã giảm giá
```javascript
{
  code, name, description,
  discountType, discountValue,
  minOrderValue, maxDiscountValue,
  maxUses, maxUsesPerUser,
  validFrom, validUntil,
  usageCount, usedBy[]
}
```

---

## 🔧 Configuration

### Database Connection
File: `config/database.js`

```javascript
const connectDB = async () => {
   try {
      await mongoose.connect(
        "mongodb+srv://huydqds180257:knvqmEdkbPIBFnPd@backenddb.n2u4owd.mongodb.net/my_pet?retryWrites=true&w=majority&appName=BackendDB"
      );
      console.log('MongoDB connected successfully');
   } catch (err) {
      console.error('Error connecting MongoDB:', err.message);
      process.exit(1);
   }
};
```

---

## 📊 Database Statistics

### Total Collections: 14

**Existing (7):**
- users
- clinics
- doctors
- pets
- appointments
- doctorschedules
- encounters
- pendingusers
- otps

**New Shopping Collections (5):**
- products
- categories
- carts
- orders
- coupons

---

## 🚀 Local Development (Optional)

Nếu muốn dùng MongoDB local thay vì Atlas:

### 1. Install MongoDB locally
```bash
# Windows
Download from: https://www.mongodb.com/try/download/community

# hoặc dùng Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Update environment variable
Create `.env` file:
```env
MONGO_URL=mongodb://localhost:27017/my_pet
PORT=8080
JWT_SECRET=your-secret-key
```

### 3. Update database.js
```javascript
const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017/my_pet";
await mongoose.connect(mongoURL);
```

---

## 🌐 MongoDB Atlas Management

### Access Cluster:
- **URL:** https://cloud.mongodb.com/
- **Cluster:** BackendDB
- **Database:** my_pet

### Connection String:
```
mongodb+srv://huydqds180257:*****@backenddb.n2u4owd.mongodb.net/my_pet
```

### Collections trong my_pet database:
- users
- clinics  
- doctors
- pets
- appointments
- doctorschedules
- encounters
- pendingusers
- otps
- **products** (new)
- **categories** (new)
- **carts** (new)
- **orders** (new)
- **coupons** (new)

---

## 📝 Database Indexes

### Users
- username (unique)
- email (unique, sparse)
- role (index)

### Products
- category (index)
- name, description (text search)
- price (index)
- rating (index)
- createdAt (index)

### Orders
- orderNumber (unique, index)
- user + createdAt (compound index)
- status (index)

### Coupons
- code (unique, index)
- isActive (index)
- validFrom, validUntil (index)

---

## 🔍 Query Examples

### View all products
```javascript
db.products.find()
```

### View orders by user
```javascript
db.orders.find({ user: ObjectId("user_id") })
```

### View active coupons
```javascript
db.coupons.find({ 
  isActive: true,
  validFrom: { $lte: new Date() },
  validUntil: { $gte: new Date() }
})
```

---

## 📞 Database Management

### Current Setup:
- **Provider:** MongoDB Atlas (Cloud)
- **Region:** AWS (MongoDB Atlas default)
- **Instance Type:** Free tier (M0)
- **Connection:** mongodb+srv (secure)

### Backup:
MongoDB Atlas automatically backs up:
- Daily automated backups
- Point-in-time recovery available

---

## ✅ Summary

**Database Type:** MongoDB (NoSQL)  
**Location:** MongoDB Atlas Cloud  
**Database Name:** my_pet  
**Total Collections:** 14  
**Shopping Collections:** 5 (newly created)

**Collections Order:**
1. users
2. clinics
3. doctors
4. pets
5. appointments
6. doctorschedules
7. encounters
8. pendingusers
9. otps
10. products ←
11. categories ←
12. carts ←
13. orders ←
14. coupons ←

All shopping data is stored in the **my_pet** database on MongoDB Atlas.







