import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import LoginForm from './LoginForm';
import './ChatLayout.css';

function ChatLayout() {
  const { user } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className={`chat-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <ChatWindow onToggleSidebar={toggleSidebar} />
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </div>
  );
}

export default ChatLayout;
