const Doctor = require('../models/doctor.model');
const DoctorSchedule = require('../models/doctorSchedule.model');
const Appointment = require('../models/appointment.model');

const DOW = ['sun','mon','tue','wed','thu','fri','sat'];
const toMinutes = s => { const [h,m] = s.split(':').map(Number); return h*60+m; };
const fromMinutes = x => `${String(Math.floor(x/60)).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`;

function dayKey(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return DOW[d.getUTCDay()];
}
function genSlots(blocks, slotMin){
  const out=[];
  for(const b of (blocks||[])){
    let cur=toMinutes(b.start), end=toMinutes(b.end);
    while(cur+slotMin<=end){ out.push({start:fromMinutes(cur),end:fromMinutes(cur+slotMin)}); cur+=slotMin; }
  }
  return out;
}
function subtractBreaks(slots, breaks){
  if(!breaks?.length) return slots;
  return slots.filter(s=>{
    const sS=toMinutes(s.start), sE=toMinutes(s.end);
    return !breaks.some(br=>{ const bS=toMinutes(br.start), bE=toMinutes(br.end); return !(sE<=bS || sS>=bE); });
  });
}

exports.getAvailability = async (doctorId, dateStr) => {
  const doc = await Doctor.findById(doctorId).lean();
  if(!doc) throw new Error('DOCTOR_NOT_FOUND');

  const ov = await DoctorSchedule.findOne({ doctorId, date: dateStr }).lean();
  if((ov?.status||'OPEN')!=='OPEN') return [];

  const dow = dayKey(dateStr);
  const slotMin = ov?.overrides?.slotDurationMin ?? doc.scheduleTemplate?.slotDurationMin ?? 30;
  const workingBlocks = ov?.overrides?.workingBlocks ?? doc.scheduleTemplate?.workingDays?.[dow] ?? [];
  const breakBlocks   = ov?.overrides?.breakBlocks   ?? doc.scheduleTemplate?.breakRules ?? [];

  let slots = genSlots(workingBlocks, slotMin);
  slots = subtractBreaks(slots, breakBlocks);

  // appointments đang chiếm slot
  const startDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endDay   = new Date(`${dateStr}T23:59:59.999Z`);
  const taken = await Appointment.find({
    doctorId,
    startAt: { $gte: startDay, $lte: endDay },
    status: { $in: ['PENDING','CONFIRMED','CHECKED_IN'] }
  }).select('startAt').lean();

  const takenHHMM = new Set(taken.map(a => a.startAt.toISOString().slice(11,16)));
  return slots.filter(s => !takenHHMM.has(s.start));
};
