// routes/user.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  filterUsersByRole,
  updateUserAvatar
} = require('../controllers/user.controller');

const { protect, isAdmin } = require('../middlewares/auth.middleware');

// Upload (Cloudinary multer adapter của bạn)
const upload = require('../middlewares/upload.middleware');
const User = require('../models/user.model');
const uploadUserAvatar = upload({
  folderPrefix: 'my-pet/avatars/users',
  model: User,
  nameField: 'username'
});

const uploadUserFiles = upload({
  folderPrefix: (fieldname) => {
    if (fieldname === 'avatar') return 'my-pet/avatars/users';
    if (fieldname === 'backgroundImg') return 'my-pet/backgrounds/users';
    return 'my-pet/users';
  },
  model: User,
  nameField: 'username'
});


/**
 * Lưu ý:
 * - CHỈ import những handler thực sự tồn tại.
 * - KHÔNG gọi handler (không có dấu ()), chỉ truyền tham chiếu function.
 * - Đặt route cụ thể ( /me, /filter, /:id/avatar ) TRƯỚC route động ( /:id ).
 */

// GET /api/users  (Admin) - danh sách người dùng có phân trang (?page=&limit=&role=)
router.get('/', protect, isAdmin, getAllUsers);

// POST /api/users  (Admin) - tạo user (khác với flow self-register ở auth)
router.post('/', protect, isAdmin, createUser);

// GET /api/users/me  (Private) - lấy user hiện tại
router.get('/me', protect, getCurrentUser);

// GET /api/users/filter?role=doctor  (Admin) - lọc theo role
router.get('/filter', protect, isAdmin, filterUsersByRole);

// PUT /api/users/:id/avatar  (Private: admin hoặc chính chủ) - cập nhật avatar
// router.put('/:id/avatar', protect, uploadUserAvatar.single('avatar'), updateUserAvatar);

// GET /api/users/:id  (Private: admin hoặc chính chủ) - xem chi tiết user
router.get('/:id', protect, getUserById);

// PUT /api/users/:id  (Private: admin hoặc chính chủ) - cập nhật user (controller tự guard)
router.put(
  '/:id',
  protect,
  uploadUserFiles.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'backgroundImg', maxCount: 1 }
  ]),
  (req, res, next) => {
  console.log('---UpdateUser incoming---');
  console.log('params.id =', req.params.id);
  console.log('content-type =', req.headers['content-type']);
  console.log('body =', req.body);
  console.log('files =', JSON.stringify(req.files, null, 2));
  console.log('FILE (single) =', req.file); // <— thêm dòng này
  next();
},
  updateUser
);

// DELETE /api/users/:id  (Admin) - xoá user
router.delete('/:id', protect, isAdmin, deleteUser);

router.post(
  '/_diag/multipart',
  uploadUserFiles.any(),
  (req, res) => {
    console.log('DIAG FILES', req.files);
    res.json({ ok: true, files: req.files });
  }
);

module.exports = router;
