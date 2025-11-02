const Doctor = require('../models/doctor.model');
const Clinic = require('../models/clinic.model');
const User = require('../models/user.model');
const { getAvailability } = require('../services/availability.service');

// Tạo bác sĩ: admin hoặc owner của clinic
// - Liên kết user (role 'doctor') + set user.primaryClinicId + user.doctorProfileId
exports.createDoctor = async (req, res) => {
  try {
    const { userId, clinicId, specialties, bio, experienceYears, scheduleTemplate } = req.body;
    if (!userId || !clinicId) return res.status(400).json({ message: 'userId & clinicId are required' });

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    if (req.user.role !== 'admin' && clinic.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // tạo hồ sơ bác sĩ (unique theo userId)
    const doctor = await Doctor.create({
      userId, clinicId,
      specialties: specialties || [],
      bio, experienceYears,
      scheduleTemplate: {
        slotDurationMin: scheduleTemplate?.slotDurationMin ?? 30,
        workingDays: scheduleTemplate?.workingDays,
        breakRules: scheduleTemplate?.breakRules ?? [{ start: '11:30', end: '11:50' }],
        maxConcurrent: 1
      }
    });

    // cập nhật user sang role doctor (nếu chưa), gán quan hệ
    user.role = 'doctor';
    user.primaryClinicId = clinicId;
    user.doctorProfileId = doctor._id;
    await user.save();

    res.status(201).json({ message: 'Doctor created', doctor });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({ message: 'This user already has a doctor profile' });
    }
    res.status(500).json({ message: 'Failed to create doctor', error: err.message });
  }
};

// Helper function to format doctor response for frontend
const formatDoctorResponse = async (doctor, includeSlots = false) => {
  const user = doctor.userId;
  const clinic = doctor.clinicId ? await Clinic.findById(doctor.clinicId).lean() : null;
  
  const formatted = {
    id: doctor._id.toString(),
    name: user?.fullname || `Bs ${user?.username || 'Unknown'}`,
    specialization: doctor.specialties?.[0] || 'Thú y tổng quát',
    profileImage: user?.avatar || 'https://pngimg.com/uploads/doctor/doctor_PNG15972.png',
    experience: doctor.experienceYears ? `${doctor.experienceYears} năm kinh nghiệm` : 'Chưa có thông tin',
    qualifications: doctor.specialties || [],
    skills: doctor.specialties || [],
    biography: doctor.bio || 'Chưa có thông tin',
    phone: user?.phone || clinic?.phone || '',
    address: clinic?.address || user?.address || '',
    city: clinic?.address?.split(',')?.pop()?.trim() || 'Chưa có thông tin',
    isActive: true,
  };

  // Thêm availableSlots nếu được yêu cầu
  if (includeSlots) {
    const slots = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        const availableSlots = await getAvailability(doctor._id.toString(), dateStr);
        availableSlots.forEach(slot => {
          slots.push({
            date: dateStr,
            time: slot.start,
            available: true
          });
        });
      } catch (err) {
        console.error(`Error getting availability for ${dateStr}:`, err);
      }
    }
    formatted.availableSlots = slots;
  }

  return formatted;
};

// Danh sách bác sĩ (admin: tất cả, owner: theo clinic của mình, others: 403)
exports.getDoctors = async (req, res) => {
  try {
    const { clinicId, includeSlots } = req.query;
    let query = {};
    // if (req.user.role === 'admin') {
    //   if (clinicId) query.clinicId = clinicId;
    // } else if (req.user.role === 'clinic-owner') {
    //   if (!clinicId) return res.status(400).json({ message: 'clinicId is required for owner' });
    //   const clinic = await Clinic.findById(clinicId).select('ownerId');
    //   if (!clinic || clinic.ownerId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    //   query.clinicId = clinicId;
    // } else {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const doctors = await Doctor.find(query).populate('userId', 'username fullname email phone avatar').lean();
    
    // Format cho frontend
    const formatted = await Promise.all(
      doctors.map(doc => formatDoctorResponse(doc, includeSlots === 'true'))
    );
    
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).populate('userId', 'username fullname email phone avatar').lean();
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    // quyền xem: admin; owner của clinic; chính doctor
    // if (req.user.role !== 'admin'
    //     && !(req.user.role === 'clinic-owner' && (await Clinic.findById(doc.clinicId)).ownerId.toString() === req.user.id)
    //     && !(req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === doc._id.toString())) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    
    // Format cho frontend (luôn include slots)
    const formatted = await formatDoctorResponse(doc, true);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get doctor', error: err.message });
  }
};

// Update hồ sơ cơ bản
exports.updateDoctor = async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });

    // quyền: admin hoặc owner của clinic hoặc chính doctor
    const isOwner = (await Clinic.findById(doc.clinicId)).ownerId.toString() === req.user.id;
    const isSelfDoctor = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === doc._id.toString();
    if (req.user.role !== 'admin' && !isOwner && !isSelfDoctor) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { specialties, bio, experienceYears } = req.body;
    if (specialties !== undefined) doc.specialties = specialties;
    if (bio !== undefined) doc.bio = bio;
    if (experienceYears !== undefined) doc.experienceYears = experienceYears;

    const updated = await doc.save();
    res.json({ message: 'Doctor updated', doctor: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update doctor', error: err.message });
  }
};

// Update scheduleTemplate (slot 30', break ~20', maxConcurrent=1)
exports.updateScheduleTemplate = async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });

    const isOwner = (await Clinic.findById(doc.clinicId)).ownerId.toString() === req.user.id;
    const isSelfDoctor = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === doc._id.toString();
    if (req.user.role !== 'admin' && !isOwner && !isSelfDoctor) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { slotDurationMin, workingDays, breakRules } = req.body;
    if (slotDurationMin !== undefined) doc.scheduleTemplate.slotDurationMin = slotDurationMin; // nên giữ = 30
    if (workingDays !== undefined) doc.scheduleTemplate.workingDays = workingDays;
    if (breakRules !== undefined) doc.scheduleTemplate.breakRules = breakRules;
    doc.scheduleTemplate.maxConcurrent = 1; // đảm bảo 1–1

    const updated = await doc.save();
    res.json({ message: 'Schedule template updated', doctor: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update schedule template', error: err.message });
  }
};
