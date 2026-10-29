// Small helpers shared by the tests: fake Express response + module stubbing (no database needed).
const Module = require('module');

// Replace modules (e.g. database models) with fakes while the code under test is loaded
exports.stubModules = (fakes) => {
  const original = Module._load;
  Module._load = function (request) {
    return Object.prototype.hasOwnProperty.call(fakes, request) ? fakes[request] : original.apply(this, arguments);
  };
};

// Calls an Express controller and returns { status, ...json }
exports.call = async (fn, req) => {
  let out;
  const res = {
    status(code) { this.code = code; return this; },
    json(body) { out = { status: this.code || 200, ...body }; return this; }
  };
  await fn(req, res);
  return out;
};

exports.day = (offset) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);
