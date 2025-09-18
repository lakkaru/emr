const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');

// Get announcements for the current user based on their role
exports.getAnnouncements = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const { page = 1, limit = 10, priority, type, unread } = req.query;

    // Build base query
    let query = {
      isActive: true,
      targetRoles: { $in: [role, 'all'] },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: new Date() } }
      ]
    };

    // Add filters
    if (priority) {
      query.priority = priority;
    }

    if (type) {
      query.type = type;
    }

    if (unread === 'true') {
      query['readBy.user'] = { $ne: userId };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get announcements
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role')
      .sort({ priority: -1, publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Add read status for each announcement
    const announcementsWithReadStatus = announcements.map(announcement => ({
      ...announcement,
      isRead: announcement.readBy.some(read => read.user.toString() === userId.toString()),
      readCount: announcement.readBy.length
    }));

    // Get total count
    const total = await Announcement.countDocuments(query);

    // Get unread count
    const unreadCount = await Announcement.getUnreadCount(role, userId);

    res.json({
      announcements: announcementsWithReadStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch announcements',
      error: error.message 
    });
  }
};

// Get a single announcement by ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    const announcement = await Announcement.findOne({
      _id: id,
      isActive: true,
      targetRoles: { $in: [role, 'all'] }
    }).populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if expired
    if (announcement.expiryDate && new Date() > announcement.expiryDate) {
      return res.status(404).json({ message: 'Announcement has expired' });
    }

    // Add read status
    const isRead = announcement.isReadBy(userId);

    res.json({
      ...announcement.toObject(),
      isRead,
      readCount: announcement.readBy.length
    });

  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch announcement',
      error: error.message 
    });
  }
};

// Mark announcement as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId, role } = req.user;

    const announcement = await Announcement.findOne({
      _id: id,
      isActive: true,
      targetRoles: { $in: [role, 'all'] }
    });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Mark as read if not already read
    if (!announcement.isReadBy(userId)) {
      announcement.markAsRead(userId);
      await announcement.save();
    }

    res.json({ 
      message: 'Announcement marked as read',
      readAt: new Date()
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ 
      message: 'Failed to mark announcement as read',
      error: error.message 
    });
  }
};

// Get unread announcements count
exports.getUnreadCount = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    
    const unreadCount = await Announcement.getUnreadCount(role, userId);
    
    res.json({ unreadCount });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      message: 'Failed to get unread count',
      error: error.message 
    });
  }
};

// Admin only - Create new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      title,
      content,
      type,
      priority,
      targetRoles,
      expiryDate,
      attachments
    } = req.body;

    const announcement = new Announcement({
      title,
      content,
      type,
      priority,
      targetRoles: targetRoles || ['all'],
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      attachments: attachments || [],
      createdBy: req.user._id
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name email role');

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ 
      message: 'Failed to create announcement',
      error: error.message 
    });
  }
};

// Admin only - Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.createdBy;
    delete updateData.readBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({
      message: 'Announcement updated successfully',
      announcement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ 
      message: 'Failed to update announcement',
      error: error.message 
    });
  }
};

// Admin only - Delete announcement (soft delete)
exports.deleteAnnouncement = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ 
      message: 'Failed to delete announcement',
      error: error.message 
    });
  }
};

// Get announcement statistics (Admin only)
exports.getStatistics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalAnnouncements = await Announcement.countDocuments({ isActive: true });
    const urgentAnnouncements = await Announcement.countDocuments({ 
      isActive: true, 
      priority: { $in: ['high', 'critical'] }
    });
    const expiredAnnouncements = await Announcement.countDocuments({ 
      isActive: true,
      expiryDate: { $lt: new Date() }
    });

    // Get read statistics by role
    const readStats = await Announcement.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$readBy' },
      {
        $lookup: {
          from: 'users',
          localField: 'readBy.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalAnnouncements,
      urgentAnnouncements,
      expiredAnnouncements,
      readStatsByRole: readStats
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      message: 'Failed to get statistics',
      error: error.message 
    });
  }
};
