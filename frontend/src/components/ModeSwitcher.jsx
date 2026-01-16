import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { conversationAPI } from '../services/api';
import './ModeSwitcher.css';

const MODES = ['default', 'interview', 'code'];

function ModeSwitcher({ conversationId, currentMode }) {
  const { loadConversations } = useChat();
  const [updating, setUpdating] = useState(false);

  const handleModeChange = async (newMode) => {
    if (newMode === currentMode || updating) return;

    setUpdating(true);
    try {
      await conversationAPI.update(conversationId, { mode: newMode });
      await loadConversations();
    } catch (err) {
      console.error('Failed to update mode:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mode-switcher">
      <label className="mode-label">Mode:</label>
      <div className="mode-buttons">
        {MODES.map((mode) => (
          <button
            key={mode}
            className={`mode-button ${mode === currentMode ? 'active' : ''}`}
            onClick={() => handleModeChange(mode)}
            disabled={updating}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModeSwitcher;
