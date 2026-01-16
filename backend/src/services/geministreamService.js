const fetch = require("node-fetch");

async function streamGeminiResponse({ messages, temperature = 0.7 }) {
  // Read environment variables at runtime, not at module load time
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
  
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const STREAM_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL}:streamGenerateContent?alt=sse&key=${API_KEY}`;

  console.log(`Making request to Gemini with model: ${MODEL}`); // Debug log

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(STREAM_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const err = new Error("Gemini REST streaming failed");
    err.status = response.status;
    err.details = text;
    throw err;
  }

  return response.body; // Node.js ReadableStream
}

module.exports = { streamGeminiResponse };
