const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_MESSAGES_PER_MINUTE } = require('../config/limits');

/**
 * Rate limiter for chat endpoints
 * Limits requests per user (identified by req.user.id from auth middleware)
 */
const { ipKeyGenerator } = rateLimit;

const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: RATE_LIMIT_MESSAGES_PER_MINUTE,
  message: {
    error: 'Rate limit exceeded',
    message: `Too many requests. Maximum ${RATE_LIMIT_MESSAGES_PER_MINUTE} messages per minute.`,
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  // Use user ID as the key for rate limiting (requires auth middleware to run first)
  // Fallback to a safe IP-based key using ipKeyGenerator helper for IPv6 support
  keyGenerator: (req, res) => {
    return req.user?.id || ipKeyGenerator(req, res);
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * General API rate limiter (less strict, for non-chat endpoints)
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  chatRateLimiter,
  apiRateLimiter,
};
