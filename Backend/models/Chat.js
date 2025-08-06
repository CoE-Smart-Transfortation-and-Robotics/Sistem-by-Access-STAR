const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  project_id: { type: String, default: 'default' },
  sender_id: Number,
  receiver_id: Number,
  message: String,
  timestamp: { type: Date, default: Date.now },
  participants: [Number],
  urgency_analysis: {
    is_urgent: Boolean,
    confidence: Number,
    category: String,
    reason: String,
    analyzed_at: Date
  },
  priority_level: { type: String, enum: ['high', 'medium', 'low', null], default: null },
  sender_role: String,
  receiver_role: String
});

module.exports = mongoose.model('Chat', ChatSchema);