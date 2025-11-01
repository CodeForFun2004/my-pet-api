exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'Vui lòng chọn ít nhất một ảnh' 
      });
    }

    const urls = req.files.map(file => 
      `${req.protocol}://${req.get('host')}/uploads/doctor-ai/${file.filename}`
    );

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ 
      message: 'Không thể tải ảnh lên' 
    });
  }
};