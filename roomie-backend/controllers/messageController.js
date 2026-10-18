const mongoose = require('mongoose');
const Message = require('../models/Message');
const Booking = require('../models/Booking');

// Loads the booking and works out who the current user is talking to.
// Returns { error: {status, message} } when the user may not use this conversation.
const resolveConversation = async (req) => {
  const { bookingId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return { error: { status: 400, message: 'Invalid booking ID' } };
  }

  const booking = await Booking.findById(bookingId).populate('roomId', 'name hostId');
  if (!booking || !booking.roomId) {
    return { error: { status: 404, message: 'Booking not found' } };
  }

  const userId = req.user._id.toString();
  const hostId = booking.roomId.hostId.toString();
  const renterId = booking.renterId.toString();

  let recipientId;
  if (req.user.role === 'admin') {
    recipientId = renterId; // admin writes to the customer
  } else if (userId === renterId) {
    recipientId = hostId; // customer writes to the host
  } else if (userId === hostId) {
    recipientId = renterId; // host replies to the customer
  } else {
    return { error: { status: 403, message: 'You are not part of this conversation' } };
  }

  return { booking, recipientId };
};

// @desc    Get the messages of a booking (and mark the ones sent to me as read)
// @route   GET /api/messages/booking/:bookingId
// @access  Private (customer who booked, host of the room, admin)
exports.getThread = async (req, res) => {
  try {
    const { booking, error } = await resolveConversation(req);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    await Message.updateMany(
      { bookingId: booking._id, recipientId: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    const messages = await Message.find({ bookingId: booking._id }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      booking: {
        id: booking._id,
        roomName: booking.roomId.name,
        renterName: booking.renterName,
        status: booking.status
      },
      messages
    });
  } catch (err) {
    console.error('Get thread error:', err);
    res.status(500).json({ success: false, message: 'Could not load the messages. Please try again.' });
  }
};

// @desc    Send a message in a booking conversation
// @route   POST /api/messages/booking/:bookingId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please type a message first.' });
    }
    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: 'Message must be 1000 characters or less.' });
    }

    const { booking, recipientId, error } = await resolveConversation(req);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const message = await Message.create({
      bookingId: booking._id,
      roomId: booking.roomId._id,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      recipientId,
      text
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ success: false, message: 'Your message could not be sent. Please try again.' });
  }
};

// @desc    Unread message counts per booking (for badges)
// @route   GET /api/messages/unread
// @access  Private
exports.getUnreadCounts = async (req, res) => {
  try {
    const rows = await Message.aggregate([
      { $match: { recipientId: req.user._id, readAt: null } },
      { $group: { _id: '$bookingId', count: { $sum: 1 } } }
    ]);

    const byBooking = {};
    let total = 0;
    rows.forEach(r => {
      byBooking[r._id.toString()] = r.count;
      total += r.count;
    });

    res.status(200).json({ success: true, total, byBooking });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ success: false, message: 'Could not load unread messages.' });
  }
};
