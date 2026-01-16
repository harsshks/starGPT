const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { summarizeConversation } = require('./geminiService');

const DEFAULT_MAX_MESSAGES = 40;
const DEFAULT_RECENT_MESSAGES_TO_KEEP = 20;

/**
 * Build the conversation context for a new Gemini call.
 * Combines:
 *  - system behavior prompt
 *  - stored summary (if any)
 *  - last N messages (sliding window)
 *  - latest user input
 *
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {string} params.latestUserInput
 * @param {string} [params.systemPrompt]
 * @param {number} [params.maxMessages]
 * @returns {Promise<{conversation, contextMessages}>}
 */
async function buildConversationContext({
  conversationId,
  latestUserInput,
  systemPrompt,
  maxMessages = DEFAULT_MAX_MESSAGES,
}) {
  const conversation = await Conversation.findById(conversationId).lean();
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  const baseSystemPrompt =
    systemPrompt ||
    'You are StarGPT, a helpful AI assistant. Respond clearly, concisely, and honestly. ' +
      'Adjust your answers based on the conversation mode: default, interview, or code.';

  // Start with system behavior
  const contextMessages = [
    {
      role: 'system',
      content: `${baseSystemPrompt}\n\nCurrent mode: ${conversation.mode}.`,
    },
  ];

  // Include stored summary if present
  if (conversation.summary) {
    contextMessages.push({
      role: 'system',
      content: `Summary of previous conversation:\n${conversation.summary}`,
    });
  }

  // Fetch last N messages in this conversation (sliding window)
  const recentMessages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(maxMessages)
    .lean();

  // Reverse to chronological order
  recentMessages.reverse();

  for (const m of recentMessages) {
    contextMessages.push({
      role: m.role,
      content: m.content,
    });
  }

  // Append latest user input as the final user message
  contextMessages.push({
    role: 'user',
    content: latestUserInput,
  });

  return { conversation, contextMessages };
}

/**
 * When message count exceeds a threshold, summarize older messages and
 * update the conversation summary, then delete or archive those old messages.
 *
 * Strategy:
 *  - Keep the most recent `recentToKeep` messages as raw history.
 *  - Summarize all earlier messages + existing summary into a new summary.
 *  - Store summary on conversation and delete older messages.
 *
 * @param {Object} params
 * @param {string} params.conversationId
 * @param {number} [params.threshold] - total messages threshold to trigger summarization
 * @param {number} [params.recentToKeep] - number of most recent messages to keep as-is
 * @returns {Promise<boolean>} whether summarization was performed
 */
async function maybeSummarizeConversation({
  conversationId,
  threshold = DEFAULT_MAX_MESSAGES,
  recentToKeep = DEFAULT_RECENT_MESSAGES_TO_KEEP,
}) {
  const totalMessages = await Message.countDocuments({ conversationId });
  if (totalMessages <= threshold) {
    return false;
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  const toSummarizeCount = Math.max(0, totalMessages - recentToKeep);
  if (toSummarizeCount <= 0) {
    return false;
  }

  // Get the oldest messages that will be summarized
  const olderMessages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(toSummarizeCount)
    .lean();

  if (!olderMessages.length) {
    return false;
  }

  const summary = await summarizeConversation({
    messages: olderMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    existingSummary: conversation.summary,
  });

  conversation.summary = summary;
  conversation.lastSummarizedAt = new Date();
  await conversation.save();

  // Delete summarized messages to keep collection smaller.
  const olderIds = olderMessages.map((m) => m._id);
  await Message.deleteMany({ _id: { $in: olderIds } });

  return true;
}

module.exports = {
  buildConversationContext,
  maybeSummarizeConversation,
};

