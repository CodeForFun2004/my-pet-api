const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  clinicId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  doctorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },

  startAt:    { type: Date, required: true },
  endAt:      { type: Date, required: true },
  timeZone:   { type: String, default: 'Asia/Ho_Chi_Minh' },

  examType:   { type: String, required: false }, // 🩺 Loại khám
  note:       { type: String }, // 📝 Ghi chú thêm của khách hoặc phòng khám
  channel:    { type: String, enum: ['OFFLINE','ONLINE'], default: 'OFFLINE' },
  status:     { type: String, enum: ['PENDING','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW'], default: 'PENDING' },

  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  encounterId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Encounter' },

  meta: { bookedBy: { type: String, enum: ['CUSTOMER','STAFF'], default: 'CUSTOMER' } }
}, { timestamps: true });

// Anti-double-book cho maxConcurrent=1:
appointmentSchema.index({ doctorId: 1, startAt: 1 }, { unique: true });
// Truy vấn nhanh:
appointmentSchema.index({ clinicId: 1, startAt: 1 });
appointmentSchema.index({ customerId: 1, startAt: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
