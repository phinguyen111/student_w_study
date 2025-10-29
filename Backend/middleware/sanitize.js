// middlewares/sanitize.js
const xss = require('xss');

function sanitizeObject(obj) {
  if (!obj) return;
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    if (typeof val === 'string') obj[k] = xss(val);       // tẩy chuỗi
    else if (val && typeof val === 'object') sanitizeObject(val); // lồng nhau
  }
}

module.exports = function sanitize(req, res, next) {
  sanitizeObject(req.body);
  sanitizeObject(req.query);    // không gán lại cả object, chỉ chỉnh từng field
  sanitizeObject(req.params);
  next();
};
