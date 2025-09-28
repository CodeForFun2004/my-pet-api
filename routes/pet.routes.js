const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { createPet, getPets, getPetById, updatePet, deletePet } = require('../controllers/pet.controller');

router.post('/', protect, createPet);        // customer/admin
router.get('/', protect, getPets);           // my pets (admin: ?ownerId=)
router.get('/:id', protect, getPetById);
router.put('/:id', protect, updatePet);
router.delete('/:id', protect, deletePet);

module.exports = router;
