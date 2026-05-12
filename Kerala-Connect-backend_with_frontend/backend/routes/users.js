const express = require('express');
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, class: className, stream } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (className) {
      filter['academic.class'] = className;
    }
    
    if (stream) {
      filter['academic.stream'] = stream;
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, validateProfileUpdate, async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    // Don't allow updating certain fields directly
    delete updates.email;
    delete updates.username;
    delete updates.role;
    delete updates.password;
    delete updates.isActive;

    // Update profile
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @route   GET /api/users/class/:className
// @desc    Get users by class
// @access  Private
router.get('/class/:className', verifyToken, async (req, res) => {
  try {
    const { className } = req.params;
    const { stream } = req.query;

    const filter = {
      'academic.class': className,
      isActive: true
    };

    if (stream) {
      filter['academic.stream'] = stream;
    }

    const users = await User.find(filter)
      .select('username profile.firstName profile.lastName profile.avatar role academic')
      .sort({ 'profile.firstName': 1 });

    res.json({
      success: true,
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get class users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin)
router.put('/:id/role', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'cr', 'faculty', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Activate/deactivate user (admin only)
// @access  Private (Admin)
router.put('/:id/status', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admin to deactivate themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats/leaderboard
// @desc    Get user leaderboard
// @access  Private
router.get('/stats/leaderboard', verifyToken, async (req, res) => {
  try {
    const { class: className, stream, limit = 10 } = req.query;

    const filter = { isActive: true };
    
    if (className) {
      filter['academic.class'] = className;
    }
    
    if (stream) {
      filter['academic.stream'] = stream;
    }

    const users = await User.find(filter)
      .select('username profile.firstName profile.lastName stats')
      .sort({ 'stats.helpfulVotes': -1, 'stats.answersGiven': -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        leaderboard: users
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
