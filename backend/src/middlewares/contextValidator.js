const { MAX_CONTEXT_TOKENS, MAX_USER_MESSAGE_TOKENS } = require('../config/limits');
const { estimateTokens, validateTokenLimit } = require('../utils/tokenCounter');

/**
 * Middleware to validate context size before processing chat requests
 * Checks:
 * 1. User message doesn't exceed max length
 * 2. Total context (including history) doesn't exceed max tokens
 */
async function validateContext(req, res, next) {
  try {
    const latestUserInput = req.query.message || req.body.message;

    if (!latestUserInput) {
      return next(); // Let other validators handle missing message
    }

    // Check user message size
    const userMessageTokens = estimateTokens(latestUserInput);
    if (userMessageTokens > MAX_USER_MESSAGE_TOKENS) {
      return res.status(400).json({
        error: 'Message too long',
        message: `User message exceeds maximum token limit of ${MAX_USER_MESSAGE_TOKENS}. Current: ${userMessageTokens} tokens.`,
        maxTokens: MAX_USER_MESSAGE_TOKENS,
        currentTokens: userMessageTokens,
      });
    }

    // Note: Full context validation happens in the controller after building context
    // This is a pre-check for the user message only
    // The controller will validate full context before calling Gemini

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Validates a full message context array
 * Used in controllers before calling Gemini API
 * @param {Array} contextMessages - Array of message objects
 * @returns {{valid: boolean, tokenCount: number, error?: string}}
 */
function validateFullContext(contextMessages) {
  return validateTokenLimit(contextMessages, MAX_CONTEXT_TOKENS);
}

module.exports = {
  validateContext,
  validateFullContext,
};
