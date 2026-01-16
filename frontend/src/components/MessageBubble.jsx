import React from 'react';
import './MessageBubble.css';

function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-content">
        {message.content}
        {isStreaming && <span className="streaming-cursor">▋</span>}
      </div>
      <div className="message-time">
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  );
}

export default MessageBubble;
