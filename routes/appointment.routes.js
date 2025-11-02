const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getDoctorAvailability,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  listMyAppointments,
  getAppointments,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointment.controller');

router.get('/doctors/:id/availability',  getDoctorAvailability);
router.get('/', getAppointments); // GET all appointments (format cho frontend)
router.post('/', createAppointment); // Có thể có hoặc không có protect tùy yêu cầu
router.get('/mine', listMyAppointments); // Có thể có hoặc không có protect
router.get('/:id', getAppointmentById); // Có thể có hoặc không có protect
router.patch('/:id', updateAppointment); // Update appointment (format cho frontend)
router.patch('/:id/status', updateAppointmentStatus); // Update status (giữ nguyên để backward compatible)
router.delete('/:id', deleteAppointment); // Delete appointment

module.exports = router;
