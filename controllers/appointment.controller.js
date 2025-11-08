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

// Helper function to format appointment response for frontend
const formatAppointmentResponse = (appointment) => {
  const date = appointment.startAt ? new Date(appointment.startAt).toISOString().split('T')[0] : '';
  const time = appointment.startAt ? new Date(appointment.startAt).toTimeString().slice(0, 5) : '';
  
  // Map status từ backend sang frontend format
  const statusMap = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'CHECKED_IN': 'active',
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
    'NO_SHOW': 'cancelled'
  };
  
  // Format doctor info nếu có
  let doctor = null;
  if (appointment.doctorId) {
    if (typeof appointment.doctorId === 'object' && appointment.doctorId !== null) {
      // Đã được populate
      const doctorData = appointment.doctorId;
      const user = doctorData.userId;
      doctor = {
        id: doctorData._id?.toString() || doctorData.id,
        name: user?.fullname || `Bs ${user?.username || 'Unknown'}`,
        specialization: doctorData.specialties?.[0] || 'Thú y tổng quát',
        profileImage: user?.avatar || 'https://pngimg.com/uploads/doctor/doctor_PNG15972.png',
        experience: doctorData.experienceYears ? `${doctorData.experienceYears} năm kinh nghiệm` : 'Chưa có thông tin'
      };
    } else {
      // Chưa populate, chỉ có ID
      doctor = {
        id: appointment.doctorId.toString()
      };
    }
  }
  
  return {
    id: appointment._id.toString(),
    doctorId: appointment.doctorId?._id?.toString() || appointment.doctorId?.toString() || appointment.doctorId,
    doctor: doctor, // Thêm doctor info
    date: date,
    time: time,
    type: appointment.type || appointment.examType || '',
    status: statusMap[appointment.status] || appointment.status || 'pending',
    phone: appointment.phone || appointment.patientPhone || '',
    patientName: appointment.patientName || '',
    patientPhone: appointment.patientPhone || appointment.phone || '',
    notes: appointment.notes || appointment.note || '',
    paymentMethod: appointment.paymentMethod || 'cash',
    clinicId: appointment.clinicId?._id?.toString() || appointment.clinicId?.toString() || appointment.clinicId,
    petId: appointment.petId?._id?.toString() || appointment.petId?.toString() || appointment.petId
  };
};

// GET /api/appointments - Lấy tất cả appointments (format cho frontend)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate({
        path: 'doctorId',
        select: 'userId specialties experienceYears',
        populate: {
          path: 'userId',
          select: 'fullname username avatar'
        }
      })
      .sort({ startAt: 1 })
      .lean();
    
    const formatted = appointments.map(formatAppointmentResponse);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get appointments', error: err.message });
  }
};

// POST /api/appointments  (customer/staff)
// body: { clinicId, doctorId, petId, startAt, reason, channel }
// HOẶC format từ frontend: { doctorId, date, time, type, status, phone, patientName, patientPhone, notes, paymentMethod }

exports.createAppointment = async (req, res) => {
  try {
    const { 
      clinicId, doctorId, petId, startAt, examType, note, channel,
      // Format từ frontend
      date, time, type, status, phone, patientName, patientPhone, notes, paymentMethod
    } = req.body;

    // 🧩 Kiểm tra đầu vào
    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required' });
    }

    // Nếu có date và time (format từ frontend)
    let start, end;
    if (date && time) {
      // Tạo Date từ date (YYYY-MM-DD) và time (HH:mm)
      const dateTimeStr = `${date}T${time}:00`;
      start = new Date(dateTimeStr);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid date or time format' });
      }
    } else if (startAt) {
      start = new Date(startAt);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid startAt format' });
      }
    } else {
      return res.status(400).json({ message: 'Either (date+time) or startAt is required' });
    }

    // 🩺 Kiểm tra bác sĩ tồn tại
    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // ⏰ Tính thời gian bắt đầu - kết thúc dựa vào slot duration
    const slotMin = doctor.scheduleTemplate?.slotDurationMin ?? 30;
    end = new Date(start.getTime() + slotMin * 60000);

    const customerId = req.user?.id;

    // 🔍 Kiểm tra trùng lịch
    const conflict = await Appointment.findOne({
      doctorId,
      startAt: start,
      status: { $in: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'pending', 'confirmed', 'active'] }
    });

    if (conflict) {
      return res.status(409).json({ message: 'Slot has just been taken' });
    }

    // Map status từ frontend sang backend
    const statusMap = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'active': 'CONFIRMED',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED'
    };
    const backendStatus = statusMap[status] || status || 'PENDING';

    // 🆕 Tạo appointment mới
    const newAppointment = await Appointment.create({
      clinicId: clinicId || null,
      doctorId,
      customerId: customerId || null,
      petId: petId || null,
      startAt: start,
      endAt: end,
      examType: examType || type || '',
      type: type || examType || '',
      note: note || notes || '',
      notes: notes || note || '',
      channel: channel || 'OFFLINE',
      timeZone: 'Asia/Ho_Chi_Minh',
      status: backendStatus,
      patientName: patientName || '',
      patientPhone: patientPhone || phone || '',
      phone: phone || patientPhone || '',
      paymentMethod: paymentMethod || 'cash',
      meta: {
        bookedBy: req.user?.role === 'customer' ? 'CUSTOMER' : (req.user ? 'STAFF' : 'CUSTOMER')
      }
    });

    // Format response cho frontend
    const formatted = formatAppointmentResponse(newAppointment);
    return res.status(201).json(formatted);

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
    const apm = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        select: 'userId specialties experienceYears',
        populate: {
          path: 'userId',
          select: 'fullname username avatar'
        }
      })
      .populate('clinicId', 'name address phone')
      .lean();
    if (!apm) return res.status(404).json({ message: 'Appointment not found' });

    // scope: admin; owner của clinic; chính customer; chính doctor
    // Tạm thời bỏ qua kiểm tra quyền để tương thích với frontend
    // const clinic = apm.clinicId ? await Clinic.findById(apm.clinicId).select('ownerId') : null;
    // const isOwner = clinic && clinic.ownerId.toString() === req.user?.id;
    // const isDoctor = req.user?.role === 'doctor';
    // const isDoctorSelf = isDoctor && req.user.doctorProfileId?.toString() === apm.doctorId.toString();
    // const isCustomer = apm.customerId && apm.customerId.toString() === req.user?.id;

    // if (!(req.user?.role === 'admin' || isOwner || isDoctorSelf || isCustomer)) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    
    // Format response cho frontend
    const formatted = formatAppointmentResponse(apm);
    res.json(formatted);
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


// PATCH /api/appointments/:id - Update appointment (format cho frontend)
exports.updateAppointment = async (req, res) => {
  try {
    const apm = await Appointment.findById(req.params.id);
    if (!apm) return res.status(404).json({ message: 'Appointment not found' });

    const updates = req.body;
    
    // Update các trường
    if (updates.date && updates.time) {
      const dateTimeStr = `${updates.date}T${updates.time}:00`;
      apm.startAt = new Date(dateTimeStr);
      const slotMin = 30; // Default, có thể lấy từ doctor
      apm.endAt = new Date(apm.startAt.getTime() + slotMin * 60000);
    }
    if (updates.type !== undefined) {
      apm.type = updates.type;
      apm.examType = updates.type;
    }
    if (updates.status !== undefined) {
      const statusMap = {
        'pending': 'PENDING',
        'confirmed': 'CONFIRMED',
        'active': 'CONFIRMED',
        'completed': 'COMPLETED',
        'cancelled': 'CANCELLED'
      };
      apm.status = statusMap[updates.status] || updates.status;
    }
    if (updates.phone !== undefined) {
      apm.phone = updates.phone;
      apm.patientPhone = updates.phone;
    }
    if (updates.patientName !== undefined) apm.patientName = updates.patientName;
    if (updates.patientPhone !== undefined) {
      apm.patientPhone = updates.patientPhone;
      apm.phone = updates.patientPhone;
    }
    if (updates.notes !== undefined) {
      apm.notes = updates.notes;
      apm.note = updates.notes;
    }
    if (updates.paymentMethod !== undefined) apm.paymentMethod = updates.paymentMethod;

    const saved = await apm.save();
    const formatted = formatAppointmentResponse(saved);
    return res.json(formatted);
  } catch (err) {
    console.error('Error updating appointment:', err);
    return res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
};

// DELETE /api/appointments/:id - Xóa appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const apm = await Appointment.findById(req.params.id);
    if (!apm) return res.status(404).json({ message: 'Appointment not found' });

    await Appointment.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Appointment deleted successfully', success: true });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    return res.status(500).json({ message: 'Failed to delete appointment', error: err.message });
  }
};

// (optional) list của tôi
// GET /api/appointments/mine?role=customer|doctor
exports.listMyAppointments = async (req, res) => {
  try {
    const role = req.query.role || req.user?.role;
    let q = {};
    if (role === 'customer' && req.user?.id) q.customerId = req.user.id;
    else if (role === 'doctor' && req.user?.doctorProfileId) q.doctorId = req.user.doctorProfileId;
    else if (!req.user) {
      // Nếu không có user, trả về tất cả (để tương thích với frontend mock)
      q = {};
    } else {
      return res.status(400).json({ message: 'role is required (customer/doctor)' });
    }
    const items = await Appointment.find(q)
      .populate({
        path: 'doctorId',
        select: 'userId specialties experienceYears',
        populate: {
          path: 'userId',
          select: 'fullname username avatar'
        }
      })
      .sort({ startAt: 1 })
      .lean();
    const formatted = items.map(formatAppointmentResponse);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list appointments', error: err.message });
  }
};
