const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Room Information
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required']
  },
  roomName: {
    type: String,
    required: true
  },
  
  // Renter/Guest Information
  renterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Renter ID is required']
  },
  renterName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true
  },
  renterEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true
  },
  renterPhone: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Booking Dates
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(value) {
        return value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  
  // Guest Details
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Must have at least 1 guest']
  },
  specialRequests: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Pricing
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  nights: {
    type: Number,
    required: [true, 'Number of nights is required'],
    min: [1, 'Must book at least 1 night']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  serviceFee: {
    type: Number,
    required: [true, 'Service fee is required'],
    min: [0, 'Service fee cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  
  // Payment
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: ''
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Metadata
  isSeed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ renterId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual to populate room details
bookingSchema.virtual('room', {
  ref: 'Room',
  localField: 'roomId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate renter details
bookingSchema.virtual('renter', {
  ref: 'User',
  localField: 'renterId',
  foreignField: '_id',
  justOne: true
});

// Method to check if booking dates overlap with another booking
bookingSchema.methods.overlaps = function(otherCheckIn, otherCheckOut) {
  const thisCheckIn = this.checkIn.getTime();
  const thisCheckOut = this.checkOut.getTime();
  const otherIn = new Date(otherCheckIn).getTime();
  const otherOut = new Date(otherCheckOut).getTime();
  
  return (
    (otherIn >= thisCheckIn && otherIn < thisCheckOut) ||
    (otherOut > thisCheckIn && otherOut <= thisCheckOut) ||
    (otherIn <= thisCheckIn && otherOut >= thisCheckOut)
  );
};

// Static method to find conflicting bookings
bookingSchema.statics.findConflicts = async function(roomId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    roomId: roomId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { checkIn: { $lte: new Date(checkIn) }, checkOut: { $gt: new Date(checkIn) } },
      { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gte: new Date(checkOut) } },
      { checkIn: { $gte: new Date(checkIn) }, checkOut: { $lte: new Date(checkOut) } }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.find(query);
};

// Method to calculate nights automatically
bookingSchema.pre('save', function(next) {
  if (this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (!this.nights) {
      this.nights = diffDays;
    }
    
    // Auto-calculate pricing if not set
    if (!this.subtotal && this.pricePerNight) {
      this.subtotal = this.pricePerNight * this.nights;
    }
    
    if (!this.serviceFee && this.subtotal) {
      this.serviceFee = this.subtotal * 0.15; // 15% service fee
    }
    
    if (!this.totalPrice && this.subtotal && this.serviceFee) {
      this.totalPrice = this.subtotal + this.serviceFee;
    }
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
