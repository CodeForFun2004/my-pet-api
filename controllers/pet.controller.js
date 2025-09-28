const Pet = require('../models/pet.model');

// Customer tạo pet của chính mình; admin có thể tạo thay (ownerId trong body)
exports.createPet = async (req, res) => {
  try {
    const { name, species, breed, sex, dob, weightKg, colorMarkings, notes, ownerId } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });

    const resolvedOwnerId = (req.user.role === 'admin' && ownerId) ? ownerId : req.user.id;

    const pet = await Pet.create({
      ownerId: resolvedOwnerId,
      name, species, breed, sex, dob, weightKg, colorMarkings, notes
    });

    res.status(201).json({ message: 'Pet created', pet });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create pet', error: err.message });
  }
};

// Danh sách pet của chính mình (admin, doctorm, clinic, self đều xem đc)
exports.getPets = async (req, res) => {
    try {
        let query = {};
        const userRole = req.user.role;

        // 1. Admin: Xem tất cả (nếu không có ownerId trong query) HOẶC xem thú cưng của một Owner cụ thể.
        if (userRole === 'admin') {
            if (req.query.ownerId) {
                // Admin muốn xem thú cưng của một owner cụ thể
                query = { ownerId: req.query.ownerId };
            } else {
                // Admin muốn xem TẤT CẢ thú cưng
                query = {}; 
            }
        } 
        
        // 2. User/Customer: Chỉ xem thú cưng của chính mình.
        else if (userRole === 'customer') {
            query = { ownerId: req.user.id };
        } 
        
        // 3. Doctor & Clinic Owner: Đây là phần cần xử lý qua model khác (Encounter)
        // Nếu không phải admin/customer, ta sẽ giới hạn danh sách để họ chỉ xem các pet liên quan.
        // Tạm thời, tôi sẽ để họ chỉ xem các pet mà họ đã từng có lịch hẹn (tham khảo phần 2).
        else if (userRole === 'doctor' || userRole === 'clinic-owner') {
            
            // Bạn sẽ cần:
            // a. Lấy danh sách ownerIds từ các Encounter/Appointment liên quan đến Doctor/Clinic Owner này.
            // b. Sử dụng $in để tìm các Pet thuộc các ownerIds đó.
            
            // Ví dụ (Giả định có sẵn mảng ownerIdsRelated):
            // const ownerIdsRelated = await getRelatedOwnerIds(req.user.id, userRole);
            // query = { ownerId: { $in: ownerIdsRelated } };
            
            // Nếu không thể truy vấn Encounter ở đây, bạn có thể TỪ CHỐI truy cập
            // hoặc trả về danh sách trống/lỗi cho đến khi logic Encounter được triển khai.
            // Để an toàn, tạm thời ta giới hạn:
            return res.status(403).json({ 
                message: 'Access to the global pet list is restricted. Please use specific API endpoints for your clinic/doctor dashboards.' 
            });
        }
        
        // *Chú ý: `req.user.role` phải là 'customer' nếu người dùng là chủ sở hữu pet.

        const pets = await Pet.find(query).lean();
        res.json({ items: pets });

    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch pets', error: err.message });
    }
};

// Xem chi tiết pet (admin, doctor, clinic, self đều xem đc)
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id).lean();
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (req.user.role !== 'admin' && pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get pet', error: err.message });
  }
};

exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (req.user.role !== 'admin' && pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, species, breed, sex, dob, weightKg, colorMarkings, notes } = req.body;
    if (name !== undefined) pet.name = name;
    if (species !== undefined) pet.species = species;
    if (breed !== undefined) pet.breed = breed;
    if (sex !== undefined) pet.sex = sex;
    if (dob !== undefined) pet.dob = dob;
    if (weightKg !== undefined) pet.weightKg = weightKg;
    if (colorMarkings !== undefined) pet.colorMarkings = colorMarkings;
    if (notes !== undefined) pet.notes = notes;

    const updated = await pet.save();
    res.json({ message: 'Pet updated', pet: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update pet', error: err.message });
  }
};

exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    if (req.user.role !== 'admin' && pet.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await pet.deleteOne();
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete pet', error: err.message });
  }
};
