const mongoose = require('mongoose');

// Schema cho giờ làm việc trong tuần
const workingHoursSchema = new mongoose.Schema({
  daysOfWeek: [{ 
    type: Number, 
    enum: [0, 1, 2, 3, 4, 5, 6], // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    required: true 
  }],
  startTime: { 
    type: String, 
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:mm
  },
  endTime: { 
    type: String, 
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/ // Format HH:mm
  },
  is24Hours: { type: Boolean, default: false }, // Làm việc 24/24
  emergency24h: { type: Boolean, default: false } // Trực cấp cứu 24/24
}, { _id: false });

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  imgUrl: { 
    type: String, 
    trim: true,
    default: 'https://product.hstatic.net/200000731893/product/nam07651-scaled_01a414b13bde4702a49abb8c626450b5.png'
  },
  workingHours: [workingHoursSchema], // Mảng các giờ làm việc (có thể có nhiều khung giờ)
  technologyServices: { type: String, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  timeZone: { type: String, default: 'Asia/Ho_Chi_Minh' },
  // chính sách lịch hẹn
  cancelBeforeMinutes: { type: Number, default: 120 },
  noShowMarkAfterMinutes: { type: Number, default: 15 }
}, { timestamps: true });

clinicSchema.index({ name: 'text' });

module.exports = mongoose.model('Clinic', clinicSchema);
