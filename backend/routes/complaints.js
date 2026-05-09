const express = require('express');
const Complaint = require('../models/Complaint');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/complaints
// @desc    Lodge a system complaint
// @access  Private (CR, Faculty)
router.post('/', verifyToken, authorize('cr', 'faculty'), async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const complaint = new Complaint({
      author: req.user._id,
      subject,
      description
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { complaint }
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/complaints
// @desc    Get all complaints
// @access  Private (Admin only)
router.get('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate('author', 'username profile.firstName profile.lastName role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { complaints }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/complaints/:id/resolve
// @desc    Mark complaint as resolved
// @access  Private (Admin only)
router.put('/:id/resolve', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    
    if (!['resolved', 'dismissed', 'open'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    if (status === 'resolved' || status === 'dismissed') {
      complaint.resolvedAt = new Date();
    } else {
      complaint.resolvedAt = null;
    }
    
    if (resolutionNotes) {
      complaint.resolutionNotes = resolutionNotes;
    }

    await complaint.save();

    res.json({
      success: true,
      message: `Complaint marked as ${status}`,
      data: { complaint }
    });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
