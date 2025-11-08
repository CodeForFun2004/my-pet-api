// models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['customer', 'admin', 'clinic-owner', 'doctor'];

const userSchema = new mongoose.Schema(
  {
    // Identity
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    fullname: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    backgroundImg : { type: String },
    introduction: { type: String },
    workAt: { type: String },
    studyAt: { type: String },
    studiedAt: { type: String },
    liveAt: { type: String },
    from: { type: String },
    address: { type: String },

    // Auth
    password: { type: String }, // hashed
    googleId: { type: String },
    refreshToken: { type: String },

    // Roles & relations
    role: { type: String, enum: ROLES, default: 'customer', index: true },
    clinicsOwned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: [] }], // for clinic-owner
    primaryClinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', default: null }, // for doctor/staff
    doctorProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null }, // for doctor

    // Moderation
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: null },
    banExpires: { type: Date, default: null }
  },
  { timestamps: true }
);

// ---------- Indexes ----------
// userSchema.index({ email: 1 }, { unique: true, sparse: true });
// userSchema.index({ username: 1 }, { unique: true });
// userSchema.index({ role: 1 });
// userSchema.index({ primaryClinicId: 1 });

// ---------- Hooks ----------
userSchema.pre('save', async function (next) {
  try {
    // normalize
    if (this.isModified('email') && this.email) this.email = this.email.toLowerCase().trim();
    if (this.isModified('username') && this.username) this.username = this.username.toLowerCase().trim();

    // hash password nếu thay đổi (đừng hash tay ở controller để tránh double-hash)
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ---------- Methods ----------
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Ẩn trường nhạy cảm khi trả JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshToken;
  delete obj.googleId;
  return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
module.exports.ROLES = ROLES;
