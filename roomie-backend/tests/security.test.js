const test = require('node:test');
const assert = require('node:assert/strict');
const { clean, sanitizeRequest } = require('../utils/sanitize');
const requireVerifiedEmail = require('../middleware/verified');

test('sanitize removes NoSQL operators and dotted keys', () => {
  const input = { email: { $gt: '' }, name: 'ok', 'a.b': 1, nested: { $where: 'x', fine: 2 }, list: [{ $ne: 1, keep: 1 }] };
  assert.deepEqual(clean(input), { email: {}, name: 'ok', nested: { fine: 2 }, list: [{ keep: 1 }] });
});

test('sanitize middleware cleans body and query', () => {
  const req = { body: { password: { $ne: null } }, query: { search: 'loft', 'x.y': 1 }, params: {} };
  let called = false;
  sanitizeRequest(req, {}, () => { called = true; });
  assert.equal(called, true);
  assert.deepEqual(req.body, { password: {} });
  assert.deepEqual({ ...req.query }, { search: 'loft' });
});

test('unverified users are blocked from booking; verified and legacy accounts pass', () => {
  const run = (user) => {
    let result = 'next';
    const res = { status(c) { result = c; return this; }, json() { return this; } };
    requireVerifiedEmail({ user }, res, () => { result = 'next'; });
    return result;
  };
  assert.equal(run({ isEmailVerified: false }), 403);
  assert.equal(run({ isEmailVerified: true }), 'next');
  assert.equal(run({}), 'next'); // accounts created before this feature
});

test('login with a non-text email or password returns a clear 400, not a server error', async () => {
  const { stubModules, call } = require('./helpers');
  stubModules({
    '../models/User': { findOne: () => ({ select: async () => null }) },
    bcrypt: { hash: async () => 'h', compare: async () => false },
    jsonwebtoken: { sign: () => 't' }
  });
  const auth = require('../controllers/authController');
  const res = await call(auth.login, { body: { email: { $gt: '' }, password: 'x' } });
  assert.equal(res.status, 400);
  assert.match(res.message, /email/i);
});
