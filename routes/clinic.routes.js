const express = require('express');
const router = express.Router();
const { protect, isAdmin, isClinicOwner } = require('../middlewares/auth.middleware');
const { createClinic, getClinics, getClinicById, updateClinic, deleteClinic } = require('../controllers/clinic.controller');

// Admin/Owner
router.post('/', protect, isAdmin, createClinic);
router.get('/', getClinics);
router.get('/:id', getClinicById);
router.put('/:id', protect, isClinicOwner,updateClinic);
router.delete('/:id', protect, deleteClinic);

module.exports = router;
