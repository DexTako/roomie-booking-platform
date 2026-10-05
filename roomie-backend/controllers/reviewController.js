const Review = require('../models/Review');
const Room = require('../models/Room');

// @desc    Get all reviews for a room
// @route   GET /api/rooms/:roomId/reviews
// @access  Public
exports.getRoomReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      roomId: req.params.roomId,
      isApproved: true 
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      count: reviews.length,
      averageRating: avgRating.toFixed(1),
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// @desc    Create a review for a room
// @route   POST /api/rooms/:roomId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const roomId = req.params.roomId;

    // Validation
    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, title, and comment'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has completed a booking for this room
    const Booking = require('../models/Booking');
    const completedBooking = await Booking.findOne({
      roomId,
      renterId: req.user._id,
      status: 'completed'
    });

    if (!completedBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only review rooms you have stayed in. Complete a booking first.'
      });
    }

    // Check if user already reviewed this room
    const existingReview = await Review.findOne({
      roomId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this room'
      });
    }

    // Create review
    const review = await Review.create({
      roomId,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      title,
      comment,
      bookingId: completedBooking._id // Reference to the completed booking
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only review author can update
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only review author or admin can delete
    if (
      review.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// @desc    Check if user can review a room
// @route   GET /api/rooms/:roomId/can-review
// @access  Private
exports.canUserReview = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // Check if user has completed a booking for this room
    const Booking = require('../models/Booking');
    const completedBooking = await Booking.findOne({
      roomId,
      renterId: req.user._id,
      status: 'completed'
    });

    if (!completedBooking) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'You need to complete a stay at this room before you can review it.'
      });
    }

    // Check if user already reviewed this room
    const existingReview = await Review.findOne({
      roomId,
      userId: req.user._id
    });

    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'You have already reviewed this room.'
      });
    }

    return res.status(200).json({
      success: true,
      canReview: true,
      reason: 'You can write a review for this room.'
    });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility',
      error: error.message
    });
  }
};