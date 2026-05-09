const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
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
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  }],
  isBestAnswer: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
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

// Indexes
commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ status: 1 });

// Virtual for vote score
commentSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

// Method to check if user voted
commentSchema.methods.hasUserVoted = function(userId, voteType) {
  if (voteType === 'upvote') {
    return this.votes.upvotes.some(vote => vote.user.toString() === userId.toString());
  } else if (voteType === 'downvote') {
    return this.votes.downvotes.some(vote => vote.user.toString() === userId.toString());
  }
  return false;
};

// Method to add/remove vote
commentSchema.methods.toggleVote = function(userId, voteType) {
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
  
  return this.save();
};

// Method to mark as best answer
commentSchema.methods.markAsBestAnswer = function() {
  this.isBestAnswer = true;
  return this.save();
};



module.exports = mongoose.model('Comment', commentSchema);
