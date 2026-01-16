import React from 'react';
import { ChatProvider } from './contexts/ChatContext';
import ChatLayout from './components/ChatLayout';
import './App.css';

function App() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}

export default App;
