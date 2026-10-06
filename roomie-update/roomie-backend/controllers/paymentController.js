// Stripe is optional: only create the client when it is actually used,
// so the server still starts if STRIPE_SECRET_KEY is missing.
let stripeClient = null;
const getStripe = () => {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured');
    stripeClient = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Create payment intent for booking
// @route   POST /api/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingData } = req.body;
    const { roomId, checkIn, checkOut, guests } = bookingData;

    // Get room details for pricing
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Calculate pricing
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const subtotal = room.pricePerNight * nights;
    const serviceFee = subtotal * 0.15;
    const totalPrice = subtotal + serviceFee;

    // Create payment intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        roomId: roomId.toString(),
        userId: req.user._id.toString(),
        roomName: room.name,
        checkIn,
        checkOut,
        guests: guests.toString(),
        nights: nights.toString()
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalPrice,
      breakdown: {
        subtotal,
        serviceFee,
        nights,
        pricePerNight: room.pricePerNight
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message
    });
  }
};

// @desc    Confirm payment and create booking
// @route   POST /api/payments/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, bookingData } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Extract booking data from payment metadata
    const metadata = paymentIntent.metadata;
    const room = await Room.findById(metadata.roomId);

    // Create booking with payment information
    const booking = await Booking.create({
      roomId: metadata.roomId,
      roomName: room.name,
      renterId: req.user._id,
      renterName: bookingData.guestName || req.user.name,
      renterEmail: bookingData.guestEmail || req.user.email,
      renterPhone: bookingData.guestPhone || req.user.phone || '',
      checkIn: new Date(metadata.checkIn),
      checkOut: new Date(metadata.checkOut),
      guests: parseInt(metadata.guests),
      specialRequests: bookingData.specialRequests || '',
      pricePerNight: room.pricePerNight,
      nights: parseInt(metadata.nights),
      subtotal: paymentIntent.amount / 100 / 1.15, // Remove service fee
      serviceFee: (paymentIntent.amount / 100) * 0.15 / 1.15,
      totalPrice: paymentIntent.amount / 100,
      paymentMethod: 'card',
      paymentIntentId: paymentIntentId,
      paymentStatus: 'completed',
      status: 'pending' // Still needs host approval
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// @desc    Get Stripe public key
// @route   GET /api/payments/config
// @access  Public
exports.getStripeConfig = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51QDzdcP6YVp6zZa7JrHqFyQNxZgUehYAWGBl1QhS6N8FSBGFq1K9U8G8yQNZ7TmgUqFm7TJXGjGQVV1h3hCbpNyE00bpACmUP8'
    });
  } catch (error) {
    console.error('Get Stripe config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting Stripe configuration',
      error: error.message
    });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};