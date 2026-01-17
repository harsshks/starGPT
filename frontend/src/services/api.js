import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Load token on init
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

// Auth API
export const authAPI = {
  register: async (email, password) => {
    const res = await api.post('/auth/register', { email, password });
    return res.data;
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Conversation API
export const conversationAPI = {
  create: async (title, mode = 'default') => {
    const res = await api.post('/conversations', { title, mode });
    return res.data;
  },
  list: async () => {
    const res = await api.get('/conversations');
    return res.data.conversations;
  },
  getMessages: async (conversationId) => {
    const res = await api.get(`/conversations/${conversationId}/messages`);
    return res.data;
  },
  update: async (conversationId, updates) => {
    const res = await api.patch(`/conversations/${conversationId}`, updates);
    return res.data;
  },
  delete: async (conversationId) => {
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
  },
};

export default api;
