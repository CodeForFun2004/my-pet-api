# Hướng dẫn Import Dữ liệu MongoDB

Các file JSON này chứa dữ liệu mẫu cho hệ thống đặt lịch khám thú y.

## Cấu trúc dữ liệu

### 1. users.json
- Admin user
- Clinic owner
- 6 bác sĩ (doctors)
- 2 khách hàng (customers)

### 2. clinics.json
- 2 phòng khám

### 3. doctors.json
- 6 bác sĩ với thông tin đầy đủ:
  - Nguyễn Văn Nam (25 năm kinh nghiệm)
  - Trần Hà (20 năm kinh nghiệm)
  - Cao Toàn Mỹ (15 năm kinh nghiệm)
  - Lục Văn Toán (12 năm kinh nghiệm)
  - Trần Văn Thụ (18 năm kinh nghiệm)
  - Hà Thị Phương (10 năm kinh nghiệm)

### 4. appointments.json
- 6 lịch hẹn mẫu với các trạng thái khác nhau:
  - PENDING
  - CONFIRMED
  - COMPLETED
  - CANCELLED

### 5. doctorschedules.json
- Lịch làm việc mẫu cho các bác sĩ

## Cách Import

### Sử dụng mongoimport (Command Line)

```bash
# Import Users
mongoimport --db mypet --collection users --file data/users.json --jsonArray

# Import Clinics
mongoimport --db mypet --collection clinics --file data/clinics.json --jsonArray

# Import Doctors
mongoimport --db mypet --collection doctors --file data/doctors.json --jsonArray

# Import Appointments
mongoimport --db mypet --collection appointments --file data/appointments.json --jsonArray

# Import Doctor Schedules
mongoimport --db mypet --collection doctorschedules --file data/doctorschedules.json --jsonArray
```

### Sử dụng MongoDB Compass

1. Mở MongoDB Compass
2. Chọn database của bạn
3. Với mỗi collection:
   - Click vào collection
   - Click "Add Data" > "Import File"
   - Chọn file JSON tương ứng
   - Click "Import"

### Sử dụng MongoDB Shell (mongosh)

```javascript
// Kết nối database
use mypet

// Import từng collection
db.users.insertMany([...]) // Copy nội dung từ users.json (bỏ $oid và $date)
db.clinics.insertMany([...])
db.doctors.insertMany([...])
db.appointments.insertMany([...])
db.doctorschedules.insertMany([...])
```

## Lưu ý

1. **Password**: Các password trong file là hash mẫu. Để test, bạn có thể:
   - Tạo user mới qua API để có password hash đúng
   - Hoặc reset password sau khi import

2. **ObjectId**: Các ObjectId đã được định nghĩa để đảm bảo các collection liên kết đúng với nhau.

3. **Dates**: Các dates sử dụng format MongoDB Extended JSON với `$date` hoặc ISO string.

4. **Thứ tự Import**: Nên import theo thứ tự:
   - users.json (trước)
   - clinics.json
   - doctors.json (sau users và clinics)
   - appointments.json (sau doctors)
   - doctorschedules.json (sau doctors)

## Test Data

Sau khi import, bạn có thể test bằng cách:

1. Login với user: `admin` / password: (cần set password mới)
2. Xem danh sách doctors: GET `/api/doctors`
3. Xem danh sách appointments: GET `/api/appointments`
4. Tạo appointment mới: POST `/api/appointments`

## Sửa đổi nếu cần

Nếu database name khác, thay `mypet` bằng tên database của bạn trong các lệnh import.

