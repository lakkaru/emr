const AuditLog = require('../models/AuditLog');

async function audit(action, entity, entityId, req, metadata = {}) {
  try {
    await AuditLog.create({
      userId: req.user ? req.user.id : undefined,
      action,
      entity,
      entityId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata
    });
  } catch (e) {
    // avoid throwing from audit path
    if (process.env.NODE_ENV !== 'production') console.error('Audit error', e.message);
  }
}

module.exports = { audit };
