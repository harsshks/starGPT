const express = require('express');
const { chatStreamHandler, authMiddleware } = require('../controllers/chatController');
const { chatRateLimiter } = require('../middlewares/rateLimiter');
const { validateContext } = require('../middlewares/contextValidator');

const router = express.Router();

// SSE chat streaming endpoint (protected)
// Middleware order: auth → rate limit → context validation → handler
router.get(
  '/chat/stream',
  authMiddleware,
  chatRateLimiter,
  validateContext,
  chatStreamHandler
);

module.exports = router;

