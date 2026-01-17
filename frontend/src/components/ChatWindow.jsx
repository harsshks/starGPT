import React, { useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatWindow.css';

function ChatWindow({ onToggleSidebar }) {
  const { activeConversationId, messages, loading } = useChat();

  if (!activeConversationId) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <button className="mobile-menu-btn" onClick={onToggleSidebar}>
            ☰
          </button>
          <h3>Chat</h3>
        </div>
        <div className="empty-chat">
          <h3>Welcome to StarGPT</h3>
          <p>Select a conversation from the sidebar or create a new one to start chatting with AI.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <h3>Chat</h3>
      </div>
      <MessageList />
      <MessageInput />
    </div>
  );
}

export default ChatWindow;
