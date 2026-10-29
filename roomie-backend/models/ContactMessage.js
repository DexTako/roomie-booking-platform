const mongoose = require('mongoose');

// A message sent through the public Contact page
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
  subject: { type: String, required: true, trim: true, maxlength: 150 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  // Set when the sender was logged in
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
  // The reply the admin emailed back to the sender
  adminReply: { type: String, default: '', maxlength: 3000 },
  repliedAt: { type: Date, default: null },
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
