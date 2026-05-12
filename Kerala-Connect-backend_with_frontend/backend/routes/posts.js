const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { verifyToken, authorize, canModify } = require('../middleware/auth');
const { validatePostCreation, validatePostUpdate } = require('../middleware/validation');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
// @access  Public (with optional auth)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      class: className,
      stream,
      category,
      tags,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { status: 'active' };
    
    if (author) {
      filter.author = author;
    }
    
    // Multi-tenancy logic: if className is AIE-A, also show posts for AIE
    if (className) {
      const streamPrefix = className.split('-')[0]; // e.g. AIE
      filter.$or = [
        { class: className },
        { class: streamPrefix }
      ];
    }
    
    if (stream) {
      // If we already have $or, we might need to merge, but usually only one is used
      if (filter.$or) {
        filter.$or.push({ stream: stream });
      } else {
        filter.stream = stream;
      }
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(filter)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(filter);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public (with optional auth)
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('bestAnswer', 'content author createdAt');

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    await post.incrementViews();

    res.json({
      success: true,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Middleware to parse JSON strings from FormData (e.g. tags)
const parseFormData = (req, res, next) => {
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (e) {
      req.body.tags = req.body.tags.split(',').map(tag => tag.trim());
    }
  }
  next();
};

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', verifyToken, upload.array('attachments', 5), parseFormData, validatePostCreation, async (req, res) => {
  try {
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/posts/${file.filename}`
    })) : [];

    const postData = {
      ...req.body,
      attachments,
      author: req.user._id
    };

    const post = new Post(postData);
    await post.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.questionsAsked': 1 }
    });

    // Populate author info
    await post.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    // Create notifications for all students in the same class
    try {
      const classMembers = await User.find({
        'academic.class': post.class,
        _id: { $ne: req.user._id },
        isActive: true
      });

      const notifications = classMembers.map(member => ({
        recipient: member._id,
        sender: req.user._id,
        type: 'announcement', // Using announcement type for new questions
        title: 'New Question Posted',
        message: `${req.user.profile.firstName} posted: ${post.title}`,
        relatedPost: post._id
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifyError) {
      console.error('Failed to send new post notifications:', notifyError);
      // Don't fail the post creation if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during post creation'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private (owner, CR for class, or admin)
router.put('/:id', verifyToken, validatePostUpdate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const user = req.user;
    const isOwner = post.author.toString() === user._id.toString();
    const isCR = user.role === 'cr';
    const isFaculty = user.role === 'faculty';
    const isAdmin = user.role === 'admin';

    // Log for debugging
    console.log(`Permission check: user=${user._id}, role=${user.role}, isOwner=${isOwner}`);

    if (!isOwner && !isCR && !isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this post.'
      });
    }

    // Update post
    const allowedUpdates = ['title', 'content', 'tags'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(post, updates);
    await post.save();

    await post.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during post update'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private (owner, CR for class, or admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const user = req.user;
    const isOwner = post.author.toString() === user._id.toString();
    const isCR = user.role === 'cr';
    const isFaculty = user.role === 'faculty';
    const isAdmin = user.role === 'admin';

    // Log for debugging
    console.log(`Delete permission check: user=${user._id}, role=${user.role}, isOwner=${isOwner}, isCR=${isCR}, isFaculty=${isFaculty}`);

    if (!isOwner && !isCR && !isFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this post.'
      });
    }

    // Soft delete
    post.status = 'deleted';
    post.moderatedBy = user._id;
    post.moderatedAt = new Date();
    post.moderationReason = req.body.reason || 'Deleted by user';
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during post deletion'
    });
  }
});

// @route   POST /api/posts/:id/vote
// @desc    Vote on post
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

    const post = await Post.findById(req.params.id);
    
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.toggleVote(req.user._id, voteType);

    // Create notification for post author (if not self-voting)
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.createNotification({
        recipient: post.author,
        sender: req.user._id,
        type: 'vote',
        title: `${voteType === 'upvote' ? 'Upvote' : 'Downvote'} on your post`,
        message: `${req.user.profile.firstName} ${req.user.profile.lastName} ${voteType === 'upvote' ? 'upvoted' : 'downvoted'} your post: "${post.title}"`,
        relatedPost: post._id
      });
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        votes: post.votes,
        voteScore: post.voteScore
      }
    });
  } catch (error) {
    console.error('Vote post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during voting'
    });
  }
});

// @route   POST /api/posts/:id/best-answer
// @desc    Mark comment as best answer
// @access  Private (post owner only)
router.post('/:id/best-answer', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.body;

    const post = await Post.findById(req.params.id);
    
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is post owner
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only post owner can mark best answer.'
      });
    }

    const comment = await Comment.findById(commentId);
    
    if (!comment || comment.post.toString() !== post._id.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Mark comment as best answer
    await comment.markAsBestAnswer();

    // Update post
    post.bestAnswer = comment._id;
    post.isAnswered = true;
    await post.save();

    // Update comment author stats
    // helpfulVotes increment removed

    // Create notification for comment author
    await Notification.createNotification({
      recipient: comment.author,
      sender: req.user._id,
      type: 'answer',
      title: 'Your answer was marked as best!',
      message: `Your answer on "${post.title}" was marked as the best answer.`,
      relatedPost: post._id,
      relatedComment: comment._id
    });

    res.json({
      success: true,
      message: 'Best answer marked successfully'
    });
  } catch (error) {
    console.error('Mark best answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/posts/search
// @desc    Search posts
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const posts = await Post.find({
      $text: { $search: query },
      status: 'active'
    })
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      $text: { $search: query },
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
});

// @route   POST /api/posts/:id/pin
// @desc    Toggle pin on post
// @access  Private (CR for class, or admin)
router.post('/:id/pin', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const user = req.user;
    const isCR = user.role === 'cr' && post.class === user.academic.class;
    const isAdmin = user.role === 'admin';

    if (!isCR && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only CR or Admin can pin posts.'
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { isPinned: post.isPinned }
    });
  } catch (error) {
    console.error('Pin post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during pinning'
    });
  }
});

module.exports = router;
