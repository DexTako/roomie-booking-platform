const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get all bookings (filtered by role)
// @route   GET /api/bookings
// @access  Private
exports.getAllBookings = async (req, res) => {
  try {
    let query = {};

    // Customers only see their own bookings
    if (req.user.role === 'customer') {
      query.renterId = req.user._id;
    }
    // Hosts see bookings for their rooms
    else if (req.user.role === 'host') {
      const hostRooms = await Room.find({ hostId: req.user._id }).select('_id');
      const roomIds = hostRooms.map(room => room._id);
      query.roomId = { $in: roomIds };
    }
    // Admins see all bookings (no filter)

    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('roomId', 'name location galleryImages')
      .populate('renterId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId')
      .populate('renterId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      req.user.role === 'customer' &&
      booking.renterId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests,
      paymentMethod,
      paymentDetails
    } = req.body;

    // Validation
    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get room details
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    if (!room.isActive || !room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for booking'
      });
    }

    // Check capacity
    if (guests > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `Room capacity is ${room.capacity} guests`
      });
    }

    // Check date validity
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check for conflicts
    const conflicts = await Booking.findConflicts(roomId, checkIn, checkOut);
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for these dates',
        conflicts: conflicts.map(b => ({
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          status: b.status
        }))
      });
    }

    // Calculate pricing
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const subtotal = room.pricePerNight * nights;
    const serviceFee = Math.round(subtotal * 0.10 * 100) / 100; // 10%, same as the frontend
    const totalPrice = Math.round((subtotal + serviceFee) * 100) / 100;

    // Payment (demo gateway): card/GCash/PayPal are treated as paid right away,
    // cash is paid on arrival. Swap this block for a real gateway later.
    const method = ['card', 'paypal', 'gcash', 'cash'].includes(paymentMethod) ? paymentMethod : 'card';
    const isPaidNow = method !== 'cash';
    const transactionId = isPaidNow
      ? `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      : '';

    // Create booking
    const booking = await Booking.create({
      roomId: room._id,
      roomName: room.name,
      renterId: req.user._id,
      renterName: guestName || req.user.name,
      renterEmail: guestEmail || req.user.email,
      renterPhone: guestPhone || req.user.phone || '',
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      specialRequests: specialRequests || '',
      pricePerNight: room.pricePerNight,
      nights,
      subtotal,
      serviceFee,
      totalPrice,
      paymentMethod: method,
      paymentDetails: String(paymentDetails || '').slice(0, 60),
      paymentStatus: isPaidNow ? 'completed' : 'pending',
      paidAt: isPaidNow ? new Date() : undefined,
      transactionId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Host/Admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    const validStatuses = ['pending', 'approved', 'declined', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (host/admin only)
    if (req.user.role !== 'admin' && req.user.role !== 'host') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update booking status'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

// @desc    Cancel booking (customer)
// @route   DELETE /api/bookings/:id
// @access  Private (Customer who made booking)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only the customer who made the booking can cancel it
    if (booking.renterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Can't cancel completed or already cancelled bookings
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.status} booking`
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ renterId: req.user._id })
      .populate('roomId', 'name location galleryImages pricePerNight')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};
