// controllers/user.controller.js
const User = require('../models/user.model');
const { ROLES } = require('../models/user.model');
const Clinic = require('../models/clinic.model'); // Đảm bảo bạn đã import mô hình Clinic

// @desc    Get all users (optional: ?page=&limit=&role=)
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role && ROLES.includes(req.query.role)) {
      query.role = req.query.role;
    }

    const [items, total] = await Promise.all([
      User.find(query).select('-password -refreshToken -googleId').skip(skip).limit(limit).lean(),
      User.countDocuments(query)
    ]);

    res.status(200).json({ page, limit, total, items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// @desc    Create new user (Admin only) — user tự đăng ký ở auth, admin có thể tạo/sửa role
// @route   POST /api/users
// @access  Admin
exports.createUser = async (req, res) => {
  try {
    const {
      username, fullname, email, password,
      phone, role, address, primaryClinicId, clinicsOwned,
      googleId, avatar
    } = req.body;

    const normUsername = username?.toLowerCase().trim();
    const normEmail = email?.toLowerCase().trim();

    // duplicate checks
    if (normUsername) {
      const dupU = await User.findOne({ username: normUsername });
      if (dupU) return res.status(400).json({ message: 'Username already exists' });
    }
    if (normEmail) {
      const dupE = await User.findOne({ email: normEmail });
      if (dupE) return res.status(400).json({ message: 'Email already exists' });
    }

    // backward-compat: nếu FE vẫn gửi storeId thì map sang primaryClinicId
    const resolvedPrimaryClinicId = primaryClinicId || req.body.storeId || null;

    const user = new User({
      username: normUsername,
      fullname,
      email: normEmail,
      phone,
      role: ROLES.includes(role) ? role : 'customer',
      address,
      primaryClinicId: resolvedPrimaryClinicId,
      clinicsOwned: Array.isArray(clinicsOwned) ? clinicsOwned : [],
      googleId,
      avatar
    });

    // set plain password; pre('save') sẽ hash
    if (password) user.password = password;

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return res.status(400).json({ message: `Duplicate ${field}` });
    }
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin or same user
// Đảm bảo bạn đã import mô hình Clinic

exports.getUserById = async (req, res) => {
  try {
    // 1. Tìm người dùng
    let user = await User.findById(req.params.id).select(
      '-password -refreshToken -googleId'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2. Kiểm tra phân quyền (giữ nguyên logic ban đầu)
    // Nếu không phải admin VÀ không phải chính chủ -> chặn
    if (
      req.user?.role !== 'admin' &&
      req.user?.id?.toString() !== user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 3. Populate thông tin phòng khám dựa trên vai trò
    if (user.role === 'clinic-owner') {
      // Dùng .populate() cho mảng 'clinicsOwned'
      user = await user.populate({
        path: 'clinicsOwned',
        select: 'name address phone timeZone', // Chỉ lấy các trường cần thiết
      });
    } else if (user.role === 'doctor') {
      // Dùng .populate() cho ObjectId đơn 'primaryClinicId'
      user = await user.populate({
        path: 'primaryClinicId',
        select: 'name address phone timeZone', // Chỉ lấy các trường cần thiết
      });
    }

    // 4. Trả về kết quả
    res.json(user);
  } catch (err) {
    // Xử lý lỗi
    console.error(err);
    res.status(500).json({ message: 'Failed to get user', error: err.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin or same user
exports.updateUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.id?.toString() === targetId;
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Forbidden' });

    const {
      fullname, phone, address, avatar, email, password,
      // admin-only
      role, clinicsOwned, primaryClinicId, doctorProfileId,
      isBanned, banReason, banExpires
    } = req.body;

    // self-edit fields
    if (fullname !== undefined) user.fullname = fullname;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;
    if (email !== undefined) user.email = email?.toLowerCase().trim();
    if (password) user.password = password; // set plain; pre('save') sẽ hash

    // admin-only edits
    if (isAdmin) {
      if (role && ROLES.includes(role)) user.role = role;
      if (clinicsOwned !== undefined) user.clinicsOwned = Array.isArray(clinicsOwned) ? clinicsOwned : [];
      if (primaryClinicId !== undefined) user.primaryClinicId = primaryClinicId || null;
      if (doctorProfileId !== undefined) user.doctorProfileId = doctorProfileId || null;
      if (isBanned !== undefined) user.isBanned = !!isBanned;
      if (banReason !== undefined) user.banReason = banReason ?? null;
      if (banExpires !== undefined) user.banExpires = banExpires ?? null;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    if (err && err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return res.status(400).json({ message: `Duplicate ${field}` });
    }
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// @desc    Update user avatar only (Cloudinary-compatible)
// @route   PUT /api/users/:id/avatar
// @access  Admin or same user
exports.updateUserAvatar = async (req, res) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.id?.toString() === targetId;
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Forbidden' });

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    // (tuỳ chọn) xoá ảnh cũ trên Cloudinary – giữ nguyên logic của bạn
    if (user.avatar) {
      try {
        const cloudinary = require('../config/cloudinary');
        const match = user.avatar.match(/\/([^\/]+)\.(jpg|jpeg|png|webp)$/i);
        if (match) {
          const publicId = match[1];
          await cloudinary.uploader.destroy(`my-pet/avatars/users/${publicId}`);
        }
      } catch (e) {
        console.warn('Không thể xóa avatar cũ trên Cloudinary:', e.message);
      }
    }

    user.avatar = req.file.path;
    const updated = await user.save();

    res.json({
      message: 'User avatar updated successfully',
      user: updated
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user avatar', error: err.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const user = await User.findById(req.user.id).select('-password -refreshToken -googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get current user', error: err.message });
  }
};

// @desc    Filter users by role
// @route   GET /api/users/filter?role=doctor
// @access  Admin
exports.filterUsersByRole = async (req, res) => {
  try {
    const role = (req.query.role || '').toString();
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const users = await User.find({ role }).select('-password -refreshToken -googleId');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
