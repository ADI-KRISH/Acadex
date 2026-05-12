const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');
const { validateCommentCreation, validateCommentUpdate } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'asc' } = req.query;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get top-level comments (no parent)
    const comments = await Comment.find({
      post: postId,
      parent: null,
      status: 'active'
    })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate({
        path: 'replies',
        match: { status: 'active' },
        populate: {
          path: 'author',
          select: 'username profile.firstName profile.lastName profile.avatar'
        },
        options: { sort: { createdAt: 1 } }
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({
      post: postId,
      parent: null,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalComments: total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/comments/:id
// @desc    Get single comment by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('post', 'title')
      .populate('parent', 'content author');

    if (!comment || comment.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.json({
      success: true,
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', verifyToken, validateCommentCreation, async (req, res) => {
  try {
    const { content, post, parent } = req.body;

    // Verify post exists
    const postDoc = await Post.findById(post);
    if (!postDoc || postDoc.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // If it's a reply, verify parent comment exists
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.status === 'deleted') {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post,
      parent: parent || null
    });

    await comment.save();

    // Update post answer count
    await Post.findByIdAndUpdate(post, {
      $inc: { answerCount: 1 }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.answersGiven': 1 }
    });

    // Add to parent's replies if it's a reply
    if (parent) {
      await Comment.findByIdAndUpdate(parent, {
        $push: { replies: comment._id }
      });
    }

    // Create notifications
    const notifications = [];

    // Notify post author (if not self-commenting)
    if (postDoc.author.toString() !== req.user._id.toString()) {
      notifications.push({
        recipient: postDoc.author,
        sender: req.user._id,
        type: parent ? 'comment_reply' : 'answer',
        title: parent ? 'Reply to your comment' : 'New answer to your question',
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} ${parent ? 'replied to your comment' : 'answered your question'} on "${postDoc.title}"`,
        relatedPost: post,
        relatedComment: comment._id
      });
    }

    // Notify parent comment author (if different from post author and self)
    if (parent) {
      const parentComment = await Comment.findById(parent).populate('author');
      if (parentComment.author._id.toString() !== req.user._id.toString() && 
          parentComment.author._id.toString() !== postDoc.author.toString()) {
        notifications.push({
          recipient: parentComment.author._id,
          sender: req.user._id,
          type: 'comment_reply',
          title: 'Reply to your comment',
          message: `${req.user.profile.firstName} ${req.user.profile.lastName} replied to your comment`,
          relatedPost: post,
          relatedComment: comment._id
        });
      }
    }

    // Create notifications in parallel
    if (notifications.length > 0) {
      await Promise.all(
        notifications.map(notif => Notification.createNotification(notif))
      );
    }

    // Populate comment data
    await comment.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comment creation'
    });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private (comment owner only)
router.put('/:id', verifyToken, validateCommentUpdate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment owner
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own comments.'
      });
    }

    comment.content = req.body.content;
    await comment.save();

    await comment.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment
      }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comment update'
    });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (comment owner only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions
    const user = req.user;
    const isOwner = comment.author.toString() === user._id.toString();
    const isCR = user.role === 'cr';
    const isFaculty = user.role === 'faculty';
    const isAdmin = user.role === 'admin';

    // Log for debugging
    console.log(`Comment delete permission check: user=${user._id}, role=${user.role}, isOwner=${isOwner}`);

    if (!isOwner && !isCR && !isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this comment.'
      });
    }

    // Soft delete
    comment.status = 'deleted';
    comment.moderatedBy = req.user._id;
    comment.moderatedAt = new Date();
    comment.moderationReason = 'Deleted by user';
    await comment.save();

    // Update post answer count
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { answerCount: -1 }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during comment deletion'
    });
  }
});

// @route   POST /api/comments/:id/vote
// @desc    Vote on comment
// @access  Private
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    const comment = await Comment.findById(req.params.id);
    
    if (!comment || comment.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.toggleVote(req.user._id, voteType);

    // Create notification for comment author (if not self-voting)
    if (comment.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: comment.author,
        sender: req.user._id,
        type: 'vote',
        title: `${voteType === 'upvote' ? 'Upvote' : 'Downvote'} on your answer`,
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} your answer`,
        relatedPost: comment.post,
        relatedComment: comment._id
      });
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        votes: comment.votes,
        voteScore: comment.voteScore
      }
    });
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during voting'
    });
  }
});



module.exports = router;
