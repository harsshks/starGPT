const { GoogleGenerativeAI } = require('@google/generative-ai');

// Simple singleton wrapper around the Gemini client
let client;

function getClient() {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  client = new GoogleGenerativeAI(apiKey);
  return client;
}

function getModel() {
  const genAI = getClient();

  // MUST use -latest models with the current SDK
  const modelName =
    process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';

  return genAI.getGenerativeModel({
    model: modelName,
  });
}


/**
 * Calls Gemini with a chat-style prompt.
 * Includes enhanced error handling for production safety.
 * 
 * @param {Object} params
 * @param {Array} params.messages - array of { role: 'user'|'assistant'|'system', content: string }
 * @param {number} [params.temperature]
 * @returns {Promise<string>} full model text response
 * @throws {Error} Gemini API errors with proper error codes
 */
async function generateChatCompletion({ messages, temperature = 0.7 }) {
  try {
    const model = getModel();

    // Map our internal message format to Gemini "contents"
    const contents = messages.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role, // Gemini doesn't have 'system'; treat as user context
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature,
      },
    });

    const response = result.response;
    const text = response.text ? response.text() : response.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || '';
  } catch (err) {
    // Handle Gemini API errors gracefully
    const error = new Error('Gemini API error');
    error.status = 503;
    error.originalError = err;
    error.code = err.code || 'GEMINI_API_ERROR';

    // Check for specific error types
    if (err.message?.includes('quota') || err.message?.includes('429')) {
      error.message = 'API quota exceeded. Please try again later.';
      error.code = 'QUOTA_EXCEEDED';
      error.status = 429;
    } else if (err.message?.includes('invalid') || err.message?.includes('400')) {
      error.message = 'Invalid request to Gemini API.';
      error.code = 'INVALID_REQUEST';
      error.status = 400;
    } else if (err.message?.includes('permission') || err.message?.includes('403')) {
      error.message = 'API key permission denied.';
      error.code = 'PERMISSION_DENIED';
      error.status = 403;
    }

    throw error;
  }
}

/**
 * Streaming chat completion using Gemini's streaming API.
 * Returns an async iterator that yields text chunks as they arrive.
 * Includes enhanced error handling for production safety.
 *
 * @param {Object} params
 * @param {Array} params.messages - array of { role, content }
 * @param {number} [params.temperature]
 * @returns {AsyncGenerator<string>}
 * @throws {Error} Gemini API errors with proper error codes
 */

/**
 * Summarize a set of messages plus an optional existing summary.
 * @param {Object} params
 * @param {Array} params.messages - array of { role, content }
 * @param {string|null} [params.existingSummary]
 * @returns {Promise<string>} new summary text
 */
async function summarizeConversation({ messages, existingSummary }) {
  const systemPrompt =
    'You are a summarization assistant. Given a chat history, ' +
    'produce a concise summary that preserves important facts, decisions, and user preferences. ' +
    'Write in neutral tone.';

  const promptMessages = [
    { role: 'system', content: systemPrompt },
  ];

  if (existingSummary) {
    promptMessages.push({
      role: 'system',
      content: `Existing summary of earlier conversation:\n${existingSummary}`,
    });
  }

  // Compress full history into a plain-text block for efficiency
  const historyText = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n');

  promptMessages.push({
    role: 'user',
    content:
      'Here is additional chat history to integrate into the existing summary (if any):\n\n' +
      historyText +
      '\n\nPlease return ONLY the updated summary text.',
  });

  const summary = await generateChatCompletion({ messages: promptMessages, temperature: 0.3 });
  return summary.trim();
}

module.exports = {
  generateChatCompletion,
  summarizeConversation,
};

