import React, { useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import ModeSwitcher from './ModeSwitcher';
import './Sidebar.css';

function Sidebar() {
  const {
    conversations,
    activeConversationId,
    switchConversation,
    createConversation,
    deleteConversation,
    logout,
    user,
  } = useChat();

  const handleNewChat = async () => {
    const title = `New Chat ${new Date().toLocaleTimeString()}`;
    await createConversation(title, 'default');
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>StarGPT</h2>
        <button className="new-chat-btn" onClick={handleNewChat}>
          + New Chat
        </button>
      </div>

      {activeConversation && (
        <div className="mode-switcher-container">
          <ModeSwitcher conversationId={activeConversationId} currentMode={activeConversation.mode} />
        </div>
      )}

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="empty-state">No conversations yet. Create one!</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${conv.id === activeConversationId ? 'active' : ''}`}
              onClick={() => switchConversation(conv.id)}
            >
              <div className="conversation-title">{conv.title}</div>
              <div className="conversation-meta">
                <span className="conversation-mode">{conv.mode}</span>
                <span className="conversation-date">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </span>
                <button
                  className="delete-conv-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this chat?')) {
                      deleteConversation(conv.id);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <span>{user.email}</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
