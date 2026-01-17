import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { conversationAPI, authAPI, setAuthToken } from '../services/api';
import { createChatStream } from '../services/chatStream';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize: check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      authAPI
        .getMe()
        .then((data) => {
          setUser(data.user);
          loadConversations();
        })
        .catch(() => {
          setAuthToken(null);
        });
    }
  }, []);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const convos = await conversationAPI.list();
      setConversations(convos);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await conversationAPI.getMessages(conversationId);
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch to a different conversation
  const switchConversation = useCallback(
    async (conversationId) => {
      setActiveConversationId(conversationId);
      setStreamingText('');
      setIsStreaming(false);
      await loadMessages(conversationId);
    },
    [loadMessages]
  );

  // Create a new conversation
  const createConversation = useCallback(
    async (title, mode = 'default') => {
      try {
        const newConv = await conversationAPI.create(title, mode);
        setConversations((prev) => [newConv, ...prev]);
        await switchConversation(newConv.id);
        return newConv;
      } catch (err) {
        console.error('Failed to create conversation:', err);
        throw err;
      }
    },
    [switchConversation]
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (conversationId) => {
      try {
        await conversationAPI.delete(conversationId);
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to delete conversation:', err);
        throw err;
      }
    },
    [activeConversationId]
  );

  // Send a message and stream the response
  const sendMessage = useCallback(
    async (content) => {
      if (!activeConversationId || !content.trim()) return;

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Add user message to UI immediately
      const userMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsStreaming(true);
      setStreamingText('');
      setError(null);

      let streamController = null;

      try {
        streamController = createChatStream({
          conversationId: activeConversationId,
          message: content.trim(),
          token,
          onChunk: (chunk) => {
            setStreamingText((prev) => prev + chunk);
          },
          onDone: async () => {
            setIsStreaming(false);
            // Reload messages to get the persisted assistant message
            await loadMessages(activeConversationId);
            setStreamingText('');
          },
          onError: (err) => {
            setIsStreaming(false);
            setError('Streaming error: ' + err.message);
            setStreamingText('');
          },
        });
      } catch (err) {
        setIsStreaming(false);
        setError('Failed to send message');
        console.error(err);
      }

      return streamController;
    },
    [activeConversationId, loadMessages]
  );

  // Login
  const login = useCallback(async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setAuthToken(data.token);
      setUser(data.user);
      await loadConversations();
      return data;
    } catch (err) {
      throw err;
    }
  }, [loadConversations]);

  // Register
  const register = useCallback(async (email, password) => {
    try {
      const data = await authAPI.register(email, password);
      setAuthToken(data.token);
      setUser(data.user);
      await loadConversations();
      return data;
    } catch (err) {
      throw err;
    }
  }, [loadConversations]);

  // Logout
  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setConversations([]);
    setActiveConversationId(null);
    setMessages([]);
    setStreamingText('');
    setIsStreaming(false);
  }, []);

  const value = {
    user,
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    streamingText,
    loading,
    error,
    loadConversations,
    loadMessages,
    switchConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    login,
    register,
    logout,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
