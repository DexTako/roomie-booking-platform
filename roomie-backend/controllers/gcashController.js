// GCash "send money" payments.
// The guest sends the amount to Roomie's GCash number in their own GCash app and then types the
// reference number from the receipt. The host checks that the money arrived before approving.
// (No payment company or business account is needed.)

const DEMO_NUMBER = '09171234567';

// @desc    Where guests should send their GCash payment
// @route   GET /api/payments/gcash/config
// @access  Public
exports.getGcashConfig = (req, res) => {
  const number = (process.env.GCASH_NUMBER || '').replace(/\D/g, '');
  res.status(200).json({
    success: true,
    number: number || DEMO_NUMBER,
    accountName: process.env.GCASH_ACCOUNT_NAME || 'Roomie (demo)',
    isDemo: !number
  });
};

// GCash reference numbers are 13 digits; accept 10 to 15 digits to be safe
exports.normalizeReference = (value) => String(value || '').replace(/\D/g, '');
exports.isValidReference = (digits) => /^\d{10,15}$/.test(digits);
