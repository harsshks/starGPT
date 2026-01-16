const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const { apiRateLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Apply general API rate limiting to all routes (chat routes have their own stricter limiter)
app.use('/api', apiRateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api', messageRoutes);
app.use('/api', chatRoutes);

// 404 + error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

