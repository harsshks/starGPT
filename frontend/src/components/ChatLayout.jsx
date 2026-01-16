import React, { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import LoginForm from './LoginForm';
import './ChatLayout.css';

function ChatLayout() {
  const { user } = useChat();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="chat-layout">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default ChatLayout;
