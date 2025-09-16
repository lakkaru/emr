const express = require('express');
const Allergy = require('../models/Allergy');
const router = express.Router();

// Get all allergies
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const allergies = await Allergy.find(query).sort({ name: 1 });
    res.json(allergies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get allergy by ID
router.get('/:id', async (req, res) => {
  try {
    const allergy = await Allergy.findById(req.params.id);
    if (!allergy) {
      return res.status(404).json({ message: 'Allergy not found' });
    }
    res.json(allergy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
