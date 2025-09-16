const express = require('express');
const Medication = require('../models/Medication');
const router = express.Router();

// Get all medications
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brandNames: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const medications = await Medication.find(query).sort({ name: 1 });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get medication by ID
router.get('/:id', async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    res.json(medication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
