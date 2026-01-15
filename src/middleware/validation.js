const logger = require('../utils/logger');

/**
 * Simple middleware to check required fields in req.body
 * @param {Array} fields - list of required fields
 */
const validateBody = (fields = []) => {
  return (req, res, next) => {
    try {
      const missingFields = [];

      fields.forEach(field => {
        if (
          req.body[field] === undefined ||
          req.body[field] === null ||
          req.body[field] === ''
        ) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: `Missing required fields: ${missingFields.join(', ')}`
          }
        });
      }

      next();

    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed'
        }
      });
    }
  };
};

module.exports = validateBody;
