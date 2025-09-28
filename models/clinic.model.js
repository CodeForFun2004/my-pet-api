const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  phone: { type: String, trim: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  timeZone: { type: String, default: 'Asia/Ho_Chi_Minh' },
  // chính sách lịch hẹn
  cancelBeforeMinutes: { type: Number, default: 120 },
  noShowMarkAfterMinutes: { type: Number, default: 15 }
}, { timestamps: true });

clinicSchema.index({ name: 'text' });

module.exports = mongoose.model('Clinic', clinicSchema);
