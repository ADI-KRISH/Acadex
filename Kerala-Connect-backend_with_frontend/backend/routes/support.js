const express = require('express');
const SupportTicket = require('../models/SupportTicket');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/support
// @desc    Create a new support ticket (complaint)
// @access  Private (CR/Student)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
    
    const ticket = new SupportTicket({
      sender: req.user._id,
      subject,
      message,
      priority: priority || 'medium'
    });
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    console.error('Support ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/support/my-tickets
// @desc    Get tickets created by current user
// @access  Private
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ sender: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { tickets } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/support/admin/all
// @desc    Get all tickets (Admin only)
// @access  Private/Admin
router.get('/admin/all', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('sender', 'username profile.firstName profile.lastName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: { tickets } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/support/admin/:id
// @desc    Respond to/Resolve a ticket (Admin only)
// @access  Private/Admin
router.put('/admin/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    if (status) ticket.status = status;
    if (adminResponse) ticket.adminResponse = adminResponse;
    if (status === 'resolved') ticket.resolvedAt = new Date();
    
    await ticket.save();
    res.json({ success: true, data: { ticket } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
