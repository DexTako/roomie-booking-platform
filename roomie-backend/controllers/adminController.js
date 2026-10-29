const User = require('../models/User');
const Booking = require('../models/Booking');
const { refundPayPalBooking } = require('./paypalController');
const Room = require('../models/Room');

// When a customer is banned/deactivated, cancel their pending and upcoming approved
// bookings so hosts don't keep waiting for (or hosting) someone who can't use the site.
const cancelUserBookings = async (userId) => {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const filter = {
    renterId: userId,
    status: { $in: ['pending', 'approved'] },
    checkOut: { $gte: startOfToday }
  };

  const toCancel = await Booking.find(filter);
  const result = await Booking.updateMany(filter, { $set: { status: 'cancelled' } });

  // Refund the ones that were paid with PayPal
  for (const booking of toCancel) {
    await refundPayPalBooking(booking);
  }
  return result.modifiedCount || 0;
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get system statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalRooms, totalBookings, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ['approved', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const hosts = await User.countDocuments({ role: 'host' });
    const customers = await User.countDocuments({ role: 'customer' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        hosts,
        customers,
        totalRooms,
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics',
      error: error.message
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['customer', 'host', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Deactivate/reactivate user (Admin only)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be true or false'
      });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let cancelledBookings = 0;
    if (!isActive && user.role === 'customer') {
      cancelledBookings = await cancelUserBookings(user._id);
    }

    res.status(200).json({
      success: true,
      cancelledBookings,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};
// @desc    Ban user (Admin only)
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin only)
exports.banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent banning admin or host users
    if (user.role === 'admin' || user.role === 'host') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban admin or host users'
      });
    }

    // Update user status to banned
    user.isActive = false;
    user.bannedAt = new Date();
    user.bannedBy = req.user._id;
    await user.save();

    const cancelledBookings = await cancelUserBookings(user._id);

    res.status(200).json({
      success: true,
      message: cancelledBookings > 0
        ? `User banned and ${cancelledBookings} booking(s) cancelled`
        : 'User banned successfully',
      cancelledBookings,
      user
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error banning user',
      error: error.message
    });
  }
};

// @desc    Unban user (Admin only)
// @route   PUT /api/admin/users/:id/unban
// @access  Private (Admin only)
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status to active
    user.isActive = true;
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    user.unbannedAt = new Date();
    user.unbannedBy = req.user._id;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unbanned successfully',
      user
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unbanning user',
      error: error.message
    });
  }
};