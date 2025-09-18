const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { registerSchema } = require('../validators');
const { authRequired, requireRole } = require('../middleware/auth');
const { audit } = require('../middleware/audit');

router.use(authRequired, requireRole(['system_admin']));

// Get all users (for management)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments()
    ]);
    
    res.json({ users, page, limit, total });
  } catch (e) { 
    next(e); 
  }
});

// Register new officer (admin only)
router.post('/', async (req, res, next) => {
  try {
    const value = await registerSchema.validateAsync(req.body, { abortEarly: false });
    
    // Check if employee number already exists
    const existingEmployee = await User.findOne({ employeeNumber: value.employeeNumber });
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee number already in use' });
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ username: value.username });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already in use' });
    }
    
    // Prevent creating another system_admin unless explicitly allowed
    if (value.role === 'system_admin') {
      return res.status(403).json({ error: 'Cannot create additional system administrators' });
    }
    
    // Hash password and create user
    const passwordHash = await bcrypt.hash(value.password, 12);
    const user = await User.create({ 
      employeeNumber: value.employeeNumber,
      username: value.username, 
      name: value.name, 
      role: value.role, 
      passwordHash 
    });
    
    // Audit log
    await audit('create', 'User', user._id.toString(), req, { 
      fields: ['name', 'employeeNumber', 'username', 'role'] 
    });
    
    // Return user without password hash
    const { passwordHash: _, ...userResponse } = user.toObject();
    res.status(201).json(userResponse);
  } catch (e) {
    if (e.isJoi) return res.status(400).json({ error: e.message });
    next(e);
  }
});

// Get single user
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, { passwordHash: 0 });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) { 
    next(e); 
  }
});

// Update user (admin only)
router.put('/:id', async (req, res, next) => {
  try {
    const { name, employeeNumber, username, role } = req.body;
    
    if (!name || !employeeNumber || !username || !role) {
      return res.status(400).json({ error: 'Name, employee number, username, and role are required' });
    }
    
    // Prevent role changes to/from system_admin
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (existingUser.role === 'system_admin' || role === 'system_admin') {
      return res.status(403).json({ error: 'Cannot modify system administrator roles' });
    }
    
    // Check if employee number is already in use by another user
    const employeeExists = await User.findOne({ 
      employeeNumber: employeeNumber, 
      _id: { $ne: req.params.id } 
    });
    if (employeeExists) {
      return res.status(409).json({ error: 'Employee number already in use by another user' });
    }
    
    // Check if username is already in use by another user
    const usernameExists = await User.findOne({ 
      username: username.toLowerCase(), 
      _id: { $ne: req.params.id } 
    });
    if (usernameExists) {
      return res.status(409).json({ error: 'Username already in use by another user' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        name: name.trim(), 
        employeeNumber: employeeNumber.trim(),
        username: username.trim().toLowerCase(), 
        role 
      },
      { new: true, select: '-passwordHash' }
    );
    
    // Audit log
    await audit('update', 'User', updatedUser._id.toString(), req, { 
      fields: ['name', 'employeeNumber', 'username', 'role'] 
    });
    
    res.json(updatedUser);
  } catch (e) {
    next(e);
  }
});

// Delete user (admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Prevent deleting system_admin
    if (user.role === 'system_admin') {
      return res.status(403).json({ error: 'Cannot delete system administrator' });
    }
    
    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    // Audit log
    await audit('delete', 'User', req.params.id, req, { 
      fields: ['name', 'employeeNumber', 'username', 'role'] 
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (e) {
    next(e);
  }
});

// Reset user password (admin only)
router.put('/:id/reset-password', async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Prevent resetting system_admin password
    if (user.role === 'system_admin') {
      return res.status(403).json({ error: 'Cannot reset system administrator password' });
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.params.id, { passwordHash });
    
    // Audit log
    await audit('password_reset', 'User', req.params.id, req, { 
      fields: ['name', 'employeeNumber', 'username'] 
    });
    
    res.json({ message: 'Password reset successfully' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
