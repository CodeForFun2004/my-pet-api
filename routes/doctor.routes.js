const express = require('express');
const router = express.Router();
const { protect, isClinicOwner, isAdmin, isAdminOrClinicOwner } = require('../middlewares/auth.middleware');
const { createDoctor, getDoctors, getDoctorById, updateDoctor, updateScheduleTemplate } = require('../controllers/doctor.controller');

router.post('/', protect,isAdminOrClinicOwner, createDoctor);                 // admin/owner
router.get('/',  getDoctors);                    // admin/owner
router.get('/:id',   getDoctorById);              // admin/owner/self
router.put('/:id', protect, isAdminOrClinicOwner, updateDoctor);               // admin/owner/self
router.put('/:id/schedule-template', protect, updateScheduleTemplate); // admin/owner/self

module.exports = router;
