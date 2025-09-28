const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true, index: true },
  specialties: [String],
  bio: String,
  experienceYears: Number,
  // lịch mẫu cho on-the-fly (30' + break ~20')
  scheduleTemplate: {
    slotDurationMin: { type: Number, default: 30 },
    workingDays: {
      type: Object,
      default: {
        mon: [{ start: '08:00', end: '11:30' }, { start: '13:30', end: '17:00' }],
        tue: [{ start: '08:00', end: '11:30' }, { start: '13:30', end: '17:00' }],
        wed: [{ start: '08:00', end: '11:30' }, { start: '13:30', end: '17:00' }],
        thu: [{ start: '08:00', end: '11:30' }, { start: '13:30', end: '17:00' }],
        fri: [{ start: '08:00', end: '11:30' }, { start: '13:30', end: '17:00' }]
      }
    },
    breakRules: { type: Array, default: [{ start: '11:30', end: '11:50' }] },
    maxConcurrent: { type: Number, default: 1 } // 1–1
  }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
