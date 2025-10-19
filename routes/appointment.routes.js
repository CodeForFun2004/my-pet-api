const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  getDoctorAvailability,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  listMyAppointments
} = require('../controllers/appointment.controller');

router.get('/doctors/:id/availability',  getDoctorAvailability);
router.post('/', protect, createAppointment);
router.get('/mine', protect, listMyAppointments);
router.get('/:id', protect, getAppointmentById);
router.patch('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
