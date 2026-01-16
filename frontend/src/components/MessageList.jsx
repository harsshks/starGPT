import React, { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

function MessageList() {
  const { messages, streamingText, isStreaming, activeConversationId } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isStreaming]);

  if (!activeConversationId) {
    return null;
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isStreaming && streamingText && (
        <MessageBubble
          message={{
            id: 'streaming',
            role: 'assistant',
            content: streamingText,
            createdAt: new Date().toISOString(),
          }}
          isStreaming={true}
        />
      )}
      {isStreaming && !streamingText && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
