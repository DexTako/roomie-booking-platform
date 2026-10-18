const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  position: [Number], // [x, y, z] coordinates
  target: [Number]    // [x, y, z] camera target
}, { _id: false });

const movableItemSchema = new mongoose.Schema({
  id: String,
  label: String,
  meshName: String,
  region: {
    min: [Number],
    max: [Number]
  }
}, { _id: false });

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [20, 'Capacity cannot exceed 20']
  },
  theme: {
    type: String,
    enum: ['modern', 'rustic', 'luxury', 'minimalist', 'scandinavian'],
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  galleryImages: [{
    type: String, // URLs or file paths
    trim: true
  }],
  
  // 3D Model Configuration
  model3D: {
    type: String, // Path to GLB/GLTF file
    default: null
  },
  has3D: {
    type: Boolean,
    default: false
  },
  fixMaterials: {
    type: Boolean,
    default: false
  },
  enablePhysics: {
    type: Boolean,
    default: false
  },
  movableItems: [movableItemSchema],
  // Multi-storey walk mode (optional). Model units; levels listed lowest to highest.
  // Rooms without it use a single walk grid for the whole model.
  walkConfig: {
    radius: Number,
    levels: [{
      _id: false,
      name: String,
      floorY: Number,
      ceilY: Number,
      area: {
        min: [Number], // [x, z]
        max: [Number]  // [x, z]
      }
    }]
  },
  waypoints: {
    type: Map,
    of: waypointSchema,
    default: {}
  },
  
  // Room Status
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // In your app, all rooms belong to host@roomie.com
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
roomSchema.index({ pricePerNight: 1 });
roomSchema.index({ capacity: 1 });
roomSchema.index({ theme: 1 });
roomSchema.index({ isActive: 1, isAvailable: 1 });

// Virtual for room's bookings
roomSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'roomId'
});

// Method to check if room is available for specific dates
roomSchema.methods.isAvailableForDates = async function(checkIn, checkOut) {
  const Booking = mongoose.model('Booking');
  
  const conflictingBookings = await Booking.find({
    roomId: this._id,
    status: { $in: ['pending', 'approved'] },
    $or: [
      // New booking starts during an existing booking
      { checkIn: { $lte: checkIn }, checkOut: { $gt: checkIn } },
      // New booking ends during an existing booking
      { checkIn: { $lt: checkOut }, checkOut: { $gte: checkOut } },
      // New booking completely contains an existing booking
      { checkIn: { $gte: checkIn }, checkOut: { $lte: checkOut } }
    ]
  });
  
  return conflictingBookings.length === 0;
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
