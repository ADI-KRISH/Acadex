const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes in this file require admin role
router.use(verifyToken);
router.use(authorize('admin'));

// @route   GET /api/admin/health
// @desc    Get system health metrics
// @access  Private (Admin only)
router.get('/health', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    // Check DB status
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Count active users (logged in within last 24h, for instance. Or just all users)
    const userCount = await User.countDocuments();
    const activeUserCount = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        uptime: process.uptime(),
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
        database: dbStatus,
        users: {
          total: userCount,
          active: activeUserCount
        },
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'cr', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Enforce one CR per class and sync with ClassGroup (Strict Check)
    if (role === 'cr' && user.academic && user.academic.class) {
      const ClassGroup = require('../models/ClassGroup');
      const classGroup = await ClassGroup.findOne({ 
        name: user.academic.class, 
        stream: user.academic.stream 
      });

      if (classGroup) {
        const oldCR = classGroup.classRepresentative;
        if (oldCR && oldCR.toString() !== user._id.toString()) {
          return res.status(400).json({ 
            success: false, 
            message: 'Class already has a CR. Please remove the existing CR first.' 
          });
        }
        
        // If it passes, save user role
        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Assign new CR to class group
        classGroup.classRepresentative = user._id;
        await classGroup.save();
      } else {
        // If no class group found, just save role
        const oldRole = user.role;
        user.role = role;
        await user.save();
      }
    } else {
      const oldRole = user.role;
      user.role = role;
      await user.save();

      if (oldRole === 'cr' && role !== 'cr' && user.academic && user.academic.class) {
        // If downgraded from CR to something else, remove them from ClassGroup CR slot
        const ClassGroup = require('../models/ClassGroup');
        await ClassGroup.findOneAndUpdate(
          { name: user.academic.class, stream: user.academic.stream, classRepresentative: user._id },
          { $unset: { classRepresentative: 1 } }
        );
      }
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user from database
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    }

    // If user is a CR, clean up ClassGroup
    if (user.role === 'cr' && user.academic?.class) {
      const ClassGroup = require('../models/ClassGroup');
      await ClassGroup.findOneAndUpdate(
        { name: user.academic.class, stream: user.academic.stream, classRepresentative: user._id },
        { $unset: { classRepresentative: 1 } }
      );
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted from database successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
