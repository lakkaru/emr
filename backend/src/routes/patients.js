const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const Patient = require('../models/Patient');
const { patientSchema } = require('../validators');

function buildDedupeKey({ fullName, dob, phones }) {
  const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');
  // Use the first phone number for deduplication
  const firstPhone = phones && phones.length > 0 ? phones[0].number : '';
  return [norm(fullName), new Date(dob).toISOString().slice(0, 10), norm(firstPhone).replace(/[^0-9]/g, '')].join('|');
}

router.use(authRequired);

// Create patient
router.post('/', requireRole(['front_desk', 'medical_officer', 'nursing_officer']), async (req, res, next) => {
  try {
    const value = await patientSchema.validateAsync(req.body, { abortEarly: false });
    value.dedupeKey = buildDedupeKey(value);
    const dup = await Patient.findOne({ dedupeKey: value.dedupeKey });
    if (dup) {
      return res.status(409).json({ error: 'Possible duplicate', duplicateId: dup._id });
    }
    const created = await Patient.create(value);
    await audit('create', 'Patient', created._id.toString(), req, { fields: ['fullName', 'dob', 'phones'] });
    res.status(201).json(created);
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

// List patients (basic pagination, minimal fields)
router.get('/', requireRole(['front_desk', 'medical_officer', 'nursing_officer', 'lab_officer', 'pharmacy_officer']), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();
    
    // Build search query
    let query = {};
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { fullName: searchRegex },
          { nic: searchRegex },
          { 'phones.number': searchRegex }
        ]
      };
    }
    
    const [items, total] = await Promise.all([
      Patient.find(query, { fullName: 1, nic: 1, dob: 1, phones: 1, gender: 1, address: 1, createdAt: 1 }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments(query)
    ]);
    res.json({ items, page, limit, total });
  } catch (e) { next(e); }
});

// Duplicate check endpoint
router.post('/check-duplicate', requireRole(['front_desk', 'medical_officer', 'nursing_officer']), async (req, res, next) => {
  try {
    const { fullName, dob, phones } = req.body || {};
    if (!fullName || !dob || !phones || phones.length === 0) return res.status(400).json({ error: 'Missing fields' });
    const key = buildDedupeKey({ fullName, dob, phones });
    const exists = await Patient.findOne({ dedupeKey: key }, { _id: 1, fullName: 1, dob: 1, phones: 1 });
    if (!exists) return res.json({ duplicate: false });
    res.json({ duplicate: true, patient: exists });
  } catch (e) { next(e); }
});

// Read single patient
router.get('/:id', requireRole(['front_desk', 'medical_officer', 'nursing_officer', 'lab_officer', 'pharmacy_officer']), async (req, res, next) => {
  try {
    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (e) { next(e); }
});

// Update patient
router.put('/:id', requireRole(['front_desk']), async (req, res, next) => {
  try {
    const value = await patientSchema.validateAsync(req.body, { abortEarly: false });
    value.dedupeKey = buildDedupeKey(value);
    const updated = await Patient.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await audit('update', 'Patient', updated._id.toString(), req, { fields: ['fullName', 'dob', 'phones'] });
    res.json(updated);
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

module.exports = router;
