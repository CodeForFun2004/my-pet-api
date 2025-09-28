const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date:     { type: String, required: true }, // 'YYYY-MM-DD'
  overrides: {
    workingBlocks: [{ start: String, end: String }],
    breakBlocks:   [{ start: String, end: String }],
    slotDurationMin: Number,     // nếu không set → dùng template của Doctor
    maxConcurrent:  Number       // nếu không set → dùng template của Doctor (mặc định = 1)
  },
  status:   { type: String, enum: ['OPEN','CLOSED','HOLIDAY'], default: 'OPEN' }
}, { timestamps: true });

doctorScheduleSchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
