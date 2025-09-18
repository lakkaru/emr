const router = require('express').Router();
const LabTest = require('../models/LabTest');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { authRequired, requireRole } = require('../middleware/auth');

// Get all lab tests with filtering and pagination
router.get('/', authRequired, async (req, res, next) => {
  try {
    const { 
      status, 
      patientId, 
      testType, 
      priority, 
      orderedBy, 
      processedBy,
      page = 1, 
      limit = 20,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (patientId) filter.patient = patientId;
    if (testType) filter.testType = testType;
    if (priority) filter.priority = priority;
    if (orderedBy) filter.orderedBy = orderedBy;
    if (processedBy) filter.processedBy = processedBy;
    
    // Search by test code or patient name
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const patients = await Patient.find({
        $or: [
          { fullName: searchRegex },
          { nic: searchRegex }
        ]
      }).select('_id');
      
      filter.$or = [
        { testCode: searchRegex },
        { patient: { $in: patients.map(p => p._id) } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tests = await LabTest.find(filter)
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('orderedBy', 'name username employeeNumber')
      .populate('processedBy', 'name username employeeNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LabTest.countDocuments(filter);

    res.json({
      tests,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
});

// Get patient's lab tests by patient ID or barcode
router.get('/patient/:patientId', authRequired, async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status, testType, limit = 50 } = req.query;

    // Find patient first to validate
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Build filter for patient's tests
    const filter = { patient: patientId };
    if (status) filter.status = status;
    if (testType) filter.testType = testType;

    const tests = await LabTest.find(filter)
      .populate('orderedBy', 'name username employeeNumber')
      .populate('processedBy', 'name username employeeNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Group tests by status for easy display
    const groupedTests = {
      pending: tests.filter(t => t.status === 'pending'),
      in_progress: tests.filter(t => t.status === 'in_progress'),
      completed: tests.filter(t => t.status === 'completed'),
      cancelled: tests.filter(t => t.status === 'cancelled')
    };

    res.json({
      patient: {
        _id: patient._id,
        fullName: patient.fullName,
        nic: patient.nic,
        dateOfBirth: patient.dateOfBirth
      },
      tests,
      groupedTests,
      summary: {
        total: tests.length,
        pending: groupedTests.pending.length,
        inProgress: groupedTests.in_progress.length,
        completed: groupedTests.completed.length,
        cancelled: groupedTests.cancelled.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get lab test by test code (for barcode scanning)
router.get('/code/:testCode', authRequired, async (req, res, next) => {
  try {
    const { testCode } = req.params;

    const test = await LabTest.findOne({ testCode })
      .populate('patient', 'fullName nic phones dateOfBirth')
      .populate('orderedBy', 'name username employeeNumber')
      .populate('processedBy', 'name username employeeNumber');

    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }

    res.json(test);
  } catch (error) {
    next(error);
  }
});

// Create new lab test (for medical officers and lab officers)
router.post('/', authRequired, requireRole(['system_admin', 'medical_officer', 'lab_officer']), async (req, res, next) => {
  try {
    const {
      patientId,
      testType,
      priority = 'routine',
      sampleType,
      notes,
      dueDate,
      externalDoctorName,
      externalInstitute
    } = req.body;

    // Validate patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Calculate due date if not provided
    let calculatedDueDate = dueDate;
    if (!calculatedDueDate) {
      const daysToAdd = priority === 'stat' ? 1 : priority === 'urgent' ? 2 : 7;
      calculatedDueDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    // Generate unique test code
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const testCode = `LAB${date}${randomNum}`;

    const labTest = new LabTest({
      patient: patientId,
      testCode,
      orderedBy: req.user.id,
      testType,
      priority,
      sampleType,
      notes,
      dueDate: calculatedDueDate,
      externalDoctorName,
      externalInstitute
    });

    await labTest.save();

    // Populate the created test
    await labTest.populate('patient', 'fullName nic');
    await labTest.populate('orderedBy', 'name username');

    res.status(201).json(labTest);
  } catch (error) {
    console.error('Error creating lab test:', error);
    res.status(500).json({ error: error.message || 'Failed to create lab test' });
  }
});

// Update lab test (for lab officers)
router.put('/:id', authRequired, requireRole(['system_admin', 'lab_officer']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      sampleCollected,
      results,
      normalRange,
      interpretation,
      notes
    } = req.body;

    const test = await LabTest.findById(id);
    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }

    const updates = {};
    
    if (status !== undefined) {
      updates.status = status;
      if (status === 'in_progress' && !test.processedBy) {
        updates.processedBy = req.user.id;
      }
      if (status === 'completed') {
        updates.completedAt = new Date();
      }
    }
    
    if (sampleCollected !== undefined) {
      updates.sampleCollected = sampleCollected;
      if (sampleCollected && !test.sampleCollectedAt) {
        updates.sampleCollectedAt = new Date();
      }
    }
    
    if (results !== undefined) updates.results = results;
    if (normalRange !== undefined) updates.normalRange = normalRange;
    if (interpretation !== undefined) updates.interpretation = interpretation;
    if (notes !== undefined) updates.notes = notes;

    const updatedTest = await LabTest.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('patient', 'fullName nic')
      .populate('orderedBy', 'name username')
      .populate('processedBy', 'name username');

    res.json(updatedTest);
  } catch (error) {
    next(error);
  }
});

// Get lab statistics for dashboard
router.get('/stats/dashboard', authRequired, requireRole(['system_admin', 'lab_officer']), async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      pendingTests,
      completedToday,
      overdueTests,
      inProgressTests,
      totalSamples,
      urgentTests
    ] = await Promise.all([
      LabTest.countDocuments({ status: 'pending' }),
      LabTest.countDocuments({ 
        status: 'completed',
        completedAt: { $gte: today, $lt: tomorrow }
      }),
      LabTest.countDocuments({ 
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: today }
      }),
      LabTest.countDocuments({ status: 'in_progress' }),
      LabTest.countDocuments({ sampleCollected: true }),
      LabTest.countDocuments({ 
        priority: { $in: ['urgent', 'stat'] },
        status: { $in: ['pending', 'in_progress'] }
      })
    ]);

    res.json({
      pendingTests,
      completedToday,
      overdueTests,
      inProgressTests,
      totalSamples,
      urgentTests
    });
  } catch (error) {
    next(error);
  }
});

// Delete lab test (admin only)
router.delete('/:id', authRequired, requireRole(['system_admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await LabTest.findById(id);
    if (!test) {
      return res.status(404).json({ error: 'Lab test not found' });
    }

    await LabTest.findByIdAndDelete(id);
    res.json({ message: 'Lab test deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
