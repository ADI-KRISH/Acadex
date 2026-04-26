const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Check if user can modify resource (owner or admin/moderator)
const canModify = (resourceField = 'author') => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Admin can modify anything
      if (user.role === 'admin') {
        return next();
      }
      
      // CR can modify posts in their class
      if (user.role === 'cr' && req.body.class === user.academic.class) {
        return next();
      }
      
      // Check if user is the owner
      if (req.body[resourceField] && req.body[resourceField].toString() === user._id.toString()) {
        return next();
      }
      
      // For URL parameters (like /posts/:id)
      if (req.params.id) {
        const Model = require('../models/Post'); // This would need to be dynamic
        const resource = await Model.findById(req.params.id);
        if (resource && resource[resourceField].toString() === user._id.toString()) {
          return next();
        }
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own content.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking permissions.'
      });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authorize,
  canModify,
  optionalAuth
};
