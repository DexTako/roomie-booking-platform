const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { refundPayPalBooking } = require('./paypalController');
const { normalizeReference, isValidReference } = require('./gcashController');

// Helper function to ensure booking has complete price data
const ensureBookingPrices = async (booking) => {
  // If all price fields exist, return as-is
  if (booking.pricePerNight && booking.subtotal && booking.serviceFee && booking.totalPrice) {
    return booking;
  }

  // Calculate missing fields
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Get room details if pricePerNight is missing
  let pricePerNight = booking.pricePerNight;
  if (!pricePerNight && booking.roomId) {
    const room = await Room.findById(booking.roomId);
    pricePerNight = room?.pricePerNight || 0;
  }

  const subtotal = pricePerNight * nights;
  const serviceFee = subtotal * 0.10; // keep in sync with SERVICE_FEE_RATE on the frontend
  const totalPrice = subtotal + serviceFee;

  // Update the booking object (not saved to DB, just for response)
  booking.nights = nights;
  booking.pricePerNight = pricePerNight;
  booking.subtotal = subtotal;
  booking.serviceFee = serviceFee;
  booking.totalPrice = totalPrice;

  return booking;
};

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

    // Ensure all bookings have complete price data
    const bookingsWithPrices = await Promise.all(
      bookings.map(booking => ensureBookingPrices(booking))
    );

    res.status(200).json({
      success: true,
      count: bookingsWithPrices.length,
      bookings: bookingsWithPrices
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
      booking.renterId?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    // Hosts may only see bookings for their own rooms
    if (req.user.role === 'host' && booking.roomId?.hostId?.toString() !== req.user._id.toString()) {
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
      paymentDetails,
      gcashReference
    } = req.body;

    // Validation
    if (!roomId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // PayPal bookings are only created after a real PayPal payment (see paypalController)
    if (paymentMethod === 'paypal') {
      return res.status(400).json({
        success: false,
        message: 'PayPal bookings must be paid through the PayPal button.'
      });
    }

    // GCash: the guest has already sent the money, so we need the reference number from their receipt
    let gcashRef = '';
    if (paymentMethod === 'gcash') {
      gcashRef = normalizeReference(gcashReference);
      if (!isValidReference(gcashRef)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter the reference number from your GCash receipt (usually 13 digits).'
        });
      }
      const reused = await Booking.findOne({ paymentMethod: 'gcash', transactionId: gcashRef });
      if (reused) {
        return res.status(400).json({
          success: false,
          message: 'That GCash reference number was already used for another booking. Please check the number.'
        });
      }
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

    // Can't book a stay that starts in the past
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (checkInDate < new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
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
    const serviceFee = subtotal * 0.10; // keep in sync with SERVICE_FEE_RATE on the frontend
    const totalPrice = subtotal + serviceFee;

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
      paymentMethod: paymentMethod || 'card',
      paymentDetails: gcashRef ? `GCash ref ${gcashRef}` : (paymentDetails || ''),
      transactionId: gcashRef || undefined,
      // Cash is paid on arrival and GCash is checked by the host, so neither is "completed" yet
      paymentStatus: ['cash', 'gcash'].includes(paymentMethod || 'card') ? 'pending' : 'completed',
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

    // A host can only manage bookings for their own rooms
    if (req.user.role === 'host') {
      const room = await Room.findById(booking.roomId).select('hostId');
      if (!room || room.hostId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only manage bookings for your own rooms'
        });
      }
    }

    // Only allow sensible status changes (e.g. no approving a cancelled booking)
    const allowedTransitions = {
      pending: ['approved', 'declined', 'cancelled'],
      approved: ['completed', 'cancelled'],
      declined: [],
      cancelled: [],
      completed: []
    };
    if (!allowedTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `A ${booking.status} booking cannot be changed to ${status}`
      });
    }

    // Change the status only if it is still what we just checked. If the customer
    // cancelled a moment ago, this finds nothing and the host gets a clear message.
    const update = { status };
    if (status === 'approved' && booking.paymentMethod === 'gcash' && booking.paymentStatus === 'pending') {
      update.paymentStatus = 'completed'; // approving means the host saw the GCash payment arrive
      booking.paymentStatus = 'completed';
    }
    const changed = await Booking.findOneAndUpdate(
      { _id: booking._id, status: booking.status },
      { $set: update },
      { new: true }
    );
    if (!changed) {
      return res.status(409).json({
        success: false,
        message: 'This booking was just changed (for example the guest cancelled it). Please refresh to see the latest status.'
      });
    }
    booking.status = status;

    // Declined or cancelled by the host: give a PayPal-paid guest their money back
    let refundNote = '';
    if (status === 'declined' || status === 'cancelled') {
      const refund = await refundPayPalBooking(booking);
      if (refund.refunded) {
        booking.paymentStatus = 'refunded';
        refundNote = ' The guest\'s PayPal payment was refunded.';
      } else if (refund.attempted) {
        refundNote = ' The PayPal refund failed, so please refund the guest manually in PayPal.';
      }
      if (booking.paymentMethod === 'gcash') {
        refundNote = ` Remember to send the guest's GCash payment back (reference ${booking.transactionId || 'not recorded'}).`;
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully.${refundNote}`,
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

    // PayPal-paid bookings are refunded in full when the guest cancels
    const refund = await refundPayPalBooking(booking);
    if (refund.refunded) booking.paymentStatus = 'refunded';

    let message = 'Booking cancelled successfully';
    if (refund.refunded) message += '. Your PayPal payment has been refunded.';
    if (refund.attempted && !refund.refunded) {
      message += '. We could not refund your PayPal payment automatically, so please contact support.';
    }
    if (booking.paymentMethod === 'gcash') {
      message += '. GCash payments are refunded by the host, so please message them to get your money back.';
    }

    res.status(200).json({
      success: true,
      message,
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

    // Ensure all bookings have complete price data
    const bookingsWithPrices = await Promise.all(
      bookings.map(booking => ensureBookingPrices(booking))
    );

    res.status(200).json({
      success: true,
      count: bookingsWithPrices.length,
      bookings: bookingsWithPrices
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
