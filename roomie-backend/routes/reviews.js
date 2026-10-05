const express = require('express');
const router = express.Router();
const {
  getRoomReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Room reviews routes
router.get('/rooms/:roomId/reviews', getRoomReviews);
router.post('/rooms/:roomId/reviews', protect, createReview);

// Individual review routes
router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
