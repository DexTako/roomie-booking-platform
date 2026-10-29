const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { notifyBookingCreated } = require('../utils/notifications');

// Keep in sync with SERVICE_FEE_RATE in the frontend (utils/pricing.js)
const SERVICE_FEE_RATE = 0.10;
const CURRENCY = 'USD';

const isConfigured = () => Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

// Sandbox = fake money for testing. Set PAYPAL_MODE=live only for a real, approved PayPal business app.
const baseUrl = () =>
  process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

const round2 = (n) => Math.round(n * 100) / 100;

// ---------- PayPal REST helpers (Node 18+ has fetch built in, no extra package needed) ----------
let cachedToken = { value: null, expiresAt: 0 };

const getAccessToken = async () => {
  if (cachedToken.value && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const credentials = Buffer
    .from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`)
    .toString('base64');

  const response = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || 'PayPal login failed. Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.');
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000
  };
  return cachedToken.value;
};

const paypalRequest = async (path, { method = 'GET', body } = {}) => {
  const token = await getAccessToken();
  const response = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.details && data.details[0] && data.details[0].description;
    const error = new Error(detail || data.message || 'PayPal request failed');
    error.paypal = data;
    throw error;
  }
  return data;
};

// ---------- Price + validation, always calculated on the server ----------
// (never trust the price sent by the browser)
const prepareStay = async ({ roomId, checkIn, checkOut, guests }) => {
  if (!roomId || !checkIn || !checkOut || !guests) {
    return { error: { status: 400, message: 'Please provide the room, dates and number of guests' } };
  }

  const room = await Room.findById(roomId);
  if (!room) return { error: { status: 404, message: 'Room not found' } };
  if (!room.isActive || !room.isAvailable) {
    return { error: { status: 400, message: 'Room is not available for booking' } };
  }
  if (guests > room.capacity) {
    return { error: { status: 400, message: `Room capacity is ${room.capacity} guests` } };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
    return { error: { status: 400, message: 'Check-out date must be after check-in date' } };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (checkInDate < new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000)) {
    return { error: { status: 400, message: 'Check-in date cannot be in the past' } };
  }

  const conflicts = await Booking.findConflicts(roomId, checkIn, checkOut);
  if (conflicts.length > 0) {
    return { error: { status: 400, message: 'Room is not available for these dates' } };
  }

  const nights = Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const subtotal = round2(room.pricePerNight * nights);
  const serviceFee = round2(subtotal * SERVICE_FEE_RATE);
  const totalPrice = round2(subtotal + serviceFee);

  return { room, checkInDate, checkOutDate, nights, subtotal, serviceFee, totalPrice };
};

// @desc    Tell the frontend whether PayPal is set up (the client id is public by design)
// @route   GET /api/payments/paypal/config
// @access  Public
exports.getPayPalConfig = (req, res) => {
  res.status(200).json({
    success: true,
    configured: isConfigured(),
    clientId: isConfigured() ? process.env.PAYPAL_CLIENT_ID : null,
    currency: CURRENCY,
    mode: process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox'
  });
};

// @desc    Step 1: create a PayPal order for a stay
// @route   POST /api/payments/paypal/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'PayPal is not set up on this server yet. Please choose another payment method.'
      });
    }

    const stay = await prepareStay(req.body || {});
    if (stay.error) return res.status(stay.error.status).json({ success: false, message: stay.error.message });

    const order = await paypalRequest('/v2/checkout/orders', {
      method: 'POST',
      body: {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: String(stay.room._id),
          custom_id: String(req.user._id), // used to check the payer's order belongs to this account
          description: `${stay.room.name} - ${stay.nights} night(s)`.slice(0, 120),
          amount: { currency_code: CURRENCY, value: stay.totalPrice.toFixed(2) }
        }]
      }
    });

    res.status(201).json({ success: true, orderID: order.id, total: stay.totalPrice });
  } catch (error) {
    console.error('PayPal create order error:', error.message);
    res.status(502).json({
      success: false,
      message: `We could not start the PayPal payment: ${error.message}`
    });
  }
};

// @desc    Step 2: the guest approved the payment in PayPal; capture it and create the booking
// @route   POST /api/payments/paypal/capture-order
// @access  Private
exports.captureOrder = async (req, res) => {
  try {
    if (!isConfigured()) {
      return res.status(503).json({ success: false, message: 'PayPal is not set up on this server yet.' });
    }

    const { orderID } = req.body || {};
    const details = (req.body && req.body.bookingData) || {};
    if (!orderID) {
      return res.status(400).json({ success: false, message: 'Payment reference is missing' });
    }

    // One PayPal order = one booking (pressing a button twice returns the same booking)
    const existing = await Booking.findOne({ paymentIntentId: orderID });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Booking already created', booking: existing });
    }

    // Check the order really is for this user and this stay and price
    const order = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderID)}`);
    const unit = order.purchase_units && order.purchase_units[0];
    if (!unit || unit.custom_id !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'This payment does not belong to your account' });
    }

    const stay = await prepareStay(details);
    if (stay.error) {
      // The dates were taken while the guest was paying. Nothing has been captured yet,
      // so no money moves.
      return res.status(stay.error.status).json({
        success: false,
        message: `${stay.error.message}. You have not been charged.`
      });
    }
    if (String(stay.room._id) !== unit.reference_id || unit.amount.value !== stay.totalPrice.toFixed(2)) {
      return res.status(400).json({
        success: false,
        message: 'The payment does not match this booking. You have not been charged.'
      });
    }

    // Take the money
    const capture = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST',
      body: {}
    });
    const captureInfo = capture.purchase_units?.[0]?.payments?.captures?.[0];
    if (capture.status !== 'COMPLETED' || !captureInfo || captureInfo.status !== 'COMPLETED') {
      return res.status(402).json({
        success: false,
        message: 'PayPal did not complete the payment. You have not been charged. Please try again.'
      });
    }

    const payerEmail = capture.payer?.email_address || '';
    const maskedEmail = payerEmail
      ? `${payerEmail.split('@')[0].slice(0, 2)}•••@${payerEmail.split('@')[1]}`
      : '';

    try {
      const booking = await Booking.create({
        roomId: stay.room._id,
        roomName: stay.room.name,
        renterId: req.user._id,
        renterName: details.guestName || req.user.name,
        renterEmail: details.guestEmail || req.user.email,
        renterPhone: details.guestPhone || req.user.phone || '',
        checkIn: stay.checkInDate,
        checkOut: stay.checkOutDate,
        guests: details.guests,
        specialRequests: details.specialRequests || '',
        pricePerNight: stay.room.pricePerNight,
        nights: stay.nights,
        subtotal: stay.subtotal,
        serviceFee: stay.serviceFee,
        totalPrice: stay.totalPrice,
        paymentMethod: 'paypal',
        paymentDetails: maskedEmail ? `PayPal ${maskedEmail}` : 'PayPal',
        paymentStatus: 'completed',
        paymentIntentId: orderID,
        transactionId: captureInfo.id,
        status: 'pending'
      });

      notifyBookingCreated(booking);
      return res.status(201).json({ success: true, message: 'Payment received and booking created', booking });
    } catch (bookingError) {
      // Money was taken but the booking could not be saved: give it back straight away
      console.error('PayPal booking save failed, refunding:', bookingError.message);
      try {
        await paypalRequest(`/v2/payments/captures/${captureInfo.id}/refund`, { method: 'POST', body: {} });
        return res.status(500).json({
          success: false,
          message: 'We could not save your booking, so your PayPal payment was refunded. Please try again.'
        });
      } catch (refundError) {
        console.error('PayPal refund failed:', refundError.message);
        return res.status(500).json({
          success: false,
          message: `We could not save your booking and the automatic refund failed. Please contact support with this PayPal reference: ${captureInfo.id}`
        });
      }
    }
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    res.status(502).json({
      success: false,
      message: `We could not complete the PayPal payment: ${error.message}`
    });
  }
};

// Gives the guest their money back when a PayPal-paid booking is cancelled or declined.
// Returns { attempted, refunded } and never throws, so a refund problem can't block a cancellation.
exports.refundPayPalBooking = async (booking) => {
  const isPaidWithPayPal =
    booking.paymentMethod === 'paypal' && booking.paymentStatus === 'completed' && booking.transactionId;
  if (!isPaidWithPayPal) return { attempted: false, refunded: false };
  if (!isConfigured()) return { attempted: true, refunded: false };

  try {
    await paypalRequest(`/v2/payments/captures/${booking.transactionId}/refund`, { method: 'POST', body: {} });
    await Booking.updateOne({ _id: booking._id }, { $set: { paymentStatus: 'refunded' } });
    return { attempted: true, refunded: true };
  } catch (error) {
    console.error(`PayPal refund failed for booking ${booking._id} (capture ${booking.transactionId}):`, error.message);
    return { attempted: true, refunded: false };
  }
};
