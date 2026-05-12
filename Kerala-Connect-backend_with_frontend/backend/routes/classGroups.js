const express = require('express');
const ClassGroup = require('../models/ClassGroup');
const User = require('../models/User');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/classgroups/public
// @desc    Get all active class groups (basic info for registration)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const classGroups = await ClassGroup.find({ isActive: true })
      .select('name stream semester')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { classGroups }
    });
  } catch (error) {
    console.error('Get public class groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/classgroups
// @desc    Get all class groups
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const { stream, isActive } = req.query;
    
    const filter = {};
    if (stream) filter.stream = stream;
    // Default to showing only active classes unless isActive is explicitly set to 'false'
    filter.isActive = isActive !== 'false';

    const classGroups = await ClassGroup.find(filter)
      .populate('classRepresentative', 'username profile.firstName profile.lastName')
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('faculty', 'username profile.firstName profile.lastName email')
      .populate('courses.teacher', 'profile.firstName profile.lastName email username')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { classGroups }
    });
  } catch (error) {
    console.error('Get class groups error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/classgroups/:id
// @desc    Get single class group
// @access  Private
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id)
      .populate('members', 'username profile.firstName profile.lastName role')
      .populate('classRepresentative', 'username profile.firstName profile.lastName')
      .populate('faculty', 'username profile.firstName profile.lastName')
      .populate('courses.teacher', 'profile.firstName profile.lastName email username')
      .populate('createdBy', 'username profile.firstName profile.lastName');

    if (!classGroup) {
      return res.status(404).json({ success: false, message: 'Class group not found' });
    }

    res.json({
      success: true,
      data: { classGroup }
    });
  } catch (error) {
    console.error('Get class group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/classgroups
// @desc    Create a class group
// @access  Private (Admin only)
router.post('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { name, stream, description, semester, courses } = req.body;

    if (!name || !stream) {
      return res.status(400).json({
        success: false,
        message: 'Name and stream are required'
      });
    }

    const existing = await ClassGroup.findOne({ name, stream });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Class group with this name and stream already exists'
      });
    }

    // Resolve teacher emails to IDs for courses and collect faculty IDs
    const resolvedCourses = [];
    const facultyIds = [];

    if (courses && Array.isArray(courses)) {
      for (let c of courses) {
        let teacherId = null;
        if (typeof c === 'string') {
          resolvedCourses.push({ name: c });
        } else {
          if (c.teacher_email) {
            const teacher = await User.findOne({ email: c.teacher_email, role: 'faculty' });
            if (teacher) {
              teacherId = teacher._id;
              if (!facultyIds.includes(teacherId.toString())) {
                facultyIds.push(teacherId.toString());
              }
            }
          }
          resolvedCourses.push({ name: c.name, teacher: teacherId });
        }
      }
    }

    const classGroup = new ClassGroup({
      name,
      stream,
      description,
      semester,
      courses: resolvedCourses,
      faculty: facultyIds,
      createdBy: req.user._id
    });

    await classGroup.save();

    res.status(201).json({
      success: true,
      message: 'Class group created successfully',
      data: { classGroup }
    });
  } catch (error) {
    console.error('Create class group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/classgroups/:id
// @desc    Update class group
// @access  Private (Admin only)
router.put('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id);
    if (!classGroup) {
      return res.status(404).json({ success: false, message: 'Class group not found' });
    }

    const oldCR = classGroup.classRepresentative ? classGroup.classRepresentative.toString() : null;
    const newCR = req.body.classRepresentative;

    // Strict CR Rule: Prevent assigning a new CR if one already exists.
    // The admin must explicitly remove the old CR first.
    if (oldCR && newCR && newCR !== oldCR) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class already has a CR. Please remove the existing CR before assigning a new one.' 
      });
    }

    // Pre-process courses (async resolution) before the forEach loop
    let resolvedCoursesForUpdate = null;
    if (req.body.courses !== undefined) {
      resolvedCoursesForUpdate = [];
      for (let c of req.body.courses) {
        if (typeof c === 'string') {
          resolvedCoursesForUpdate.push({ name: c });
        } else {
          let teacherId = c.teacher?._id || c.teacher || null;
          if (!teacherId && c.teacher_email) {
            const teacher = await User.findOne({ email: c.teacher_email, role: 'faculty' });
            teacherId = teacher ? teacher._id : null;
          }
          if (teacherId) {
            const tIdStr = teacherId.toString();
            const alreadyFaculty = classGroup.faculty.some(f => f.toString() === tIdStr);
            if (!alreadyFaculty) classGroup.faculty.push(teacherId);
          }
          resolvedCoursesForUpdate.push({ name: c.name, teacher: teacherId });
        }
      }
    }

    const allowedUpdates = ['name', 'stream', 'description', 'semester', 'isActive', 'classRepresentative', 'courses'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'classRepresentative' && req.body[field] === '') {
          classGroup[field] = null;
        } else if (field === 'courses') {
          classGroup.courses = resolvedCoursesForUpdate;
        } else {
          classGroup[field] = req.body[field];
        }
      }
    });

    await classGroup.save();

    if (newCR !== undefined && newCR !== oldCR) {
      if (oldCR) {
        await User.findByIdAndUpdate(oldCR, { role: 'student' });
      }
      if (newCR) {
        await User.findByIdAndUpdate(newCR, { role: 'cr' });
      }
    }

    res.json({
      success: true,
      message: 'Class group updated successfully',
      data: { classGroup }
    });
  } catch (error) {
    console.error('Update class group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/classgroups/:id/members
// @desc    Add member to class group
// @access  Private (Admin, CR)
router.post('/:id/members', verifyToken, authorize('admin', 'cr'), async (req, res) => {
  try {
    const { userId } = req.body;
    const classGroup = await ClassGroup.findById(req.params.id);

    if (!classGroup) {
      return res.status(404).json({ success: false, message: 'Class group not found' });
    }

    await classGroup.addMember(userId);

    res.json({
      success: true,
      message: 'Member added successfully',
      data: { classGroup }
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/classgroups/:id/members/:userId
// @desc    Remove member from class group
// @access  Private (Admin, CR)
router.delete('/:id/members/:userId', verifyToken, authorize('admin', 'cr'), async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id);

    if (!classGroup) {
      return res.status(404).json({ success: false, message: 'Class group not found' });
    }

    await classGroup.removeMember(req.params.userId);

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/classgroups/:id
// @desc    Delete class group
// @access  Private (Admin only)
router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const classGroup = await ClassGroup.findById(req.params.id);
    if (!classGroup) {
      return res.status(404).json({ success: false, message: 'Class group not found' });
    }

    classGroup.isActive = false;
    await classGroup.save();

    res.json({
      success: true,
      message: 'Class group deactivated successfully'
    });
  } catch (error) {
    console.error('Delete class group error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
