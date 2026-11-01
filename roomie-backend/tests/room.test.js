const test = require('node:test');
const assert = require('node:assert/strict');
const { stubModules, call } = require('./helpers');

const room = { _id: 'room1', name: 'Loft', pricePerNight: 100, capacity: 4, isActive: true, hostId: { toString: () => 'host1' } };
let lastUpdate = null;
stubModules({
  '../models/Room': {
    findById: async () => room,
    findByIdAndUpdate: async (id, body) => { lastUpdate = body; return { ...room, ...body }; }
  },
  '../models/Booking': {},
  '../models/Review': {},
  '../models/User': {}
});
const rooms = require('../controllers/roomController');

const owner = { _id: { toString: () => 'host1' }, role: 'host' };
const otherHost = { _id: { toString: () => 'host2' }, role: 'host' };

test('the owner host can change the price', async () => {
  const res = await call(rooms.updateRoom, { params: { id: 'room1' }, body: { pricePerNight: '150' }, user: owner });
  assert.equal(res.status, 200);
  assert.equal(lastUpdate.pricePerNight, 150); // stored as a number
});

test('a price of 0, a negative price or text is refused with a clear message', async () => {
  for (const bad of [0, -5, 'abc', '']) {
    const res = await call(rooms.updateRoom, { params: { id: 'room1' }, body: { pricePerNight: bad }, user: owner });
    assert.equal(res.status, 400, `price ${JSON.stringify(bad)} should be refused`);
    assert.match(res.message, /greater than 0/);
  }
});

test('another host cannot change the price', async () => {
  const res = await call(rooms.updateRoom, { params: { id: 'room1' }, body: { pricePerNight: 1 }, user: otherHost });
  assert.equal(res.status, 403);
});

test('a room cannot be handed to another host through an edit', async () => {
  await call(rooms.updateRoom, { params: { id: 'room1' }, body: { name: 'New name', hostId: 'host2' }, user: owner });
  assert.equal(lastUpdate.hostId, undefined);
  assert.equal(lastUpdate.name, 'New name');
});
