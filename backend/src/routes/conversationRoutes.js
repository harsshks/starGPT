const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createConversation,
  listUserConversations,
  updateConversation,
  deleteConversation,
} = require('../controllers/conversationController');

const router = express.Router();

// All conversation routes are protected
router.use(authMiddleware);

router.post('/', createConversation);
router.get('/', listUserConversations);
router.patch('/:id', updateConversation);
router.delete('/:id', deleteConversation);

module.exports = router;

