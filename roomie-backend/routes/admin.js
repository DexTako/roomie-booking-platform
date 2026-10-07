const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getSystemStats,
  updateUserRole,
  updateUserStatus,
  banUser,
  unbanUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// Admin routes
router.get('/users', getAllUsers);
router.get('/stats', getSystemStats);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/unban', unbanUser);

module.exports = router;
