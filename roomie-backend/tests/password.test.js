const test = require('node:test');
const assert = require('node:assert/strict');
const { stubModules, call } = require('./helpers');

const users = [{ _id: 'u1', name: 'Test', email: 'a@b.com', password: 'hash:oldpass', isActive: true, isEmailVerified: false }];
stubModules({
  '../models/User': {
    findOne: async (q) => {
      if (q.email) return users.find(u => u.email === q.email) || null;
      if (q.resetPasswordToken) return users.find(u => u.resetPasswordToken === q.resetPasswordToken && u.resetPasswordExpires > q.resetPasswordExpires.$gt) || null;
      if (q.emailVerifyToken) return users.find(u => u.emailVerifyToken === q.emailVerifyToken && u.emailVerifyExpires > q.emailVerifyExpires.$gt) || null;
      return null;
    },
    findById: (id) => ({ select: async () => users.find(u => u._id === id) }),
    updateOne: async (f, upd) => {
      const u = users.find(x => x._id === f._id);
      Object.assign(u, upd.$set || {});
      for (const k of Object.keys(upd.$unset || {})) delete u[k];
    }
  },
  jsonwebtoken: { sign: () => 'jwt' },
  bcrypt: { hash: async (p) => 'hash:' + p, compare: async (p, h) => h === 'hash:' + p }
});
process.env.NODE_ENV = 'development';
const auth = require('../controllers/authController');

test('forgot password: empty or badly formatted email is rejected with a clear message', async () => {
  assert.match((await call(auth.forgotPassword, { body: {} })).message, /enter your email/i);
  assert.match((await call(auth.forgotPassword, { body: { email: 'nope' } })).message, /name@example\.com/);
});

test('forgot password: unknown email gets the same success answer (no account leak)', async () => {
  const res = await call(auth.forgotPassword, { body: { email: 'nobody@x.com' } });
  assert.equal(res.status, 200);
  assert.equal(res.devResetLink, undefined);
});

test('forgot, reset and reuse of the link', async () => {
  const forgot = await call(auth.forgotPassword, { body: { email: 'a@b.com' } });
  assert.equal(forgot.status, 200);
  const token = forgot.devResetLink.split('reset=')[1];
  assert.equal(token.length, 64);
  // only a hash of the token is stored
  assert.notEqual(users[0].resetPasswordToken, token);

  assert.match((await call(auth.resetPassword, { body: { token, password: '123' } })).message, /too short/);
  assert.match((await call(auth.resetPassword, { body: { token: 'wrong', password: 'newpass1' } })).message, /invalid or has expired/);

  const ok = await call(auth.resetPassword, { body: { token, password: 'newpass1' } });
  assert.equal(ok.status, 200);
  assert.equal(users[0].password, 'hash:newpass1');
  assert.equal(users[0].resetPasswordToken, undefined);

  assert.match((await call(auth.resetPassword, { body: { token, password: 'another1' } })).message, /invalid or has expired/);
});

test('change password checks current password, length and difference', async () => {
  const user = { _id: 'u1' };
  assert.match((await call(auth.changePassword, { body: { currentPassword: 'zzz', newPassword: 'brandnew' }, user })).message, /incorrect/);
  assert.match((await call(auth.changePassword, { body: { currentPassword: 'newpass1', newPassword: 'abc' }, user })).message, /too short/);
  assert.match((await call(auth.changePassword, { body: { currentPassword: 'newpass1', newPassword: 'newpass1' }, user })).message, /different/);
  const ok = await call(auth.changePassword, { body: { currentPassword: 'newpass1', newPassword: 'brandnew' }, user });
  assert.equal(ok.status, 200);
  assert.equal(users[0].password, 'hash:brandnew');
});

test('email verification: bad token fails, good token verifies once', async () => {
  const crypto = require('crypto');
  const token = 'a'.repeat(64);
  users[0].emailVerifyToken = crypto.createHash('sha256').update(token).digest('hex');
  users[0].emailVerifyExpires = new Date(Date.now() + 3600 * 1000);

  assert.match((await call(auth.verifyEmail, { body: { token: 'bad' } })).message, /invalid or has expired/);
  const ok = await call(auth.verifyEmail, { body: { token } });
  assert.equal(ok.status, 200);
  assert.equal(users[0].isEmailVerified, true);
  assert.match((await call(auth.verifyEmail, { body: { token } })).message, /invalid or has expired/);
});
