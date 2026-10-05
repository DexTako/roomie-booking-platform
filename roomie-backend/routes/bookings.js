const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getMyBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// All booking routes require authentication
router.use(protect);

// Customer routes
router.get('/my-bookings', getMyBookings);
router.post('/', createBooking);
router.delete('/:id', cancelBooking);

// General protected routes
router.get('/', getAllBookings);
router.get('/:id', getBookingById);

// Host/Admin only routes
router.put('/:id/status', authorize('host', 'admin'), updateBookingStatus);

module.exports = router;
