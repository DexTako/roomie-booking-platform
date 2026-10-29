// Stops NoSQL injection: removes keys that start with "$" or contain "." from request data,
// so input like { "email": { "$gt": "" } } can never become a database operator.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      result[key] = clean(value[key]);
    }
    return result;
  }
  return value;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query) {
    // req.query can be read-only in some Express versions, so clean it in place
    const cleaned = clean(req.query);
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, cleaned);
  }
  next();
};

module.exports = { sanitizeRequest, clean };
