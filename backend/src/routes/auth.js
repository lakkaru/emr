const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validators');
const { authRequired, requireRole } = require('../middleware/auth');

// First-user check: open registration only if no users exist; afterwards admin-only
router.get('/has-users', async (req, res, next) => {
  try {
    const count = await User.estimatedDocumentCount();
    res.json({ hasUsers: count > 0 });
  } catch (e) { next(e); }
});

router.post('/register', async (req, res, next) => {
  try {
    const value = await registerSchema.validateAsync(req.body, { abortEarly: false });
    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });
    const count = await User.estimatedDocumentCount();
    if (count > 0) {
      // require admin auth for subsequent registrations
      try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (!payload || payload.role !== 'admin') {
          return res.status(403).json({ error: 'Admin required' });
        }
      } catch {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }
    const passwordHash = await bcrypt.hash(value.password, 12);
    const user = await User.create({ email: value.email, name: value.name, role: value.role, passwordHash });
    return res.status(201).json({ id: user._id, email: user.email, name: user.name, role: user.role });
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = await loginSchema.validateAsync(req.body, { abortEarly: false });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    user.lastLoginAt = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id.toString(), role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
    return res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role, lastLoginAt: user.lastLoginAt } });
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

// Update profile (authenticated users can update their own profile)
router.put('/profile', authRequired, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use by another user' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), email: email.trim().toLowerCase() },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: updatedUser._id, 
        email: updatedUser.email, 
        name: updatedUser.name, 
        role: updatedUser.role 
      } 
    });
  } catch (e) {
    next(e);
  }
});

// Change password (authenticated users can change their own password)
router.put('/change-password', authRequired, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash and save new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
