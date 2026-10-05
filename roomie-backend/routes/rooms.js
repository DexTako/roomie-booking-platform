const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  checkAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
  getOccupiedDates
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.get('/:id/availability', checkAvailability);
router.get('/:id/occupied-dates', getOccupiedDates);

// Protected routes (Host/Admin only)
router.post('/', protect, authorize('host', 'admin'), createRoom);
router.put('/:id', protect, authorize('host', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('host', 'admin'), deleteRoom);

module.exports = router;
