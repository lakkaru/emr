const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

router.use(authRequired, requireRole(['admin']));

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments()
    ]);
    res.json({ items, page, limit, total });
  } catch (e) { next(e); }
});

module.exports = router;
