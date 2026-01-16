const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['default', 'interview', 'code'],
      default: 'default',
      index: true,
    },
    summary: {
      type: String,
      default: null,
    },
    lastSummarizedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;

