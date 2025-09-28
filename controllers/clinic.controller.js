const Clinic = require('../models/clinic.model');
const User = require('../models/user.model');

// Admin hoặc clinic-owner tạo clinic
exports.createClinic = async (req, res) => {
  try {
    const { name, address, phone, timeZone, cancelBeforeMinutes, noShowMarkAfterMinutes, ownerId } = req.body;
    const resolvedOwnerId = (req.user.role === 'clinic-owner') ? req.user.id : (ownerId || req.user.id);
    console.log('Resolved Owner ID:', resolvedOwnerId);

    if (!name) return res.status(400).json({ message: 'name is required' });

    // 1. TẠO CLINIC
    const clinic = await Clinic.create({
      name, address, phone,
      ownerId: resolvedOwnerId,
      timeZone: timeZone || 'Asia/Ho_Chi_Minh',
      cancelBeforeMinutes: cancelBeforeMinutes ?? 120,
      noShowMarkAfterMinutes: noShowMarkAfterMinutes ?? 15
    });

    // 2. CẬP NHẬT NGƯỢC VÀO USER (Bước bổ sung)
    await User.findByIdAndUpdate(
        resolvedOwnerId,
        { $push: { clinicsOwned: clinic._id } },
        { new: true, runValidators: true }
    );
    // (Lưu ý: Bạn phải import User model vào controller này)

    res.status(201).json({ message: 'Clinic created', clinic });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create clinic', error: err.message });
  }
};

// Admin: xem tất cả; Owner: xem clinic của mình
exports.getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().lean();
    res.json({ items: clinics });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clinics', error: err.message });
  }
};

exports.getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).lean();
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    // if (req.user.role !== 'admin' && clinic.ownerId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get clinic', error: err.message });
  }
};

exports.updateClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    if (req.user.role !== 'admin' && clinic.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, address, phone, timeZone, cancelBeforeMinutes, noShowMarkAfterMinutes } = req.body;
    if (name !== undefined) clinic.name = name;
    if (address !== undefined) clinic.address = address;
    if (phone !== undefined) clinic.phone = phone;
    if (timeZone !== undefined) clinic.timeZone = timeZone;
    if (cancelBeforeMinutes !== undefined) clinic.cancelBeforeMinutes = cancelBeforeMinutes;
    if (noShowMarkAfterMinutes !== undefined) clinic.noShowMarkAfterMinutes = noShowMarkAfterMinutes;

    const updated = await clinic.save();
    res.json({ message: 'Clinic updated', clinic: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update clinic', error: err.message });
  }
};

exports.deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    if (req.user.role !== 'admin' && clinic.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await clinic.deleteOne();
    res.json({ message: 'Clinic deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete clinic', error: err.message });
  }
};
