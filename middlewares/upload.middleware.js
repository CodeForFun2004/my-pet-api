const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/**
 * Middleware upload ảnh lên Cloudinary.
 * - Hỗ trợ folderPrefix là string HOẶC function(fieldname) -> string.
 * - Tự lấy folderName từ model/nameField hoặc req.body[nameField] (fallback).
 */
const createUploadMiddleware = ({
  folderPrefix,               // string | (fieldname) => string
  nameField,
  model = null,
  allowedFormats = ["jpg", "jpeg", "png", "webp"],
  transformation = [{ width: 500, height: 500, crop: "limit" }],
}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      // 1) Tính baseFolder từ folderPrefix
      const baseFolder =
        typeof folderPrefix === "function"
          ? folderPrefix(file.fieldname) || "uploads"
          : (folderPrefix || "uploads");

      // 2) Tìm folderName (tên riêng theo user/document)
      let folderName = "unknown";
      try {
        // Ưu tiên lấy từ DB dựa trên :id (update)
        if (model && req.params?.id) {
          const doc = await model.findById(req.params.id).lean();
          if (doc && doc[nameField]) folderName = String(doc[nameField]);
        } else if (req.body && req.body[nameField]) {
          folderName = String(req.body[nameField]);
        }
      } catch (err) {
        console.warn("[Upload Middleware] Warning:", err.message);
      }

      // 3) Chuẩn hoá folderName
      folderName = folderName.toString().trim().replace(/\s+/g, "-").toLowerCase();

      // 4) public_id duy nhất & params Cloudinary
      const ts = Date.now();
      return {
        folder: `${baseFolder}/${folderName}`,     // ✅ đã gọi function
        allowed_formats: allowedFormats,
        transformation,
        public_id: `${folderName}-${file.fieldname}-${ts}`,
        resource_type: "image",                    // an toàn cho ảnh
      };
    },
  });

  // KHÔNG gọi .single() / .fields() ở đây — trả về instance để route tự chọn
  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(file.mimetype.toLowerCase());
      if (extname) {
        return cb(null, true);
      }
      cb(new Error("Chỉ hỗ trợ file JPG hoặc PNG"));
    },
  });
};

const createUploadMiddlewareForStore = ({
  folderPrefix,
  nameField,
  model = null,
  allowedFormats = ["jpg", "png", "jpeg"],
  transformation = [{ width: 500, height: 500, crop: "limit" }],
}) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let folderName = "unknown";

      try {
        // Nếu có user đăng nhập (protect đã gán req.user)
        if (req.user && req.user.id) {
          folderName = req.user.id;
        }
        // Ưu tiên req.params.id nếu có (cho update)
        else if (model && req.params?.id) {
          const doc = await model.findById(req.params.id).lean();
          if (doc?.[nameField]) {
            folderName = doc[nameField];
          }
        }
        // Nếu không có id (tạo mới), dùng req.body[nameField]
        else if (req.body && req.body[nameField]) {
          folderName = req.body[nameField];
        } else {
          console.warn(
            `[Upload Middleware] ${nameField} not found in req.body`
          );
          folderName = `unnamed-${Date.now()}`; // Fallback an toàn
        }
      } catch (err) {
        console.error("[Upload Middleware] Error:", err.message);
        folderName = `error-${Date.now()}`; // Fallback nếu có lỗi
      }

      folderName = folderName
        .toString()
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();

      return {
        folder: `${folderPrefix}/${folderName}`,
        allowed_formats: allowedFormats,
        transformation,
        public_id: `${folderName}-${Date.now()}`, // Đảm bảo public_id duy nhất
      };
    },
  });

  return multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(file.mimetype.toLowerCase());
      if (extname) {
        return cb(null, true);
      }
      cb(new Error("Chỉ hỗ trợ file JPG hoặc PNG"));
    },
  });
};

module.exports = createUploadMiddleware;
