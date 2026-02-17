import React from 'react';
import './MessageBubble.css';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  // Format time
  const timeString = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? 'U' : 'AI'}
      </div>
      <div className="message-content">
        <p>{message.content}</p>
        {message.id === 'streaming' && <span className="streaming-cursor">▋</span>}
        <div className="message-time">{timeString}</div>
      </div>
    </div>
  );
}

export default MessageBubble;
