const authMiddleware = require('../middlewares/authMiddleware');
const Message = require('../models/Message');
const { streamGeminiResponse } = require("../services/geministreamService");
const { buildConversationContext, maybeSummarizeConversation } = require('../services/memoryService');
const { validateFullContext } = require('../middlewares/contextValidator');
const { logChatCompletion } = require('../services/usageLogger');

/**
 * SSE endpoint to stream Gemini responses.
 * Includes production safety features:
 * - Context size validation
 * - Usage logging
 * - Enhanced error handling
 *
 * GET /api/chat/stream?conversationId=...&message=...
 *
 * Expects Authorization: Bearer <token> header (handled by authMiddleware in routes).
 */
async function chatStreamHandler(req, res, next) {
  const conversationId = req.query.conversationId;
  const latestUserInput = req.query.message;
  const startTime = Date.now();

  if (!conversationId || !latestUserInput) {
    return res.status(400).json({ message: 'conversationId and message are required as query params' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Disable response buffering in some proxies
  res.setHeader('X-Accel-Buffering', 'no');

  // Send an initial event so client knows the stream is open
  res.write(`event: open\ndata: "stream opened"\n\n`);

  let closed = false;
  req.on('close', () => {
    closed = true;
  });

  let userMessage;
  let fullAssistantText = '';

  try {
    // Store the user message in the DB
    userMessage = await Message.create({
      conversationId,
      role: 'user',
      content: latestUserInput,
    });

    // Build context for Gemini (system prompt + summary + recent messages + latest input)
    const { contextMessages } = await buildConversationContext({
      conversationId,
      latestUserInput,
    });

    // Validate context size before calling Gemini (cost control)
    const contextValidation = validateFullContext(contextMessages);
    if (!contextValidation.valid) {
      const error = new Error(contextValidation.error);
      error.status = 400;
      error.code = 'CONTEXT_TOO_LARGE';
      throw error;
    }

    // Stream Gemini response with error handling
    try {
      const geminiStream = await streamGeminiResponse({
        messages: contextMessages,
      });
      
      let buffer = "";
      
      geminiStream.on("data", (chunk) => {
        if (closed) return;
      
        const chunkStr = chunk.toString();
        
        // Split by lines and process each data line
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const data = line.replace('data: ', '').trim();
          if (!data || data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
      
            if (text) {
              fullAssistantText += text;
              res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
            }
          } catch (parseErr) {
            // Ignore partial JSON parsing errors
          }
        }
      });
      
      await new Promise((resolve, reject) => {
        geminiStream.on("end", resolve);
        geminiStream.on("error", reject);
      });      
    } catch (streamErr) {
      // Log usage even on error
      await logChatCompletion({
        userId: req.user.id,
        conversationId,
        userMessage: latestUserInput,
        assistantMessage: fullAssistantText,
        startTime,
        success: false,
        error: streamErr,
      });

      // Re-throw to be handled by outer catch
      throw streamErr;
    }

    if (!closed) {
      // Persist the assistant message
      await Message.create({
        conversationId,
        role: 'assistant',
        content: fullAssistantText,
      });

      // Log successful usage
      await logChatCompletion({
        userId: req.user.id,
        conversationId,
        userMessage: latestUserInput,
        assistantMessage: fullAssistantText,
        startTime,
        success: true,
      });

      // Optionally trigger summarization in the background
      maybeSummarizeConversation({ conversationId }).catch((err) =>
        console.error('Summarization error:', err)
      );

      // Signal completion to client
      res.write('event: done\ndata: "complete"\n\n');
      res.end();
    }
  } catch (err) {
    console.error('Chat stream error:', err);

    // Log failed usage
    if (userMessage) {
      await logChatCompletion({
        userId: req.user.id,
        conversationId,
        userMessage: latestUserInput,
        assistantMessage: fullAssistantText,
        startTime,
        success: false,
        error: err,
      });
    }

    // Handle errors gracefully
    if (!res.headersSent) {
      return next(err);
    }

    if (!closed) {
      const errorPayload = JSON.stringify({
        message: err.message || 'Error during streaming',
        code: err.code,
      });
      res.write(`event: error\ndata: ${errorPayload}\n\n`);
      res.end();
    }
  }
}

module.exports = {
  chatStreamHandler,
  authMiddleware, // exported for route composition
};

