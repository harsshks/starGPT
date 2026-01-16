import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import './MessageInput.css';

function MessageInput() {
  const { sendMessage, isStreaming, activeConversationId } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !activeConversationId) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'AI is responding...' : 'Type your message...'}
          disabled={isStreaming || !activeConversationId}
          rows={1}
          className="message-input"
        />
        <button type="submit" disabled={!input.trim() || isStreaming || !activeConversationId} className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
