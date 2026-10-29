const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const { refundPayPalBooking } = require('./paypalController');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const { theme, minPrice, maxPrice, capacity, search, checkIn, checkOut } = req.query;

    // Build query
    let query = { isActive: true };

    if (theme) query.theme = theme;
    if (capacity) query.capacity = { $gte: parseInt(capacity) };
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseFloat(minPrice);
      if (maxPrice) query.pricePerNight.$lte = parseFloat(maxPrice);
    }
    if (search) {
      // Escape regex characters so user input can't break (or slow down) the query
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { location: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    // Airbnb-style search: only rooms that are free for the chosen dates
    if (checkIn && checkOut && new Date(checkOut) > new Date(checkIn)) {
      const busyRoomIds = await Booking.find({
        status: { $in: ['pending', 'approved'] },
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }).distinct('roomId');
      if (busyRoomIds.length > 0) query._id = { $nin: busyRoomIds };
    }

    const rooms = await Room.find(query).sort({ createdAt: -1 });

    // Real rating summary per room (from the reviews collection)
    const ratingRows = await Review.aggregate([
      { $match: { isApproved: true, roomId: { $in: rooms.map(r => r._id) } } },
      { $group: { _id: '$roomId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const ratingByRoom = {};
    ratingRows.forEach(r => { ratingByRoom[r._id.toString()] = r; });

    const roomsWithRatings = rooms.map(room => {
      const stats = ratingByRoom[room._id.toString()];
      return {
        ...room.toObject(),
        averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
        reviewCount: stats ? stats.count : 0
      };
    });

    res.status(200).json({
      success: true,
      count: roomsWithRatings.length,
      rooms: roomsWithRatings
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// @desc    Check room availability for dates
// @route   GET /api/rooms/:id/availability
// @access  Public
exports.checkAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide check-in and check-out dates'
      });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const isAvailable = await room.isAvailableForDates(checkIn, checkOut);

    res.status(200).json({
      success: true,
      available: isAvailable,
      checkIn,
      checkOut
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability',
      error: error.message
    });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Host/Admin only)
exports.createRoom = async (req, res) => {
  try {
    // Set host ID from authenticated user (a client can't choose it, or approve itself)
    req.body.hostId = req.user._id;
    delete req.body._id;

    const room = await Room.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(' ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Host/Admin only)
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room'
      });
    }

    // A room can't be handed to another host (or have its id changed) through an edit
    delete req.body._id;
    delete req.body.hostId;

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(' ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Host/Admin only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check ownership (unless admin)
    if (req.user.role !== 'admin' && room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room'
      });
    }

    // Don't remove a room that still has confirmed guests coming
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const upcomingApproved = await Booking.countDocuments({
      roomId: room._id,
      status: 'approved',
      checkOut: { $gte: startOfToday }
    });
    if (upcomingApproved > 0) {
      return res.status(400).json({
        success: false,
        message: `This room has ${upcomingApproved} upcoming approved booking(s). Cancel or complete them before deleting the room.`
      });
    }

    // Pending requests for a room that no longer exists can never be approved, so close them
    const pendingFilter = { roomId: room._id, status: 'pending' };
    const pendingBookings = await Booking.find(pendingFilter);
    await Booking.updateMany(pendingFilter, { $set: { status: 'cancelled' } });
    for (const pending of pendingBookings) {
      await refundPayPalBooking(pending); // PayPal-paid guests get their money back
    }

    // Soft delete: set isActive to false instead of deleting
    room.isActive = false;
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

// @desc    Get occupied dates for a room
// @route   GET /api/rooms/:id/occupied-dates
// @access  Public
exports.getOccupiedDates = async (req, res) => {
  try {
    const bookings = await Booking.find({
      roomId: req.params.id,
      status: { $in: ['pending', 'approved'] }
    }).select('checkIn checkOut status');

    // Format dates for frontend calendar
    const occupiedRanges = bookings.map(booking => ({
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status
    }));

    res.status(200).json({
      success: true,
      occupiedRanges
    });
  } catch (error) {
    console.error('Get occupied dates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching occupied dates',
      error: error.message
    });
  }
};
