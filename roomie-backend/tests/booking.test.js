const test = require('node:test');
const assert = require('node:assert/strict');
const { stubModules, call, day } = require('./helpers');

const room = { _id: 'room1', name: 'Loft', pricePerNight: 100, capacity: 4, isActive: true, isAvailable: true, hostId: 'h1' };
const store = [];
const Booking = {
  findConflicts: async () => [],
  findOne: async (q) => store.find(b => b.paymentMethod === q.paymentMethod && b.transactionId === q.transactionId) || null,
  create: async (d) => { const b = { _id: 'b' + (store.length + 1), ...d }; store.push(b); return b; },
  findOneAndUpdate: async (f, u) => { const b = store.find(x => x._id === f._id && x.status === f.status); if (!b) return null; Object.assign(b, u.$set); return b; },
  findById: async (id) => { const b = store.find(x => x._id === id); return b ? { ...b, save: async () => {} } : null; }
};
stubModules({
  '../models/Room': { findById: async () => room },
  '../models/Booking': Booking,
  '../models/Review': {},
  '../models/User': { findById: () => ({ select: async () => null }) }
});
const bookings = require('../controllers/bookingController');
const gcash = require('../controllers/gcashController');

const guest = { _id: 'u1', name: 'Dex', email: 'd@x.com', role: 'customer' };
const base = { roomId: 'room1', checkIn: day(5), checkOut: day(7), guests: 2 };

test('price is calculated on the server (2 nights x 100 + 10% fee = 220)', async () => {
  const res = await call(bookings.createBooking, { body: { ...base, paymentMethod: 'cash', totalPrice: 1 }, user: guest });
  assert.equal(res.status, 201);
  assert.equal(res.booking.totalPrice, 220);
  assert.equal(res.booking.paymentStatus, 'pending');
});

test('dates in the past and too many guests are rejected', async () => {
  assert.match((await call(bookings.createBooking, { body: { ...base, checkIn: '2020-01-01', checkOut: '2020-01-03' }, user: guest })).message, /past/i);
  assert.match((await call(bookings.createBooking, { body: { ...base, guests: 9 }, user: guest })).message, /capacity/i);
});

test('GCash needs a valid reference number, and each reference works only once', async () => {
  const gc = { ...base, paymentMethod: 'gcash' };
  assert.match((await call(bookings.createBooking, { body: gc, user: guest })).message, /reference number/);
  assert.match((await call(bookings.createBooking, { body: { ...gc, gcashReference: '123' }, user: guest })).message, /reference number/);

  const ok = await call(bookings.createBooking, { body: { ...gc, gcashReference: '1234 567 890123' }, user: guest });
  assert.equal(ok.status, 201);
  assert.equal(ok.booking.paymentStatus, 'pending');
  assert.equal(ok.booking.paymentDetails, 'GCash ref 1234567890123');

  assert.match((await call(bookings.createBooking, { body: { ...gc, gcashReference: '1234567890123' }, user: guest })).message, /already used/);
});

test('host approving a GCash booking confirms the payment; a finished booking cannot change again', async () => {
  const gcashBooking = store.find(b => b.paymentMethod === 'gcash');
  const admin = { _id: 'a1', role: 'admin' };
  const approved = await call(bookings.updateBookingStatus, { params: { id: gcashBooking._id }, body: { status: 'approved' }, user: admin });
  assert.equal(approved.status, 200);
  assert.equal(gcashBooking.paymentStatus, 'completed');

  const again = await call(bookings.updateBookingStatus, { params: { id: gcashBooking._id }, body: { status: 'declined' }, user: admin });
  assert.equal(again.status, 400);
});

test('PayPal bookings cannot be created without paying through PayPal', async () => {
  assert.match((await call(bookings.createBooking, { body: { ...base, paymentMethod: 'paypal' }, user: guest })).message, /PayPal button/);
});

test('GCash config returns a number and account name', async () => {
  const res = await call(gcash.getGcashConfig, {});
  assert.equal(res.success, true);
  assert.ok(res.number && res.accountName);
});
