const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['general', 'urgent', 'policy', 'training', 'maintenance', 'system'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  targetRoles: [{
    type: String,
    enum: ['admin', 'medical_officer', 'nurse', 'receptionist', 'pharmacist', 'all'],
    default: 'all'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
announcementSchema.index({ targetRoles: 1, isActive: 1, publishDate: -1 });
announcementSchema.index({ priority: 1, publishDate: -1 });
announcementSchema.index({ createdBy: 1 });

// Virtual for checking if announcement is expired
announcementSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Method to check if user has read the announcement
announcementSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to mark as read by user
announcementSchema.methods.markAsRead = function(userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
};

// Static method to get announcements for a specific role
announcementSchema.statics.getForRole = function(role, userId = null) {
  const query = {
    isActive: true,
    $or: [
      { targetRoles: { $in: [role, 'all'] } }
    ],
    $and: [
      {
        $or: [
          { expiryDate: null },
          { expiryDate: { $gt: new Date() } }
        ]
      }
    ]
  };

  let result = this.find(query)
    .populate('createdBy', 'name email role')
    .sort({ priority: -1, publishDate: -1 });

  return result;
};

// Static method to get unread count for user
announcementSchema.statics.getUnreadCount = function(role, userId) {
  return this.countDocuments({
    isActive: true,
    targetRoles: { $in: [role, 'all'] },
    $or: [
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ],
    'readBy.user': { $ne: userId }
  });
};

module.exports = mongoose.model('Announcement', announcementSchema);
