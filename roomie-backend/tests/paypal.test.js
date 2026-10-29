const test = require('node:test');
const assert = require('node:assert/strict');
const { stubModules, call, day } = require('./helpers');

process.env.PAYPAL_CLIENT_ID = 'cid';
process.env.PAYPAL_CLIENT_SECRET = 'sec';
process.env.PAYPAL_MODE = 'sandbox';

const room = { _id: 'room1', name: 'Loft', pricePerNight: 100, capacity: 4, isActive: true, isAvailable: true, hostId: 'h1' };
const bookings = [];
let conflict = false;
let failCreate = false;
stubModules({
  '../models/Room': { findById: async () => room },
  '../models/User': { findById: () => ({ select: async () => null }) },
  '../models/Booking': {
    findConflicts: async () => (conflict ? [{}] : []),
    findOne: async (q) => bookings.find(b => b.paymentIntentId === q.paymentIntentId) || null,
    create: async (d) => { if (failCreate) throw new Error('db down'); const b = { _id: 'b' + (bookings.length + 1), ...d }; bookings.push(b); return b; },
    updateOne: async () => {}
  }
});

// A fake PayPal server
const orders = {};
const calls = [];
global.fetch = async (url, opts = {}) => {
  const path = url.replace('https://api-m.sandbox.paypal.com', '');
  const method = opts.method || 'GET';
  calls.push(`${method} ${path}`);
  const ok = (json) => ({ ok: true, json: async () => json });
  if (path === '/v1/oauth2/token') return ok({ access_token: 't', expires_in: 3000 });
  if (path === '/v2/checkout/orders' && method === 'POST') {
    const body = JSON.parse(opts.body);
    orders.ORD1 = { id: 'ORD1', purchase_units: [body.purchase_units[0]] };
    return ok({ id: 'ORD1' });
  }
  if (path === '/v2/checkout/orders/ORD1' && method === 'GET') return ok(orders.ORD1);
  if (path === '/v2/checkout/orders/ORD1/capture') {
    return ok({ status: 'COMPLETED', payer: { email_address: 'buyer@example.com' }, purchase_units: [{ payments: { captures: [{ id: 'CAP1', status: 'COMPLETED' }] } }] });
  }
  if (path === '/v2/payments/captures/CAP1/refund') return ok({ status: 'COMPLETED' });
  return { ok: false, json: async () => ({ message: 'unexpected ' + path }) };
};

const paypal = require('../controllers/paypalController');
const user = { _id: 'u1', name: 'Dex', email: 'd@x.com' };
const stay = { roomId: 'room1', checkIn: day(5), checkOut: day(8), guests: 2 };

test('create order: server sets the price (3 nights x 100 + 10% = 330)', async () => {
  const res = await call(paypal.createOrder, { body: stay, user });
  assert.equal(res.status, 201);
  assert.equal(res.total, 330);
  assert.equal(orders.ORD1.purchase_units[0].amount.value, '330.00');
});

test('capture is refused for another user, a tampered booking, or taken dates (no money moves)', async () => {
  assert.match((await call(paypal.captureOrder, { body: { orderID: 'ORD1', bookingData: stay }, user: { _id: 'other' } })).message, /does not belong/);
  assert.match((await call(paypal.captureOrder, { body: { orderID: 'ORD1', bookingData: { ...stay, checkOut: day(12) } }, user })).message, /does not match/);
  conflict = true;
  assert.match((await call(paypal.captureOrder, { body: { orderID: 'ORD1', bookingData: stay }, user })).message, /not been charged/);
  conflict = false;
  assert.equal(calls.some(c => c.endsWith('/capture')), false);
});

test('capture creates one PayPal booking; pressing twice returns the same booking', async () => {
  const res = await call(paypal.captureOrder, { body: { orderID: 'ORD1', bookingData: { ...stay, guestName: 'Dex' } }, user });
  assert.equal(res.status, 201);
  assert.equal(res.booking.paymentMethod, 'paypal');
  assert.equal(res.booking.totalPrice, 330);
  const again = await call(paypal.captureOrder, { body: { orderID: 'ORD1', bookingData: stay }, user });
  assert.equal(again.status, 200);
  assert.equal(bookings.length, 1);
});

test('if the booking cannot be saved after paying, the payment is refunded', async () => {
  bookings.length = 0;
  failCreate = true;
  const res = await call(paypal.captureOrder, { body: { orderID: 'ORD1', bookingData: stay }, user });
  assert.match(res.message, /refunded/);
  assert.ok(calls.some(c => c.includes('/refund')));
  failCreate = false;
});

test('refundPayPalBooking only refunds completed PayPal payments', async () => {
  assert.deepEqual(await paypal.refundPayPalBooking({ paymentMethod: 'card', paymentStatus: 'completed' }), { attempted: false, refunded: false });
  const paid = await paypal.refundPayPalBooking({ _id: 'b1', paymentMethod: 'paypal', paymentStatus: 'completed', transactionId: 'CAP1' });
  assert.deepEqual(paid, { attempted: true, refunded: true });
});
