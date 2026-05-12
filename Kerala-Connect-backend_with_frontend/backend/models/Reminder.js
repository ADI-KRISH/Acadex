const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'event', 'general'],
    default: 'general'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  class: {
    type: String,
    required: [true, 'Class is required']
  },
  stream: {
    type: String,
    required: [true, 'Stream is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ class: 1, stream: 1, dueDate: 1 });
reminderSchema.index({ createdBy: 1, createdAt: -1 });
reminderSchema.index({ dueDate: 1, isActive: 1 });

// Method to send notification for this reminder
reminderSchema.methods.sendNotification = async function() {
  const Notification = require('./Notification');
  const User = require('./User');
  
  // Find all users in the class/stream
  const users = await User.find({
    'academic.class': this.class,
    'academic.stream': this.stream,
    isActive: true
  });

  const notifications = users.map(user => ({
    recipient: user._id,
    sender: this.createdBy,
    type: 'deadline',
    title: this.title,
    message: this.description || `Reminder: ${this.title}`,
    metadata: {
      className: this.class,
      stream: this.stream,
      deadline: this.dueDate,
      priority: this.priority
    }
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  this.notificationSent = true;
  await this.save();

  return notifications.length;
};

// Method to edit reminder
reminderSchema.methods.editReminder = function(updates) {
  const allowedUpdates = ['title', 'description', 'type', 'dueDate', 'priority'];
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      this[field] = updates[field];
    }
  });
  return this.save();
};

module.exports = mongoose.model('Reminder', reminderSchema);
