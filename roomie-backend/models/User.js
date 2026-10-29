const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
    // NOTE: In production, passwords should be hashed with bcrypt before saving
  },
  role: {
    type: String,
    enum: ['customer', 'host', 'admin'],
    default: 'customer'
    // customer: public users who book rooms
    // host: manages rooms and bookings
    // admin: full system access
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Email verification (accounts without this field count as verified)
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  emailVerifyToken: {
    type: String,
    select: false
  },
  emailVerifyExpires: {
    type: Date,
    select: false
  },
  // Password reset: only a hash of the emailed token is stored
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  bannedAt: {
    type: Date,
    default: null
  },
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  unbannedAt: {
    type: Date,
    default: null
  },
  unbannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null
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
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Index for faster email lookups
userSchema.index({ email: 1 });

// Virtual for user's bookings (populated when needed)
userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'renterId'
});

// Method to exclude password from JSON responses
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerifyToken;
  delete user.emailVerifyExpires;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
