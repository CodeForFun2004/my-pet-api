const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { upsertOverride, listOverrides, deleteOverride } = require('../controllers/doctorSchedule.controller');

router.put('/:doctorId/:date', protect, upsertOverride);
router.get('/:doctorId', protect, listOverrides);
router.delete('/:doctorId/:date', protect, deleteOverride);

module.exports = router;
