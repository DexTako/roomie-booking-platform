const mongoose = require('mongoose');

// One message in a booking conversation (customer <-> host, admin can join in)
const messageSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: { type: String, required: true },
  senderRole: {
    type: String,
    enum: ['customer', 'host', 'admin'],
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message cannot be empty'],
    trim: true,
    maxlength: [1000, 'Message must be 1000 characters or less']
  },
  readAt: { type: Date, default: null }
}, { timestamps: true });

messageSchema.index({ bookingId: 1, createdAt: 1 });
messageSchema.index({ recipientId: 1, readAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
