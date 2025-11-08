const Clinic = require('../models/clinic.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');

// Admin hoặc clinic-owner tạo clinic
exports.createClinic = async (req, res) => {
  try {
    const { name, address, phone, imgUrl, workingHours, technologyServices, timeZone, cancelBeforeMinutes, noShowMarkAfterMinutes, ownerId } = req.body;
    const resolvedOwnerId = (req.user.role === 'clinic-owner') ? req.user.id : (ownerId || req.user.id);
    console.log('Resolved Owner ID:', resolvedOwnerId);

    if (!name) return res.status(400).json({ message: 'name is required' });

    // 1. TẠO CLINIC
    const clinic = await Clinic.create({
      name, address, phone, imgUrl, workingHours, technologyServices,
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
    const clinics = await Clinic.find()
      .select('name address phone imgUrl workingHours technologyServices ownerId timeZone cancelBeforeMinutes noShowMarkAfterMinutes createdAt updatedAt')
      .populate('ownerId', 'name email')
      .lean();
    res.json({ items: clinics });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clinics', error: err.message });
  }
};

exports.getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id)
      .select('name address phone imgUrl workingHours technologyServices ownerId timeZone cancelBeforeMinutes noShowMarkAfterMinutes createdAt updatedAt')
      .populate('ownerId', 'name email')
      .lean();
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    // if (req.user.role !== 'admin' && clinic.ownerId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    // Lấy danh sách bác sĩ của clinic này
    const doctors = await Doctor.find({ clinicId: req.params.id })
      .populate('userId', 'username fullname email phone avatar')
      .lean();

    // Format doctors giống như trong doctor.controller.js
    const { getAvailability } = require('../services/availability.service');
    const formatDoctorResponse = async (doctor) => {
      const user = doctor.userId;
      const clinicData = await Clinic.findById(doctor.clinicId).lean();
      
      return {
        id: doctor._id.toString(),
        name: user?.fullname || `Bs ${user?.username || 'Unknown'}`,
        specialization: doctor.specialties?.[0] || 'Thú y tổng quát',
        profileImage: user?.avatar || 'https://pngimg.com/uploads/doctor/doctor_PNG15972.png',
        experience: doctor.experienceYears ? `${doctor.experienceYears} năm kinh nghiệm` : 'Chưa có thông tin',
        qualifications: doctor.specialties || [],
        skills: doctor.specialties || [],
        biography: doctor.bio || 'Chưa có thông tin',
        phone: user?.phone || clinicData?.phone || '',
        address: clinicData?.address || user?.address || '',
        city: clinicData?.address?.split(',')?.pop()?.trim() || 'Chưa có thông tin',
        isActive: true,
      };
    };

    const formattedDoctors = await Promise.all(doctors.map(doc => formatDoctorResponse(doc)));

    res.json({ ...clinic, doctors: formattedDoctors });
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

    const { name, address, phone, imgUrl, workingHours, technologyServices, timeZone, cancelBeforeMinutes, noShowMarkAfterMinutes } = req.body;
    if (name !== undefined) clinic.name = name;
    if (address !== undefined) clinic.address = address;
    if (phone !== undefined) clinic.phone = phone;
    if (imgUrl !== undefined) clinic.imgUrl = imgUrl;
    if (workingHours !== undefined) clinic.workingHours = workingHours;
    if (technologyServices !== undefined) clinic.technologyServices = technologyServices;
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
