const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token and attach user info to req.user
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_AUTH_HEADER',
          message: 'Authorization header missing'
        }
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer token

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Token missing'
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user info
    next();

  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token is invalid or expired'
      }
    });
  }
};

module.exports = auth;
