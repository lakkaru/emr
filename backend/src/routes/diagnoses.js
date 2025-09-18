const router = require('express').Router();
const Diagnosis = require('../models/Diagnosis');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authRequired, requireRole } = require('../middleware/auth');

// Get all diagnoses with filtering and pagination
router.get('/', authRequired, requireRole(['system_admin', 'medical_officer']), async (req, res, next) => {
  try {
    const { 
      patientId, 
      doctorId,
      status,
      severity,
      page = 1, 
      limit = 20,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (patientId) filter.patient = patientId;
    if (doctorId) filter.doctor = doctorId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    
    // Search by diagnosis text
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { diagnosis: searchRegex },
        { symptoms: searchRegex },
        { treatment: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const diagnoses = await Diagnosis.find(filter)
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('doctor', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Diagnosis.countDocuments(filter);

    res.json({
      diagnoses,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    res.status(500).json({ error: 'Failed to fetch diagnoses' });
  }
});

// Get patient diagnoses
router.get('/patient/:patientId', authRequired, requireRole(['system_admin', 'medical_officer', 'nursing_officer']), async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10 } = req.query;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const filter = { patient: patientId };
    if (status) filter.status = status;

    const diagnoses = await Diagnosis.find(filter)
      .populate('doctor', 'name username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ diagnoses });
  } catch (error) {
    console.error('Error fetching patient diagnoses:', error);
    res.status(500).json({ error: 'Failed to fetch patient diagnoses' });
  }
});

// Get single diagnosis
router.get('/:id', authRequired, requireRole(['system_admin', 'medical_officer', 'nursing_officer']), async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id)
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('doctor', 'name username');

    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    res.json(diagnosis);
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    res.status(500).json({ error: 'Failed to fetch diagnosis' });
  }
});

// Create new diagnosis
router.post('/', authRequired, requireRole(['system_admin', 'medical_officer']), async (req, res, next) => {
  try {
    const {
      patientId,
      diagnosis,
      symptoms,
      treatment,
      notes,
      severity = 'moderate',
      status = 'active',
      followUpDate
    } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newDiagnosis = new Diagnosis({
      patient: patientId,
      doctor: req.user.id,
      diagnosis,
      symptoms,
      treatment,
      notes,
      severity,
      status,
      followUpDate: followUpDate ? new Date(followUpDate) : null
    });

    await newDiagnosis.save();

    // Populate the created diagnosis
    await newDiagnosis.populate('patient', 'fullName nic');
    await newDiagnosis.populate('doctor', 'name username');

    res.status(201).json(newDiagnosis);
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    res.status(500).json({ error: error.message || 'Failed to create diagnosis' });
  }
});

// Update diagnosis
router.put('/:id', authRequired, requireRole(['system_admin', 'medical_officer']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      symptoms,
      treatment,
      notes,
      severity,
      status,
      followUpDate
    } = req.body;

    const existingDiagnosis = await Diagnosis.findById(id);
    if (!existingDiagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    // Only allow the original doctor or admin to update
    if (req.user.role !== 'system_admin' && existingDiagnosis.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this diagnosis' });
    }

    const updates = {};
    if (diagnosis !== undefined) updates.diagnosis = diagnosis;
    if (symptoms !== undefined) updates.symptoms = symptoms;    
    if (treatment !== undefined) updates.treatment = treatment;
    if (notes !== undefined) updates.notes = notes;
    if (severity !== undefined) updates.severity = severity;
    if (status !== undefined) updates.status = status;
    if (followUpDate !== undefined) updates.followUpDate = followUpDate ? new Date(followUpDate) : null;

    const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('patient', 'fullName nic')
      .populate('doctor', 'name username');

    res.json(updatedDiagnosis);
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    res.status(500).json({ error: error.message || 'Failed to update diagnosis' });
  }
});

// Delete diagnosis
router.delete('/:id', authRequired, requireRole(['system_admin']), async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id);
    
    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    res.json({ message: 'Diagnosis deleted successfully' });
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    res.status(500).json({ error: 'Failed to delete diagnosis' });
  }
});

module.exports = router;
