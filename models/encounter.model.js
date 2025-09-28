const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema({
  clinicId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  doctorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  petId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },

  vitals:   { tempC: Number, weightKg: Number, heartRate: Number, respRate: Number },
  symptoms: String,
  diagnosis:String,
  plan:     String,
  prescriptions: [{ drug: String, dose: Number, unit: String, frequency: String, durationDays: Number, note: String }],
  attachments:   [{ url: String, type: String, caption: String }],

  status:   { type: String, enum: ['DRAFT','SIGNED'], default: 'DRAFT' },
  signedAt: Date,
  signedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  revisions: [{ at: Date, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, changes: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

encounterSchema.index({ petId: 1, createdAt: -1 });

module.exports = mongoose.model('Encounter', encounterSchema);
