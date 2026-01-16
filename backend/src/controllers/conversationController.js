const Conversation = require('../models/Conversation');

// POST /api/conversations
async function createConversation(req, res, next) {
  try {
    const { title, mode } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const conversation = await Conversation.create({
      userId: req.user.id,
      title,
      mode: mode || 'default',
    });

    res.status(201).json({
      id: conversation._id,
      userId: conversation.userId,
      title: conversation.title,
      mode: conversation.mode,
      createdAt: conversation.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/conversations
async function listUserConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const response = conversations.map((c) => ({
      id: c._id,
      userId: c.userId,
      title: c.title,
      mode: c.mode,
      createdAt: c.createdAt,
    }));

    res.json({ conversations: response });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/conversations/:id
async function updateConversation(req, res, next) {
  try {
    const { id } = req.params;
    const { title, mode } = req.body;

    const conversation = await Conversation.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (title !== undefined) {
      conversation.title = title;
    }
    if (mode !== undefined) {
      if (!['default', 'interview', 'code'].includes(mode)) {
        return res.status(400).json({ message: 'Invalid mode' });
      }
      conversation.mode = mode;
    }

    await conversation.save();

    res.json({
      id: conversation._id,
      userId: conversation.userId,
      title: conversation.title,
      mode: conversation.mode,
      createdAt: conversation.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createConversation,
  listUserConversations,
  updateConversation,
};

