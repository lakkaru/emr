const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  entity: { type: String },
  entityId: { type: String },
  ip: String,
  userAgent: String,
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
