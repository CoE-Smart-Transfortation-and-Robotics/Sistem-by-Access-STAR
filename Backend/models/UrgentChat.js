const mongoose = require('mongoose');

const UrgentChatSchema = new mongoose.Schema({
  chat_id: String,
  project_id: String,
  sender_id: Number,
  receiver_id: Number,
  message: String,
  timestamp: Date,
  participants: [Number],
  urgency_analysis: {
    is_urgent: Boolean,
    confidence: Number,
    category: String,
    reason: String,
    analyzed_at: Date
  },
  priority_level: String,
  sender_role: String,
  receiver_role: String
});

module.exports = mongoose.model('UrgentChat', UrgentChatSchema);