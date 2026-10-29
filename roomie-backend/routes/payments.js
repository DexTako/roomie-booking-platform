const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getStripeConfig,
  handleWebhook
} = require('../controllers/paymentController');
const { getPayPalConfig, createOrder, captureOrder } = require('../controllers/paypalController');
const { getGcashConfig } = require('../controllers/gcashController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/config', getStripeConfig);
router.get('/paypal/config', getPayPalConfig);
router.get('/gcash/config', getGcashConfig);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.post('/create-payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

// PayPal checkout
router.post('/paypal/create-order', protect, createOrder);
router.post('/paypal/capture-order', protect, captureOrder);

module.exports = router;