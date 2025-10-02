const router = require('express').Router();
const multer = require('multer');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authRequired, requireRole } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all prescriptions with filtering and pagination
router.get('/', authRequired, requireRole(['system_admin', 'medical_officer', 'pharmacy_officer']), async (req, res, next) => {
  try {
    const { 
      patientId, 
      doctorId,
      status,
      page = 1, 
      limit = 20,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (patientId) filter.patient = patientId;
    if (doctorId) filter.doctor = doctorId;
    if (status) filter.status = status;
    
    // Search by prescription number or medication names
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { prescriptionNumber: searchRegex },
        { 'medications.name': searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const prescriptions = await Prescription.find(filter)
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('doctor', 'name username')
      .populate('dispensedBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(filter);

    res.json({
      prescriptions,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// Get patient prescriptions
router.get('/patient/:patientId', authRequired, requireRole(['system_admin', 'medical_officer', 'pharmacy_officer', 'nursing_officer']), async (req, res, next) => {
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

    const prescriptions = await Prescription.find(filter)
      .populate('doctor', 'name username')
      .populate('dispensedBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ prescriptions });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ error: 'Failed to fetch patient prescriptions' });
  }
});

// Get single prescription
router.get('/:id', authRequired, requireRole(['system_admin', 'medical_officer', 'pharmacy_officer', 'nursing_officer']), async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('doctor', 'name username')
      .populate('dispensedBy', 'name username')
      .populate('diagnosis');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Get prescription by number
router.get('/number/:prescriptionNumber', authRequired, requireRole(['system_admin', 'medical_officer', 'pharmacy_officer']), async (req, res, next) => {
  try {
    const prescription = await Prescription.findOne({ prescriptionNumber: req.params.prescriptionNumber })
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('doctor', 'name username')
      .populate('dispensedBy', 'name username')
      .populate('diagnosis');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
});

// Create new prescription
router.post('/', authRequired, requireRole(['system_admin', 'medical_officer']), upload.array('images', 5), async (req, res, next) => {
  try {
    const {
      patientId,
      diagnosisId,
      generalInstructions,
      // Backward compatibility for single medication
      medication,
      dosage,
      frequency,
      duration,
      instructions
    } = req.body;

    // Parse medications from JSON string (when sent as FormData)
    let medications;
    if (req.body.medications) {
      try {
        medications = typeof req.body.medications === 'string' 
          ? JSON.parse(req.body.medications) 
          : req.body.medications;
      } catch (error) {
        return res.status(400).json({ error: 'Invalid medications format' });
      }
    }

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Handle both multiple medications (new format) and single medication (old format)
    let prescriptionMedications = [];
    
    if (medications && Array.isArray(medications) && medications.length > 0) {
      // New format: multiple medications
      prescriptionMedications = medications.map(med => ({
        name: med.name || med.medication,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions || ''
      }));
    } else if (medication) {
      // Old format: single medication (backward compatibility)
      prescriptionMedications = [{
        name: medication,
        dosage,
        frequency,
        duration,
        instructions: instructions || ''
      }];
    } else {
      return res.status(400).json({ error: 'At least one medication is required' });
    }

    // Handle image attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        data: file.buffer
      }));
    }

    const prescription = new Prescription({
      patient: patientId,
      doctor: req.user.id,
      diagnosis: diagnosisId || null,
      medications: prescriptionMedications,
      generalInstructions: generalInstructions || instructions || '',
      attachments: attachments
    });

    await prescription.save();

    // Populate the created prescription
    await prescription.populate('patient', 'fullName nic');
    await prescription.populate('doctor', 'name username');

    res.status(201).json(prescription);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ error: error.message || 'Failed to create prescription' });
  }
});

// Update prescription status (for pharmacy)
router.put('/:id/dispense', authRequired, requireRole(['system_admin', 'pharmacy_officer']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'completed' } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    if (prescription.status !== 'active') {
      return res.status(400).json({ error: 'Prescription is not active' });
    }

    prescription.status = status;
    prescription.dispensedBy = req.user.id;
    prescription.dispensedAt = new Date();

    await prescription.save();

    const updatedPrescription = await Prescription.findById(id)
      .populate('patient', 'fullName nic')
      .populate('doctor', 'name username')
      .populate('dispensedBy', 'name username');

    res.json(updatedPrescription);
  } catch (error) {
    console.error('Error dispensing prescription:', error);
    res.status(500).json({ error: error.message || 'Failed to dispense prescription' });
  }
});

// Update prescription
router.put('/:id', authRequired, requireRole(['system_admin', 'medical_officer']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      medications,
      generalInstructions,
      status,
      // Backward compatibility for old format
      medication,
      dosage,
      frequency,
      duration,
      instructions
    } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Only allow the original doctor or admin to update
    if (req.user.role !== 'system_admin' && prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this prescription' });
    }

    const updates = {};
    
    // Handle new medications array format
    if (medications !== undefined) {
      // Validate medications array
      if (!Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({ error: 'At least one medication is required' });
      }
      
      // Validate each medication
      for (const med of medications) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          return res.status(400).json({ error: 'All medication fields (name, dosage, frequency, duration) are required' });
        }
      }
      
      updates.medications = medications;
    }
    
    // Handle general instructions
    if (generalInstructions !== undefined) {
      updates.generalInstructions = generalInstructions;
    }
    
    // Handle status updates
    if (status !== undefined) {
      updates.status = status;
    }
    
    // Backward compatibility for old single medication format
    if (medication !== undefined && !medications) {
      updates.medications = [{
        name: medication,
        dosage: dosage || '',
        frequency: frequency || '',
        duration: duration || '',
        instructions: instructions || ''
      }];
    }
    
    // Handle old instructions field (map to generalInstructions if no medications array)
    if (instructions !== undefined && !medications && !generalInstructions) {
      updates.generalInstructions = instructions;
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('patient', 'fullName nic')
      .populate('doctor', 'name username')
      .populate('dispensedBy', 'name username');

    res.json(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ error: error.message || 'Failed to update prescription' });
  }
});

// Cancel prescription
router.put('/:id/cancel', authRequired, requireRole(['system_admin', 'medical_officer']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Only allow the original doctor or admin to cancel
    if (req.user.role !== 'system_admin' && prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this prescription' });
    }

    prescription.status = 'cancelled';
    await prescription.save();

    const updatedPrescription = await Prescription.findById(id)
      .populate('patient', 'fullName nic')
      .populate('doctor', 'name username');

    res.json(updatedPrescription);
  } catch (error) {
    console.error('Error cancelling prescription:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel prescription' });
  }
});

// Delete prescription
router.delete('/:id', authRequired, requireRole(['system_admin', 'medical_officer']), async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Only allow the original doctor or admin to delete
    if (req.user.role !== 'system_admin' && prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this prescription' });
    }

    await Prescription.findByIdAndDelete(req.params.id);

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ error: 'Failed to delete prescription' });
  }
});

// Get prescription attachment
router.get('/:id/attachments/:attachmentIndex', authRequired, requireRole(['system_admin', 'medical_officer', 'pharmacy_officer']), async (req, res, next) => {
  try {
    const { id, attachmentIndex } = req.params;
    
    const prescription = await Prescription.findById(id);
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    const index = parseInt(attachmentIndex);
    if (!prescription.attachments || index >= prescription.attachments.length || index < 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    
    const attachment = prescription.attachments[index];
    
    res.set({
      'Content-Type': attachment.mimetype,
      'Content-Disposition': `inline; filename="${attachment.filename}"`,
      'Cache-Control': 'public, max-age=31536000'
    });
    
    res.send(attachment.data);
  } catch (error) {
    console.error('Error serving attachment:', error);
    res.status(500).json({ error: 'Failed to serve attachment' });
  }
});

module.exports = router;
