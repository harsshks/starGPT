const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { listMessagesForConversation } = require('../controllers/messageController');

const router = express.Router();

// Protected route: fetch messages for a conversation
router.get('/conversations/:id/messages', authMiddleware, listMessagesForConversation);

module.exports = router;

