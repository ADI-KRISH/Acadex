const express = require('express');
const Reminder = require('../models/Reminder');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reminders
// @desc    Get reminders (filtered by class/stream)
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      class: className, 
      stream, 
      type,
      upcoming = 'true'
    } = req.query;

    const filter = { isActive: true };
    
    if (className) {
      const streamPrefix = className.split('-')[0];
      filter.$or = [
        { class: className },
        { class: streamPrefix }
      ];
    }
    
    if (stream) {
      if (filter.$or) {
        filter.$or.push({ stream: stream });
      } else {
        filter.stream = stream;
      }
    }
    if (type) filter.type = type;
    
    // Show upcoming reminders by default
    if (upcoming === 'true') {
      filter.dueDate = { $gte: new Date() };
    }

    const reminders = await Reminder.find(filter)
      .populate('createdBy', 'username profile.firstName profile.lastName role')
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reminder.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reminders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReminders: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reminders/:id
// @desc    Get single reminder
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName role');

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({
      success: true,
      data: { reminder }
    });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/reminders
// @desc    Create a reminder
// @access  Private (CR, Faculty, Admin)
router.post('/', verifyToken, authorize('cr', 'faculty', 'admin'), async (req, res) => {
  try {
    const { title, description, type, dueDate, class: className, stream, priority } = req.body;

    if (!title || !dueDate || !className || !stream) {
      return res.status(400).json({
        success: false,
        message: 'Title, due date, class, and stream are required'
      });
    }

    const reminder = new Reminder({
      title,
      description,
      type: type || 'general',
      dueDate: new Date(dueDate),
      class: className,
      stream,
      priority: priority || 'medium',
      createdBy: req.user._id
    });

    await reminder.save();

    // Send notification to all students in the class
    const recipientCount = await reminder.sendNotification();

    await reminder.populate('createdBy', 'username profile.firstName profile.lastName role');

    res.status(201).json({
      success: true,
      message: `Reminder created and sent to ${recipientCount} students`,
      data: { reminder }
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reminders/:id
// @desc    Update reminder
// @access  Private (creator, admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check permissions
    const isCreator = reminder.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own reminders.'
      });
    }

    await reminder.editReminder(req.body);
    await reminder.populate('createdBy', 'username profile.firstName profile.lastName role');

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: { reminder }
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Delete reminder
// @access  Private (creator, admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check permissions
    const isCreator = reminder.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    reminder.isActive = false;
    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
