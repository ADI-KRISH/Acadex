const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: String,
    required: [true, 'Class is required']
  },
  stream: {
    type: String,
    required: [true, 'Stream is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['question', 'announcement', 'discussion', 'assignment', 'exam'],
    default: 'question'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  votes: {
    upvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    downvotes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  answerCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  voteScore: {
    type: Number,
    default: 0
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  bestAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'deleted'],
    default: 'active'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for search functionality
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ class: 1, stream: 1, status: 1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

// Method to check if user voted
postSchema.methods.hasUserVoted = function(userId, voteType) {
  if (voteType === 'upvote') {
    return this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  } else if (voteType === 'downvote') {
    return this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  }
  return false;
};

// Method to add/remove vote
postSchema.methods.toggleVote = function(userId, voteType) {
  if (voteType === 'upvote') {
    // Remove from downvotes if exists
    this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    
    // Toggle upvote
    const existingUpvote = this.votes.upvotes.find(vote => vote.user.toString() === userId.toString());
    if (existingUpvote) {
      this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    } else {
      this.votes.upvotes.push({ user: userId });
    }
  } else if (voteType === 'downvote') {
    // Remove from upvotes if exists
    this.votes.upvotes = this.votes.upvotes.filter(vote => vote.user.toString() !== userId.toString());
    
    // Toggle downvote
    const existingDownvote = this.votes.downvotes.find(vote => vote.user.toString() === userId.toString());
    if (existingDownvote) {
      this.votes.downvotes = this.votes.downvotes.filter(vote => vote.user.toString() !== userId.toString());
    } else {
      this.votes.downvotes.push({ user: userId });
    }
  }
  
  // Update persistent voteScore
  this.voteScore = this.votes.upvotes.length - this.votes.downvotes.length;
  
  return this.save();
};

// Increment view count
postSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);
