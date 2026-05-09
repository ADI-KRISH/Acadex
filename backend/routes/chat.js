const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const ClassGroup = require('../models/ClassGroup');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/chat/rooms
// @desc    Create a chat room for a class group
// @access  Private (CR or Admin)
router.post('/rooms', verifyToken, authorize('cr', 'admin'), async (req, res) => {
  try {
    const { name, classGroupId } = req.body;

    if (!name || !classGroupId) {
      return res.status(400).json({ success: false, message: 'Name and classGroupId are required' });
    }

    const classGroup = await ClassGroup.findById(classGroupId);
    if (!classGroup) {
      return res.status(404).json({ success: false, message: 'Class group not found' });
    }

    // Only allow Admin or the specific CR of this class to create rooms
    if (req.user.role !== 'admin' && classGroup.classRepresentative?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create room for this class' });
    }

    const existingRoom = await ChatRoom.findOne({ name, classGroup: classGroupId });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'Chat room for this course already exists in this class' });
    }

    const chatRoom = new ChatRoom({
      name,
      classGroup: classGroupId,
      creator: req.user._id
    });

    await chatRoom.save();

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      data: { chatRoom }
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/chat/rooms
// @desc    Get all chat rooms for the user's class
// @access  Private (Student, CR, Admin)
router.get('/rooms', verifyToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student' || req.user.role === 'cr') {
      // Find class groups where the user is a member
      const classGroups = await ClassGroup.find({ members: req.user._id });
      const classGroupIds = classGroups.map(cg => cg._id);
      query.classGroup = { $in: classGroupIds };
    }
    // Admin sees all, faculty shouldn't access this route based on original requirements "Teachers do not have access here"
    if (req.user.role === 'faculty') {
      return res.status(403).json({ success: false, message: 'Faculty do not have access to student chat rooms' });
    }

    const chatRooms = await ChatRoom.find(query)
      .populate('classGroup', 'name stream')
      .populate('creator', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { chatRooms }
    });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/chat/rooms/:roomId/messages
// @desc    Get messages for a chat room
// @access  Private
router.get('/rooms/:roomId/messages', verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    // Verify user is in the class group (except Admin)
    if (req.user.role !== 'admin') {
      const classGroup = await ClassGroup.findById(room.classGroup);
      if (!classGroup.members.includes(req.user._id)) {
        return res.status(403).json({ success: false, message: 'Not authorized to view messages in this room' });
      }
    }

    const messages = await Message.find({ chatRoom: roomId })
      .populate('sender', 'username profile.firstName profile.lastName role')
      .sort({ createdAt: 1 }); // Oldest first for chat history

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
