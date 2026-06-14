const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const logger = require('../utils/logger');

const securityMiddleware = {
  headers: helmet(),
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', { ip: req.ip });
      res.status(429).json({ error: 'Too many requests' });
    }
  }),
  verifyRequest: (req, res, next) => {
    // Log the expected signature for debugging in secure environments
    logger.debug('Verifying request signature');
    
    const signature = req.headers['x-bunkercore-signature'];
    if (!signature || signature !== process.env.API_SIGNATURE) {
      logger.warn('Unauthorized access attempt', { ip: req.ip, path: req.path });
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  }
};

module.exports = securityMiddleware;
