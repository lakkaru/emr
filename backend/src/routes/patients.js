const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const Patient = require('../models/Patient');
const { patientSchema } = require('../validators');

function buildDedupeKey({ fullName, dob, phone }) {
  const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, '');
  return [norm(fullName), new Date(dob).toISOString().slice(0, 10), norm(phone).replace(/[^0-9]/g, '')].join('|');
}

router.use(authRequired);

// Create patient
router.post('/', requireRole(['admin', 'doctor', 'nurse', 'clerk']), async (req, res, next) => {
  try {
    const value = await patientSchema.validateAsync(req.body, { abortEarly: false });
    value.dedupeKey = buildDedupeKey(value);
    const dup = await Patient.findOne({ dedupeKey: value.dedupeKey });
    if (dup) {
      return res.status(409).json({ error: 'Possible duplicate', duplicateId: dup._id });
    }
    const created = await Patient.create(value);
    await audit('create', 'Patient', created._id.toString(), req, { fields: ['fullName', 'dob', 'phone'] });
    res.status(201).json(created);
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

// List patients (basic pagination, minimal fields)
router.get('/', requireRole(['admin', 'doctor', 'nurse', 'clerk']), async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Patient.find({}, { fullName: 1, dob: 1, phone: 1, gender: 1, createdAt: 1 }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Patient.countDocuments()
    ]);
    res.json({ items, page, limit, total });
  } catch (e) { next(e); }
});

// Duplicate check endpoint
router.post('/check-duplicate', requireRole(['admin', 'doctor', 'nurse', 'clerk']), async (req, res, next) => {
  try {
    const { fullName, dob, phone } = req.body || {};
    if (!fullName || !dob || !phone) return res.status(400).json({ error: 'Missing fields' });
    const key = buildDedupeKey({ fullName, dob, phone });
    const exists = await Patient.findOne({ dedupeKey: key }, { _id: 1, fullName: 1, dob: 1, phone: 1 });
    if (!exists) return res.json({ duplicate: false });
    res.json({ duplicate: true, patient: exists });
  } catch (e) { next(e); }
});

// Read single patient
router.get('/:id', requireRole(['admin', 'doctor', 'nurse', 'clerk']), async (req, res, next) => {
  try {
    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    res.json(p);
  } catch (e) { next(e); }
});

// Update patient
router.put('/:id', requireRole(['admin']), async (req, res, next) => {
  try {
    const value = await patientSchema.validateAsync(req.body, { abortEarly: false });
    value.dedupeKey = buildDedupeKey(value);
    const updated = await Patient.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    await audit('update', 'Patient', updated._id.toString(), req, { fields: ['fullName', 'dob', 'phone'] });
    res.json(updated);
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

module.exports = router;
