const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// GET /api/conversations/:id/messages
async function listMessagesForConversation(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid conversation id' });
    }

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user.id,
    }).lean();

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    const response = messages.map((m) => ({
      id: m._id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      tokenCount: m.tokenCount,
      createdAt: m.createdAt,
    }));

    res.json({
      conversation: {
        id: conversation._id,
        title: conversation.title,
        mode: conversation.mode,
        createdAt: conversation.createdAt,
      },
      messages: response,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMessagesForConversation,
};

