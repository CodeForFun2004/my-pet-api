const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
      try {
      token = req.headers.authorization.split(' ')[1];
      // Sử dụng ACCESS_TOKEN_SECRET, fallback về JWT_SECRET nếu không có
      const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ message: 'Lỗi cấu hình server: thiếu JWT secret' });
      }
      const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  } else {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  }
};

const isAdminOrClinicOwner = (req, res, next) => {
    const role = req.user?.role;
    if (role === 'admin' || role === 'clinic-owner') {
        return next();
    } else {
        return res.status(403).json({ message: 'Truy cập bị từ chối: Chỉ dành cho Admin hoặc Chủ phòng khám' });
    }
};

// ✅ NEW: Kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối: chỉ dành cho admin' });
  }
};

const isClinicOwner = (req, res, next) => {
  if (req.user && req.user.role === 'clinic-owner') {
    return next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối: chỉ dành cho clinic-owner' });
  }
};

const isDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    return next();
  } else {
    return res.status(403).json({ message: 'Truy cập bị từ chối: chỉ dành cho doctor' });
  }
};  

module.exports = { protect, isAdmin, isClinicOwner, isDoctor, isAdminOrClinicOwner };
