const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  createEncounter,
  updateEncounter,
  signEncounter,
  getEncounterById,
  listEncountersByPet
} = require('../controllers/encounter.controller');

router.post('/', protect, createEncounter);
router.patch('/:id', protect, updateEncounter);
router.post('/:id/sign', protect, signEncounter);
router.get('/:id', protect, getEncounterById);
router.get('/pets/:petId', protect, listEncountersByPet);

module.exports = router;
