const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getStripeConfig,
  handleWebhook
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/config', getStripeConfig);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

module.exports = router;