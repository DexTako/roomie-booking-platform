const express = require('express');
const router = express.Router();
const {
  getRoomReviews,
  createReview,
  updateReview,
  deleteReview,
  canUserReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Room reviews routes (aliases used by the frontend: /api/rooms/:roomId/...)
router.get('/rooms/:roomId/reviews', getRoomReviews);
router.get('/rooms/:roomId/can-review', protect, canUserReview);
router.post('/rooms/:roomId/reviews', protect, createReview);

// Original paths (still supported)
router.get('/reviews/room/:roomId', getRoomReviews);
router.get('/reviews/room/:roomId/can-review', protect, canUserReview);
router.post('/reviews/room/:roomId', protect, createReview);

// Individual review routes
router.put('/reviews/:id', protect, updateReview);
router.delete('/reviews/:id', protect, deleteReview);

module.exports = router;
