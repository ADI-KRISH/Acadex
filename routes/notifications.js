const express = require('express');
const Notification = require('../models/Notification');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications with pagination
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    
    // Build filter
    const filter = { recipient: req.user._id };
    
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }
    
    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'username profile.firstName profile.lastName profile.avatar')
      .populate('relatedPost', 'title')
      .populate('relatedComment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalNotifications: total,
          limit
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification
      }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', verifyToken, async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/notifications/send-deadline
// @desc    Send deadline notification (CR only)
// @access  Private (CR, Faculty, Admin)
router.post('/send-deadline', verifyToken, authorize('cr', 'faculty', 'admin'), async (req, res) => {
  try {
    const { title, message, className, stream, deadline, priority = 'medium' } = req.body;

    if (!title || !message || !className || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, class, and deadline are required'
      });
    }

    // Find all users in the class/stream
    const User = require('../models/User');
    const filter = {
      'academic.class': className,
      isActive: true
    };

    if (stream) {
      filter['academic.stream'] = stream;
    }

    const users = await User.find(filter);

    // Create notifications for all users
    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: 'deadline',
      title,
      message,
      metadata: {
        className,
        stream,
        deadline: new Date(deadline),
        priority
      }
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Deadline notification sent to ${users.length} users`,
      data: {
        recipientCount: users.length
      }
    });
  } catch (error) {
    console.error('Send deadline notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/notifications/send-announcement
// @desc    Send announcement notification (CR, Faculty, Admin only)
// @access  Private (CR, Faculty, Admin)
router.post('/send-announcement', verifyToken, authorize('cr', 'faculty', 'admin'), async (req, res) => {
  try {
    const { title, message, className, stream, priority = 'medium' } = req.body;

    if (!title || !message || !className) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and class are required'
      });
    }

    // Find all users in the class/stream
    const User = require('../models/User');
    const filter = {
      'academic.class': className,
      isActive: true
    };

    if (stream) {
      filter['academic.stream'] = stream;
    }

    const users = await User.find(filter);

    // Create notifications for all users
    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: 'announcement',
      title,
      message,
      metadata: {
        className,
        stream,
        priority
      }
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Announcement sent to ${users.length} users`,
      data: {
        recipientCount: users.length
      }
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics (admin only)
// @access  Private (Admin only)
router.get('/stats', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalNotifications = await Notification.countDocuments();
    const totalUnread = await Notification.countDocuments({ isRead: false });

    res.json({
      success: true,
      data: {
        stats,
        totalNotifications,
        totalUnread
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
