const Pet = require('../models/pet.model');

// Helper function to format pet response for frontend
const formatPetResponse = (pet) => {
  if (!pet || !pet._id) {
    console.error('Invalid pet data in formatPetResponse:', pet);
    throw new Error('Invalid pet data: missing _id');
  }

  // Tính age từ dob
  let age = 0;
  if (pet.dob) {
    const birthDate = new Date(pet.dob);
    const today = new Date();
    age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  }

  return {
    id: pet._id.toString(),
    userId: pet.ownerId?.toString() || pet.ownerId,
    name: pet.name,
    species: pet.species || 'other',
    breed: pet.breed || '',
    age: age,
    gender: pet.sex === 'unknown' ? 'male' : pet.sex, // Map unknown to male as default
    weight: pet.weightKg || 0,
    color: pet.colorMarkings || '',
    microchipId: pet.microchipId,
    profileImage: pet.profileImage,
    notes: pet.notes,
    vaccinationHistory: (pet.vaccinationHistory || []).map((v, idx) => ({
      id: v._id?.toString() || `vac_${idx}`,
      vaccineName: v.vaccineName,
      vaccinationDate: v.vaccinationDate,
      nextDueDate: v.nextDueDate,
      veterinarian: v.veterinarian,
      notes: v.notes
    })),
    medicalHistory: (pet.medicalHistory || []).map((m, idx) => ({
      id: m._id?.toString() || `med_${idx}`,
      date: m.date,
      diagnosis: m.diagnosis,
      treatment: m.treatment,
      veterinarian: m.veterinarian,
      notes: m.notes
    })),
    isActive: pet.isActive !== undefined ? pet.isActive : true,
    createdAt: pet.createdAt || new Date().toISOString(),
    updatedAt: pet.updatedAt || new Date().toISOString()
  };
};

// Customer tạo pet của chính mình; admin có thể tạo thay (ownerId trong body)
exports.createPet = async (req, res) => {
  try {
    const { 
      name, species, breed, gender, age, weight, color, microchipId, 
      profileImage, notes, dob, ownerId 
    } = req.body;
    
    if (!name || !name.trim()) return res.status(400).json({ message: 'name is required' });

    const resolvedOwnerId = (req.user?.role === 'admin' && ownerId) ? ownerId : req.user?.id;
    if (!resolvedOwnerId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Map gender từ frontend sang sex trong backend
    const sex = gender === 'male' || gender === 'female' ? gender : 'unknown';
    
    // Tính dob từ age nếu không có dob (age có thể là 0 hoặc undefined, string hoặc number)
    let dateOfBirth = null;
    if (dob) {
      dateOfBirth = new Date(dob);
    } else if (age !== undefined && age !== null) {
      // Chuyển age thành number nếu là string
      const ageNum = typeof age === 'string' ? parseFloat(age) : age;
      if (typeof ageNum === 'number' && !isNaN(ageNum) && ageNum > 0) {
        const today = new Date();
        dateOfBirth = new Date(today.getFullYear() - ageNum, today.getMonth(), today.getDate());
      }
    }

    // Chuyển weight thành number nếu là string
    let weightNum = weight;
    if (weight !== undefined && weight !== null) {
      weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
      if (typeof weightNum === 'number' && isNaN(weightNum)) {
        weightNum = undefined;
      }
    }

    // Chuẩn bị object để tạo pet - chỉ thêm các trường có giá trị
    const petData = {
      ownerId: resolvedOwnerId,
      name: name.trim(),
      species: species || 'other',
      breed: breed || '',
      sex: sex,
      isActive: true,
      vaccinationHistory: [],
      medicalHistory: []
    };

    // Thêm các trường optional nếu có giá trị
    if (dateOfBirth && !isNaN(dateOfBirth.getTime())) {
      petData.dob = dateOfBirth;
    }
    if (weightNum !== undefined && weightNum !== null && typeof weightNum === 'number' && weightNum > 0) {
      petData.weightKg = weightNum;
    }
    if (color !== undefined && color !== null && color.trim()) {
      petData.colorMarkings = color.trim();
    }
    if (microchipId !== undefined && microchipId !== null && microchipId.trim()) {
      petData.microchipId = microchipId.trim();
    }
    if (profileImage !== undefined && profileImage !== null && profileImage.trim()) {
      petData.profileImage = profileImage.trim();
    }
    if (notes !== undefined && notes !== null && notes.trim()) {
      petData.notes = notes.trim();
    }

    console.log('Creating pet with data:', petData);
    const pet = await Pet.create(petData);

    const formatted = formatPetResponse(pet);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create pet', error: err.message });
  }
};

// Danh sách pet của chính mình (admin, doctorm, clinic, self đều xem đc)
exports.getPets = async (req, res) => {
    try {
        let query = {};
        const userRole = req.user?.role;

        // 1. Admin: Xem tất cả (nếu không có ownerId trong query) HOẶC xem thú cưng của một Owner cụ thể.
        if (userRole === 'admin') {
            if (req.query.ownerId) {
                query = { ownerId: req.query.ownerId };
            } else {
                query = {}; 
            }
        } 
        
        // 2. User/Customer: Chỉ xem thú cưng của chính mình.
        else if (userRole === 'customer') {
            query = { ownerId: req.user.id };
        } 
        
        // 3. Không có user hoặc role khác - tạm thời trả về empty
        else {
            query = { ownerId: req.user?.id || null };
        }

        const pets = await Pet.find(query).lean();
        const formatted = pets.map(formatPetResponse);
        res.json(formatted);

    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch pets', error: err.message });
    }
};

// Xem chi tiết pet (admin, doctor, clinic, self đều xem đc)
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).lean();
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    
    // Tạm thời bỏ qua kiểm tra quyền để tương thích với frontend
    // if (req.user?.role !== 'admin' && pet.ownerId.toString() !== req.user?.id) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    
    const formatted = formatPetResponse(pet);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get pet', error: err.message });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const petId = req.params.id;
    if (!petId || petId === 'undefined') {
      return res.status(400).json({ message: 'Pet ID is required' });
    }
    
    console.log('Updating pet with ID:', petId);
    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    
    // Tạm thời bỏ qua kiểm tra quyền để tương thích với frontend
    // if (req.user?.role !== 'admin' && pet.ownerId.toString() !== req.user?.id) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const { 
      name, species, breed, gender, age, weight, color, microchipId,
      profileImage, notes, dob, vaccinationHistory, medicalHistory
    } = req.body;
    
    // Update các trường - luôn cập nhật nếu có giá trị, kể cả rỗng
    if (name !== undefined && name !== null) pet.name = name.trim();
    if (species !== undefined && species !== null) pet.species = species;
    if (breed !== undefined && breed !== null) pet.breed = breed;
    if (gender !== undefined && gender !== null) {
      pet.sex = gender === 'male' || gender === 'female' ? gender : 'unknown';
    }
    
    // Update color - lưu nếu có text, xóa nếu rỗng
    if (color !== undefined && color !== null) {
      pet.colorMarkings = color.trim() || undefined;
    }
    
    // Update microchipId - lưu nếu có text, xóa nếu rỗng
    if (microchipId !== undefined && microchipId !== null) {
      pet.microchipId = microchipId.trim() || undefined;
    }
    
    // Update profileImage - lưu nếu có text, xóa nếu rỗng
    if (profileImage !== undefined && profileImage !== null) {
      pet.profileImage = profileImage.trim() || undefined;
    }
    
    // Update notes - lưu nếu có text, xóa nếu rỗng
    if (notes !== undefined && notes !== null) {
      pet.notes = notes.trim() || undefined;
    }
    
    // Update dob
    if (dob !== undefined && dob !== null) {
      pet.dob = new Date(dob);
    } else if (age !== undefined && age !== null) {
      // Chuyển age thành number nếu là string
      const ageNum = typeof age === 'string' ? parseFloat(age) : age;
      if (typeof ageNum === 'number' && !isNaN(ageNum) && ageNum > 0) {
        const today = new Date();
        pet.dob = new Date(today.getFullYear() - ageNum, today.getMonth(), today.getDate());
      }
    }
    
    // Update weight - chuyển thành number nếu là string
    if (weight !== undefined && weight !== null) {
      const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
      if (typeof weightNum === 'number' && !isNaN(weightNum) && weightNum > 0) {
        pet.weightKg = weightNum;
      } else {
        pet.weightKg = undefined;
      }
    }
    // Update vaccinationHistory và medicalHistory nếu có
    if (vaccinationHistory !== undefined && Array.isArray(vaccinationHistory)) {
      pet.vaccinationHistory = vaccinationHistory.map(v => ({
        vaccineName: v.vaccineName,
        vaccinationDate: v.vaccinationDate,
        nextDueDate: v.nextDueDate,
        veterinarian: v.veterinarian,
        notes: v.notes
      }));
    }
    if (medicalHistory !== undefined && Array.isArray(medicalHistory)) {
      pet.medicalHistory = medicalHistory.map(m => ({
        date: m.date,
        diagnosis: m.diagnosis,
        treatment: m.treatment,
        veterinarian: m.veterinarian,
        notes: m.notes
      }));
    }

    const updated = await pet.save();
    const formatted = formatPetResponse(updated);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update pet', error: err.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    
    // Tạm thời bỏ qua kiểm tra quyền để tương thích với frontend
    // if (req.user?.role !== 'admin' && pet.ownerId.toString() !== req.user?.id) {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }
    
    await pet.deleteOne();
    res.json({ message: 'Pet deleted', success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete pet', error: err.message });
  }
};
