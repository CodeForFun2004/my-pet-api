const Encounter = require('../models/encounter.model');
const Appointment = require('../models/appointment.model');
const Clinic = require('../models/clinic.model');

// Auto tạo khi check-in (hoặc tạo thủ công)
exports.createEncounter = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId is required' });

    const apm = await Appointment.findById(appointmentId);
    if (!apm) return res.status(404).json({ message: 'Appointment not found' });

    // quyền: doctor điều trị / owner / admin
    const clinic = await Clinic.findById(apm.clinicId).select('ownerId');
    const isOwner = clinic.ownerId.toString() === req.user.id;
    const isDoctorSelf = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === apm.doctorId.toString();
    if (!(req.user.role === 'admin' || isOwner || isDoctorSelf)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // upsert: nếu đã có thì trả về
    let enc = await Encounter.findOne({ appointmentId: apm._id });
    if (!enc) {
      enc = await Encounter.create({
        clinicId: apm.clinicId,
        doctorId: apm.doctorId,
        petId: apm.petId,
        appointmentId: apm._id,
        status: 'DRAFT'
      });
      // link vào appointment
      apm.encounterId = enc._id;
      await apm.save();
    }
    res.status(201).json({ message: 'Encounter created', encounter: enc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create encounter', error: err.message });
  }
};

// PATCH /api/encounters/:id  (DOCTOR) — chỉ khi DRAFT
exports.updateEncounter = async (req, res) => {
  try {
    const enc = await Encounter.findById(req.params.id);
    if (!enc) return res.status(404).json({ message: 'Encounter not found' });
    if (enc.status !== 'DRAFT') return res.status(400).json({ message: 'SIGNED encounter cannot be edited' });

    // quyền: bác sĩ điều trị / owner / admin
    const isDoctorSelf = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === enc.doctorId.toString();
    const clinic = await Clinic.findById(enc.clinicId).select('ownerId');
    const isOwner = clinic.ownerId.toString() === req.user.id;
    if (!(req.user.role === 'admin' || isOwner || isDoctorSelf)) return res.status(403).json({ message: 'Forbidden' });

    const allowed = ['vitals','symptoms','diagnosis','plan','prescriptions','attachments'];
    for (const k of allowed) if (req.body[k] !== undefined) enc[k] = req.body[k];
    enc.revisions.push({ at: new Date(), by: req.user.id, changes: req.body });

    const updated = await enc.save();
    res.json({ message: 'Encounter updated', encounter: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update encounter', error: err.message });
  }
};

// POST /api/encounters/:id/sign  (DOCTOR)
exports.signEncounter = async (req, res) => {
  try {
    const enc = await Encounter.findById(req.params.id);
    if (!enc) return res.status(404).json({ message: 'Encounter not found' });

    const isDoctorSelf = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === enc.doctorId.toString();
    if (!(req.user.role === 'admin' || isDoctorSelf)) return res.status(403).json({ message: 'Forbidden' });

    enc.status = 'SIGNED';
    enc.signedAt = new Date();
    enc.signedBy = req.user.id;
    await enc.save();

    res.json({ message: 'Encounter signed', encounter: enc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to sign encounter', error: err.message });
  }
};

// GET /api/encounters/:id
exports.getEncounterById = async (req, res) => {
  try {
    const enc = await Encounter.findById(req.params.id).lean();
    if (!enc) return res.status(404).json({ message: 'Encounter not found' });

    // quyền xem: admin; owner clinic; bác sĩ điều trị; chủ pet (read-only)
    const apm = await Appointment.findById(enc.appointmentId).select('customerId');
    const clinic = await Clinic.findById(enc.clinicId).select('ownerId');
    const isOwner = clinic.ownerId.toString() === req.user.id;
    const isDoctorSelf = req.user.role === 'doctor' && req.user.doctorProfileId?.toString() === enc.doctorId.toString();
    const isCustomer = apm && apm.customerId.toString() === req.user.id;

    if (!(req.user.role === 'admin' || isOwner || isDoctorSelf || isCustomer)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(enc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get encounter', error: err.message });
  }
};

// GET /api/pets/:petId/encounters (customer xem lịch sử)
exports.listEncountersByPet = async (req, res) => {
  try {
    const petId = req.params.petId;
    const items = await Encounter.find({ petId }).sort({ createdAt: -1 }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list encounters', error: err.message });
  }
};
