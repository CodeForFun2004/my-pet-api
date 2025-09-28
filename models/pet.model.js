const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  species: { type: String, trim: true }, // dog/cat/...
  breed: { type: String, trim: true },
  sex: { type: String, enum: ['male','female','unknown'], default: 'unknown' },
  dob: Date,
  weightKg: Number,
  colorMarkings: String,
  notes: String
}, { timestamps: true });

petSchema.index({ ownerId: 1, name: 1 });

module.exports = mongoose.model('Pet', petSchema);
