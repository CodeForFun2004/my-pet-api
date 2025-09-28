const DoctorSchedule = require('../models/doctorSchedule.model');
const Doctor = require('../models/doctor.model');
const Clinic = require('../models/clinic.model');

async function canManageDoctor(reqUser, doctor) {
  if (reqUser.role === 'admin') return true;
  if (reqUser.role === 'doctor' && reqUser.doctorProfileId?.toString() === doctor._id.toString()) return true;
  const clinic = await Clinic.findById(doctor.clinicId).select('ownerId');
  return reqUser.role === 'clinic-owner' && clinic && clinic.ownerId.toString() === reqUser.id;
}

// PUT /api/doctor-schedules/:doctorId/:date
exports.upsertOverride = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (!await canManageDoctor(req.user, doctor)) return res.status(403).json({ message: 'Forbidden' });

    const { overrides, status } = req.body; // { workingBlocks, breakBlocks, slotDurationMin, maxConcurrent }
    const doc = await DoctorSchedule.findOneAndUpdate(
      { doctorId, date },
      { $set: { overrides, status: status || 'OPEN' } },
      { upsert: true, new: true }
    );
    res.json({ message: 'Override saved', schedule: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upsert override', error: err.message });
  }
};

// GET /api/doctor-schedules/:doctorId?from=&to=
exports.listOverrides = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!await canManageDoctor(req.user, doctor)) return res.status(403).json({ message: 'Forbidden' });

    const { from, to } = req.query; // optional
    const q = { doctorId };
    if (from && to) q.date = { $gte: from, $lte: to };
    const items = await DoctorSchedule.find(q).sort({ date: 1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list overrides', error: err.message });
  }
};

// DELETE /api/doctor-schedules/:doctorId/:date
exports.deleteOverride = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!await canManageDoctor(req.user, doctor)) return res.status(403).json({ message: 'Forbidden' });

    await DoctorSchedule.findOneAndDelete({ doctorId, date });
    res.json({ message: 'Override deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete override', error: err.message });
  }
};
