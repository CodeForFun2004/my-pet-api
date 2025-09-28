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
  const session = await mongoose.startSession();
  try {
    const { clinicId, doctorId, petId, startAt, reason, channel } = req.body;
    if (!clinicId || !doctorId || !petId || !startAt) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const slotMin = doctor.scheduleTemplate?.slotDurationMin ?? 30;
    const start = new Date(startAt);
    const end = new Date(start.getTime() + slotMin * 60000);

    const customerId = req.user.id;

    await session.withTransaction(async () => {
      // Re-check conflict (maxConcurrent=1 → trùng startAt là conflict)
      const conflict = await Appointment.findOne({
        doctorId,
        startAt: start,
        status: { $in: ['PENDING','CONFIRMED','CHECKED_IN'] }
      }).session(session);
      if (conflict) throw new Error('TIME_CONFLICT');

      await Appointment.create([{
        clinicId, doctorId, customerId, petId,
        startAt: start, endAt: end,
        reason, channel: channel || 'OFFLINE',
        timeZone: 'Asia/Ho_Chi_Minh',
        status: 'CONFIRMED',
        meta: { bookedBy: req.user.role === 'customer' ? 'CUSTOMER' : 'STAFF' }
      }], { session });
    });

    res.status(201).json({ message: 'Appointment created' });
  } catch (err) {
    if (err?.message === 'TIME_CONFLICT' || err?.code === 11000) {
      return res.status(409).json({ message: 'Slot has just been taken' });
    }
    res.status(500).json({ message: 'Failed to create appointment', error: err.message });
  } finally {
    await session.endSession();
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

    // quyền đơn giản:
    // - CHECKED_IN/COMPLETED: doctor/owner/admin
    // - CANCELLED: customer trước cancelBeforeMinutes, hoặc owner/admin
    const clinic = await Clinic.findById(apm.clinicId);
    const isOwner = clinic.ownerId.toString() === req.user.id;
    const isDoctorSelf = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === apm.doctorId.toString();

    if (['CHECKED_IN','COMPLETED','NO_SHOW'].includes(status)) {
      if (!(req.user.role === 'admin' || isOwner || isDoctorSelf)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      apm.status = status;
    } else if (status === 'CANCELLED') {
      if (req.user.role === 'customer') {
        const deadline = new Date(apm.startAt.getTime() - (clinic.cancelBeforeMinutes || 120) * 60000);
        if (new Date() > deadline) return res.status(400).json({ message: 'Too late to cancel' });
        if (apm.customerId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
      } else if (!(req.user.role === 'admin' || isOwner)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      apm.status = 'CANCELLED';
      apm.cancelledAt = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    const saved = await apm.save();
    res.json({ message: 'Status updated', appointment: saved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
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
