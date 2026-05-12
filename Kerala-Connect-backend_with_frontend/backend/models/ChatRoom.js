const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chat room name (course) is required'],
    trim: true,
  },
  classGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup',
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
chatRoomSchema.index({ classGroup: 1, status: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
