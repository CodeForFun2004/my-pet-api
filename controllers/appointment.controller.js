const mongoose = require('mongoose');
const Appointment = require('../models/appointment.model');
const Doctor = require('../models/doctor.model');
const Clinic = require('../models/clinic.model');
const { getAvailability } = require('../services/availability.service');

// GET /api/appointments/doctors/:id/availability?date=YYYY-MM-DD
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Missing date' });
    const slots = await getAvailability(doctorId, date);
    res.json({ date, slots });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get availability', error: err.message });
  }
};

// POST /api/appointments  (customer/staff)
// body: { clinicId, doctorId, petId, startAt, reason, channel }

exports.createAppointment = async (req, res) => {
  try {
    const { clinicId, doctorId, petId, startAt, examType, note, channel } = req.body;

    // 🧩 Kiểm tra đầu vào
    if (!clinicId || !doctorId || !petId || !startAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🩺 Kiểm tra bác sĩ tồn tại
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // ⏰ Tính thời gian bắt đầu - kết thúc dựa vào slot duration
    const slotMin = doctor.scheduleTemplate?.slotDurationMin ?? 30;
    const start = new Date(startAt);
    const end = new Date(start.getTime() + slotMin * 60000);

    const customerId = req.user.id;

    // 🔍 Kiểm tra trùng lịch
    const conflict = await Appointment.findOne({
      doctorId,
      startAt: start,
      status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] }
    });

    if (conflict) {
      return res.status(409).json({ message: 'Slot has just been taken' });
    }

    // 🆕 Tạo appointment mới ở trạng thái PENDING
    await Appointment.create({
      clinicId,
      doctorId,
      customerId,
      petId,
      startAt: start,
      endAt: end,
      examType, // 🩺 loại khám
      note,     // 📝 ghi chú
      channel: channel || 'OFFLINE',
      timeZone: 'Asia/Ho_Chi_Minh',
      status: 'PENDING', // 👈 chờ phòng khám xác nhận
      meta: {
        bookedBy: req.user.role === 'customer' ? 'CUSTOMER' : 'STAFF'
      }
    });

    return res.status(201).json({
      message: 'Appointment created and pending confirmation'
    });

  } catch (err) {
    console.error('Error creating appointment:', err);
    return res.status(500).json({
      message: 'Failed to create appointment',
      error: err.message
    });
  }
};




// GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const apm = await Appointment.findById(req.params.id).lean();
    if (!apm) return res.status(404).json({ message: 'Appointment not found' });

    // scope: admin; owner của clinic; chính customer; chính doctor
    const clinic = await Clinic.findById(apm.clinicId).select('ownerId');
    const isOwner = clinic && clinic.ownerId.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor';
    const isDoctorSelf = isDoctor && req.user.doctorProfileId?.toString() === apm.doctorId.toString();
    const isCustomer = apm.customerId.toString() === req.user.id;

    if (!(req.user.role === 'admin' || isOwner || isDoctorSelf || isCustomer)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(apm);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get appointment', error: err.message });
  }
};

// PATCH /api/appointments/:id/status   body: { status }
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const apm = await Appointment.findById(req.params.id);
    if (!apm) return res.status(404).json({ message: 'Appointment not found' });

    const clinic = await Clinic.findById(apm.clinicId);
    const isOwner = clinic.ownerId.toString() === req.user.id;
    const isDoctorSelf = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === apm.doctorId.toString();

    // ✅ Phòng khám xác nhận lịch
    if (status === 'CONFIRMED') {
      if (!(req.user.role === 'admin' || isOwner)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      apm.status = 'CONFIRMED';
    }

    // 🏥 Bác sĩ hoặc chủ phòng khám cập nhật trạng thái khám
    else if (['CHECKED_IN','COMPLETED','NO_SHOW'].includes(status)) {
      if (!(req.user.role === 'admin' || isOwner || isDoctorSelf)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      apm.status = status;
    }

    // ❌ Hủy lịch
    else if (status === 'CANCELLED') {
      if (req.user.role === 'customer') {
        const deadline = new Date(apm.startAt.getTime() - (clinic.cancelBeforeMinutes || 120) * 60000);
        if (new Date() > deadline)
          return res.status(400).json({ message: 'Too late to cancel' });
        if (apm.customerId.toString() !== req.user.id)
          return res.status(403).json({ message: 'Forbidden' });
      } else if (!(req.user.role === 'admin' || isOwner)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      apm.status = 'CANCELLED';
      apm.cancelledAt = new Date();
    }

    // 🚫 Không hợp lệ
    else {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    const saved = await apm.save();
    return res.json({ message: 'Status updated', appointment: saved });

  } catch (err) {
    console.error('Error updating appointment status:', err);
    return res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};


// (optional) list của tôi
// GET /api/appointments/mine?role=customer|doctor
exports.listMyAppointments = async (req, res) => {
  try {
    const role = req.query.role || req.user.role;
    let q = {};
    if (role === 'customer') q.customerId = req.user.id;
    else if (role === 'doctor') q.doctorId = req.user.doctorProfileId;
    else return res.status(400).json({ message: 'role is required (customer/doctor)' });
    const items = await Appointment.find(q).sort({ startAt: 1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list appointments', error: err.message });
  }
};
