/**
 * SSE streaming service using fetch (supports custom headers unlike EventSource)
 */
import { API_BASE_URL } from './api';

export function createChatStream({ conversationId, message, token, onChunk, onDone, onError }) {
  const query = new URLSearchParams({
    conversationId,
    message,
  }).toString();

  const url = `${API_BASE_URL}/chat/stream?${query}`;

  const controller = new AbortController();

  fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                onChunk(parsed.chunk);
              }
            } catch (e) {
              // Ignore non-JSON data
            }
          } else if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            if (eventType === 'done') {
              onDone();
              return;
            } else if (eventType === 'error') {
              onError(new Error('Stream error'));
              return;
            }
          }
        }
      }

      onDone();
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err);
      }
    });

  return {
    abort: () => controller.abort(),
  };
}
