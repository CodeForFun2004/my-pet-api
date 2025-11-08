const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const passport = require('passport');

const connectDB = require('./config/database');  // 🔧 Đường dẫn DB

dotenv.config();
connectDB();
require('./config/passport');  // import sau dotenv.config()

const userRoutes = require('./routes/user.routes')
const passwordRoutes = require('./routes/password.routes');
const clinicRoutes = require('./routes/clinic.routes');
const doctorRoutes = require('./routes/doctor.routes');
const petRoutes = require('./routes/pet.routes');
const doctorScheduleRoutes = require('./routes/doctorSchedule.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const encounterRoutes = require('./routes/encounter.routes');
const sendgridRoutes = require('./routes/sendgrid.routes');

// Shopping routes
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const couponRoutes = require('./routes/coupon.routes');






const app = express();
// Configure CORS explicitly
app.use(cors({
  origin: ['http://localhost:5173', 'http://10.0.2.2:8080', 'http://10.0.2.2', 'https://my-pet-fe.vercel.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Thêm dòng này nếu FE gửi cookie/session
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());




// users routes
// ✅ Cách đúng: Test API trả về chuỗi "Hello World"
app.get('/', (req, res) => {
  res.send('✅ My Pet say Hiiii!');
});

const authRoutes = require('./routes/auth.routes');   // authRoutes phải gọi sau .env
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/doctor-schedules', doctorScheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/email-test', sendgridRoutes);

// Shopping routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);




const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () =>{
   console.log(`🚀 HHHHHHH Server running on http://localhost:${PORT}`)
});

