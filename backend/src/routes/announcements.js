const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const announcementController = require('../controllers/announcementController');
const { authRequired, requireRole } = require('../middleware/auth');

// Validation middleware for creating announcements
const validateAnnouncement = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Content must be between 10 and 2000 characters'),
  
  body('type')
    .optional()
    .isIn(['general', 'urgent', 'policy', 'training', 'maintenance', 'system'])
    .withMessage('Invalid announcement type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  
  body('targetRoles')
    .optional()
    .isArray()
    .withMessage('Target roles must be an array'),
  
  body('targetRoles.*')
    .optional()
    .isIn(['admin', 'medical_officer', 'nurse', 'receptionist', 'pharmacist', 'all'])
    .withMessage('Invalid target role'),
  
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format')
];

// Public routes (for authenticated users)
router.get('/', authRequired, announcementController.getAnnouncements);
router.get('/unread-count', authRequired, announcementController.getUnreadCount);
router.get('/:id', authRequired, announcementController.getAnnouncementById);
router.patch('/:id/read', authRequired, announcementController.markAsRead);

// Admin only routes
router.post('/', authRequired, requireRole(['admin']), validateAnnouncement, announcementController.createAnnouncement);
router.put('/:id', authRequired, requireRole(['admin']), validateAnnouncement, announcementController.updateAnnouncement);
router.delete('/:id', authRequired, requireRole(['admin']), announcementController.deleteAnnouncement);
router.get('/admin/statistics', authRequired, requireRole(['admin']), announcementController.getStatistics);

module.exports = router;
