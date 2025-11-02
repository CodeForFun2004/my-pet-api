# Import Data - Simple Format (Copy vào MongoDB Shell)

## 1. Import Users

```javascript
db.users.insertMany([
  {
    "_id": ObjectId("507f1f77bcf86cd799439011"),
    "username": "admin",
    "fullname": "Admin User",
    "email": "admin@mypet.com",
    "phone": "+84-123-456-789",
    "role": "admin",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439012"),
    "username": "clinicowner1",
    "fullname": "Chủ Phòng Khám 1",
    "email": "owner1@mypet.com",
    "phone": "+84-987-654-321",
    "role": "clinic-owner",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439021"),
    "username": "drnguyenvannam",
    "fullname": "Nguyễn Văn Nam",
    "email": "dr.nam@mypet.com",
    "phone": "+123-456-7890",
    "avatar": "https://tse2.mm.bing.net/th/id/OIP.EBs96VuSZqY6_HsuZGzl-gHaJ7?rs=1&pid=ImgDetMain&o=7&rm=3",
    "address": "03 Hoàng Văn Thụ, Phường Phước Ninh, Quận Hải Châu",
    "role": "doctor",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "doctorProfileId": ObjectId("507f1f77bcf86cd799439031"),
    "primaryClinicId": ObjectId("507f1f77bcf86cd799439041"),
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439022"),
    "username": "drtranha",
    "fullname": "Trần Hà",
    "email": "dr.ha@mypet.com",
    "phone": "+123-456-7891",
    "avatar": "https://pngimg.com/uploads/doctor/doctor_PNG15972.png",
    "address": "123 Pet Care Street, District 1",
    "role": "doctor",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "doctorProfileId": ObjectId("507f1f77bcf86cd799439032"),
    "primaryClinicId": ObjectId("507f1f77bcf86cd799439041"),
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439023"),
    "username": "drcaotoanmy",
    "fullname": "Cao Toàn Mỹ",
    "email": "dr.my@mypet.com",
    "phone": "+123-456-7892",
    "avatar": "https://img.lovepik.com/free-png/20211111/lovepik-geriatric-doctor-png-image_400886089_wh1200.png",
    "address": "456 Animal Health Ave, District 3",
    "role": "doctor",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "doctorProfileId": ObjectId("507f1f77bcf86cd799439033"),
    "primaryClinicId": ObjectId("507f1f77bcf86cd799439041"),
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439024"),
    "username": "drlucvantoan",
    "fullname": "Lục Văn Toán",
    "email": "dr.toan@mypet.com",
    "phone": "+123-456-7893",
    "avatar": "https://th.bing.com/th/id/R.4cbfea86866276883fefa13b493dc12c?rik=xjn7Zt0II7i4%2bw&pid=ImgRaw&r=0",
    "address": "789 Skin Care Blvd, District 7",
    "role": "doctor",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "doctorProfileId": ObjectId("507f1f77bcf86cd799439034"),
    "primaryClinicId": ObjectId("507f1f77bcf86cd799439041"),
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439025"),
    "username": "drtranvanthu",
    "fullname": "Trần Văn Thụ",
    "email": "dr.thu@mypet.com",
    "phone": "+123-456-7894",
    "avatar": "https://tse2.mm.bing.net/th/id/OIP.e6p1im3Na7_g1Cl_IA54YwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
    "address": "321 Emergency Lane, District 2",
    "role": "doctor",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "doctorProfileId": ObjectId("507f1f77bcf86cd799439035"),
    "primaryClinicId": ObjectId("507f1f77bcf86cd799439041"),
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439026"),
    "username": "drhathiphuong",
    "fullname": "Hà Thị Phương",
    "email": "dr.phuong@mypet.com",
    "phone": "+123-456-7895",
    "avatar": "https://watermark.lovepik.com/photo/20211208/large/lovepik-young-female-doctor-image-picture_501673088.jpg",
    "address": "654 Behavior Street, District 4",
    "role": "doctor",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "doctorProfileId": ObjectId("507f1f77bcf86cd799439036"),
    "primaryClinicId": ObjectId("507f1f77bcf86cd799439041"),
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439051"),
    "username": "customer1",
    "fullname": "John Doe",
    "email": "customer1@mypet.com",
    "phone": "+123-456-7890",
    "role": "customer",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439052"),
    "username": "customer2",
    "fullname": "Jane Smith",
    "email": "customer2@mypet.com",
    "phone": "+123-456-7891",
    "role": "customer",
    "password": "$2a$10$rO8vJ0jX5QzK5QzK5QzK5OeXxXxXxXxXxXxXxXxXxXxXxXxX",
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  }
])
```

## 2. Import Clinics

```javascript
db.clinics.insertMany([
  {
    "_id": ObjectId("507f1f77bcf86cd799439041"),
    "name": "Phòng Khám Thú Y My Pet",
    "address": "03 Hoàng Văn Thụ, Phường Phước Ninh, Quận Hải Châu, Thành phố Đà Nẵng",
    "phone": "+84-236-123-456",
    "ownerId": ObjectId("507f1f77bcf86cd799439012"),
    "timeZone": "Asia/Ho_Chi_Minh",
    "cancelBeforeMinutes": 120,
    "noShowMarkAfterMinutes": 15,
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439042"),
    "name": "Phòng Khám Thú Y Hồ Chí Minh",
    "address": "123 Pet Care Street, District 1, Ho Chi Minh City",
    "phone": "+84-28-123-456",
    "ownerId": ObjectId("507f1f77bcf86cd799439012"),
    "timeZone": "Asia/Ho_Chi_Minh",
    "cancelBeforeMinutes": 120,
    "noShowMarkAfterMinutes": 15,
    "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
    "updatedAt": ISODate("2024-01-01T00:00:00.000Z")
  }
])
```

## Lưu ý

- File JSON trong thư mục `data/` sử dụng MongoDB Extended JSON format (`$oid`, `$date`) và có thể import trực tiếp bằng `mongoimport`
- File này cung cấp format để copy vào MongoDB Shell hoặc Compass
- Để xem đầy đủ data cho Doctors, Appointments, DoctorSchedules, xem các file JSON tương ứng trong thư mục `data/`

