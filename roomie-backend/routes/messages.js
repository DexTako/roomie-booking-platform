const express = require('express');
const router = express.Router();
const { getThread, sendMessage, getUnreadCounts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/unread', getUnreadCounts);
router.get('/booking/:bookingId', getThread);
router.post('/booking/:bookingId', sendMessage);

module.exports = router;
