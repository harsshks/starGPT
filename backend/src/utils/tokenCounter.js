const { TOKENS_PER_CHAR } = require('../config/limits');

/**
 * Estimate token count for a given text string.
 * This is an approximation - actual tokenization varies by model.
 * 
 * Rough estimate: 1 token ≈ 4 characters for English text
 * For more accuracy, you could use a tokenizer library like 'gpt-tokenizer' or 'tiktoken'
 * 
 * @param {string} text - Text to count tokens for
 * @returns {number} Estimated token count
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  // Simple approximation: character count * tokens per char
  // This is conservative - actual tokens may be slightly less
  return Math.ceil(text.length * TOKENS_PER_CHAR);
}

/**
 * Estimate total tokens for an array of messages
 * @param {Array<{role: string, content: string}>} messages
 * @returns {number} Total estimated tokens
 */
function estimateMessageTokens(messages) {
  if (!Array.isArray(messages)) {
    return 0;
  }

  return messages.reduce((total, msg) => {
    return total + estimateTokens(msg.content || '');
  }, 0);
}

/**
 * Validate that a message array doesn't exceed token limits
 * @param {Array} messages - Array of message objects
 * @param {number} maxTokens - Maximum allowed tokens
 * @returns {{valid: boolean, tokenCount: number, error?: string}}
 */
function validateTokenLimit(messages, maxTokens) {
  const tokenCount = estimateMessageTokens(messages);

  if (tokenCount > maxTokens) {
    return {
      valid: false,
      tokenCount,
      error: `Context exceeds maximum token limit of ${maxTokens}. Current: ${tokenCount} tokens.`,
    };
  }

  return {
    valid: true,
    tokenCount,
  };
}

module.exports = {
  estimateTokens,
  estimateMessageTokens,
  validateTokenLimit,
};
