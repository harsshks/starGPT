const Message = require('../models/Message');
const { estimateTokens } = require('../utils/tokenCounter');
const { LOG_USAGE } = require('../config/limits');

/**
 * Log usage metrics for a user interaction
 * This helps track costs and identify abuse patterns
 * 
 * In production, you might want to:
 * - Store in a dedicated UsageLog collection
 * - Send to analytics service (e.g., DataDog, New Relic)
 * - Aggregate for billing/quota tracking
 */
async function logUsage({ userId, conversationId, userMessageTokens, assistantMessageTokens, durationMs, success, error }) {
  if (!LOG_USAGE) {
    return; // Skip logging if disabled
  }

  try {
    const logEntry = {
      userId,
      conversationId,
      timestamp: new Date(),
      userMessageTokens: userMessageTokens || 0,
      assistantMessageTokens: assistantMessageTokens || 0,
      totalTokens: (userMessageTokens || 0) + (assistantMessageTokens || 0),
      durationMs: durationMs || 0,
      success: success !== false,
      error: error || null,
    };

    // For now, log to console in structured format
    // In production, you'd write to a database or logging service
    console.log('[USAGE]', JSON.stringify(logEntry));

    // Optional: Store in database (create a UsageLog model if needed)
    // await UsageLog.create(logEntry);

    // Optional: Send to external analytics
    // await analyticsService.track('chat_message', logEntry);
  } catch (err) {
    // Don't fail the request if logging fails
    console.error('Failed to log usage:', err);
  }
}

/**
 * Calculate token usage from message content
 */
function calculateMessageTokens(content) {
  return estimateTokens(content || '');
}

/**
 * Log a chat completion event
 */
async function logChatCompletion({ userId, conversationId, userMessage, assistantMessage, startTime, success, error }) {
  const durationMs = startTime ? Date.now() - startTime : 0;
  const userTokens = calculateMessageTokens(userMessage);
  const assistantTokens = calculateMessageTokens(assistantMessage);

  await logUsage({
    userId,
    conversationId,
    userMessageTokens: userTokens,
    assistantMessageTokens: assistantTokens,
    durationMs,
    success,
    error: error?.message,
  });
}

module.exports = {
  logUsage,
  logChatCompletion,
  calculateMessageTokens,
};
