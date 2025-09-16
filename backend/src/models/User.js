const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'doctor', 'nurse', 'clerk'], default: 'clerk' },
  passwordHash: { type: String, required: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });

UserSchema.methods.verifyPassword = function (pw) {
  return bcrypt.compare(pw, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
