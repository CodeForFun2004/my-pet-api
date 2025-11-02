const mongoose = require('mongoose');

const vaccinationRecordSchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  vaccinationDate: { type: Date, required: true },
  nextDueDate: { type: Date },
  veterinarian: { type: String, required: true },
  notes: { type: String }
}, { _id: true });

const medicalRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  veterinarian: { type: String, required: true },
  notes: { type: String }
}, { _id: true });

const petSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  species: { type: String, trim: true }, // dog/cat/bird/rabbit/hamster/fish/other
  breed: { type: String, trim: true },
  sex: { type: String, enum: ['male','female','unknown'], default: 'unknown' },
  dob: Date, // Date of birth - dùng để tính age
  weightKg: Number,
  colorMarkings: String, // Tương đương color
  notes: String,
  profileImage: { type: String },
  microchipId: { type: String },
  isActive: { type: Boolean, default: true },
  vaccinationHistory: [vaccinationRecordSchema],
  medicalHistory: [medicalRecordSchema]
}, { timestamps: true });

petSchema.index({ ownerId: 1, name: 1 });

module.exports = mongoose.model('Pet', petSchema);
