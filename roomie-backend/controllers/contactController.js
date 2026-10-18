const jwt = require('jsonwebtoken');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');

// Simple spam guard: max 5 messages per IP per hour (resets when the server restarts)
const recent = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

const tooManyRequests = (ip) => {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits);
    return true;
  }
  hits.push(now);
  recent.set(ip, hits);
  return false;
};

// @desc    Send a message from the Contact page
// @route   POST /api/contact
// @access  Public (links the message to the account when the sender is logged in)
exports.submitMessage = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const subject = (req.body.subject || '').trim();
    const message = (req.body.message || '').trim();

    if (!name) return res.status(400).json({ success: false, message: 'Please enter your name.' });
    if (!email) return res.status(400).json({ success: false, message: 'Please enter your email so we can reply to you.' });
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'That email doesn\'t look right. Use the format name@example.com.' });
    }
    if (!subject) return res.status(400).json({ success: false, message: 'Please add a subject.' });
    if (subject.length > 150) return res.status(400).json({ success: false, message: 'The subject must be 150 characters or less.' });
    if (message.length < 10) {
      return res.status(400).json({ success: false, message: 'Your message is too short. Please write at least 10 characters.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Your message is too long. Please keep it under 2000 characters.' });
    }

    if (tooManyRequests(req.ip)) {
      return res.status(429).json({
        success: false,
        message: 'You have sent several messages recently. Please wait a while before sending another.'
      });
    }

    // Attach the account if the sender is logged in (a bad/missing token is simply ignored)
    let userId = null;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer')) {
      try {
        const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id');
        if (user) userId = user._id;
      } catch {
        // not logged in, that's fine
      }
    }

    await ContactMessage.create({ name, email, subject, message, userId });

    res.status(201).json({
      success: true,
      message: 'Message sent! We\'ll get back to you by email.'
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'We could not send your message right now. Please try again in a moment.'
    });
  }
};

// @desc    List contact messages (newest first)
// @route   GET /api/admin/contact-messages
// @access  Private/Admin
exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200);
    const unread = messages.filter(m => m.status === 'new').length;
    res.status(200).json({ success: true, count: messages.length, unread, messages });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ success: false, message: 'Could not load contact messages.' });
  }
};

// @desc    Mark a contact message new / read / resolved
// @route   PUT /api/admin/contact-messages/:id
// @access  Private/Admin
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be new, read or resolved.' });
    }
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ success: false, message: 'Could not update the message.' });
  }
};
