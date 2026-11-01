const test = require('node:test');
const assert = require('node:assert/strict');
const { stubModules, call } = require('./helpers');

// A tiny in-memory bookings table
const today = Date.now();
const day = (n) => new Date(today + n * 864e5);
const table = [
  { _id: 'a', status: 'approved', checkOut: day(-2), paymentMethod: 'cash', paymentStatus: 'pending' },
  { _id: 'b', status: 'approved', checkOut: day(-1), paymentMethod: 'gcash', paymentStatus: 'completed' },
  { _id: 'c', status: 'approved', checkOut: day(3), paymentMethod: 'cash', paymentStatus: 'pending' },
  { _id: 'd', status: 'pending', checkOut: day(-5), paymentMethod: 'card', paymentStatus: 'completed' },
  { _id: 'e', status: 'cancelled', checkOut: day(-5), paymentMethod: 'card', paymentStatus: 'completed' }
];
const matches = (b, f) =>
  Object.entries(f).every(([k, v]) => (v && typeof v === 'object' && '$lte' in v ? b[k] <= v.$lte : b[k] === v));

stubModules({
  '../models/Room': { find: () => ({ select: async () => [] }) },
  '../models/Review': {},
  '../models/User': {},
  '../models/Booking': {
    updateMany: async (filter, update) => {
      let n = 0;
      table.filter(b => matches(b, filter)).forEach(b => { Object.assign(b, update.$set); n++; });
      return { modifiedCount: n };
    },
    find: () => ({ populate() { return this; }, sort: async () => table.map(b => ({ ...b, nights: 1, subtotal: 1, serviceFee: 0, totalPrice: 1, pricePerNight: 1 })) })
  }
});
const bookings = require('../controllers/bookingController');

test('finished approved stays become completed; everything else is untouched', async () => {
  const count = await bookings.completeFinishedStays();
  assert.equal(count, 2);
  const status = Object.fromEntries(table.map(b => [b._id, b.status]));
  assert.deepEqual(status, { a: 'completed', b: 'completed', c: 'approved', d: 'pending', e: 'cancelled' });
});

test('cash bookings count as paid once the stay is over; other payments stay as they were', async () => {
  const get = (id) => table.find(b => b._id === id);
  assert.equal(get('a').paymentStatus, 'completed'); // cash, finished
  assert.equal(get('c').paymentStatus, 'pending');   // cash, stay still ahead
  assert.equal(get('b').paymentStatus, 'completed'); // gcash, unchanged
});

test('listing bookings (host/admin) completes finished stays first', async () => {
  table.push({ _id: 'f', status: 'approved', checkOut: day(-1), paymentMethod: 'card', paymentStatus: 'completed' });
  const res = await call(bookings.getAllBookings, { query: {}, user: { _id: 'admin1', role: 'admin' } });
  assert.equal(res.status, 200);
  assert.equal(table.find(b => b._id === 'f').status, 'completed');
});
