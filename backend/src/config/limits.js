/**
 * Configurable limits for production safety and cost control
 * All values can be overridden via environment variables
 */

module.exports = {
  // Rate limiting: messages per minute per user
  RATE_LIMIT_MESSAGES_PER_MINUTE: parseInt(process.env.RATE_LIMIT_MESSAGES_PER_MINUTE || '20', 10),

  // Token limits
  MAX_CONTEXT_TOKENS: parseInt(process.env.MAX_CONTEXT_TOKENS || '32000', 10), // Gemini 1.5 Pro supports up to 1M, but we cap lower for cost
  MAX_USER_MESSAGE_TOKENS: parseInt(process.env.MAX_USER_MESSAGE_TOKENS || '4000', 10),
  MAX_RESPONSE_TOKENS: parseInt(process.env.MAX_RESPONSE_TOKENS || '8000', 10),

  // Approximate tokens per character (rough estimate: 1 token ≈ 4 characters for English)
  TOKENS_PER_CHAR: parseFloat(process.env.TOKENS_PER_CHAR || '0.25'),

  // Usage logging
  LOG_USAGE: process.env.LOG_USAGE !== 'false', // Default: true
};
