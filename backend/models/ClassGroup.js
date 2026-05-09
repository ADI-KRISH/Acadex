const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class group name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  stream: {
    type: String,
    required: [true, 'Stream is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  classRepresentative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  faculty: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  semester: {
    type: Number,
    min: 1,
    max: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courses: [{
    name: { type: String, trim: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
classGroupSchema.index({ name: 1, stream: 1 });
classGroupSchema.index({ isActive: 1 });

// Method to add member
classGroupSchema.methods.addMember = function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
  }
  return this.save();
};

// Method to remove member
classGroupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    member => member.toString() !== userId.toString()
  );
  return this.save();
};

// Method to get questions (posts) for this class group
classGroupSchema.methods.getQuestions = async function() {
  const Post = require('./Post');
  return Post.find({ 
    class: this.name, 
    stream: this.stream, 
    status: 'active' 
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('ClassGroup', classGroupSchema);
