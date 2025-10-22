// Backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB, disconnectDB } = require('./config/database'); // <-- sửa: destructure
const security = require('./middleware/security');                // nếu chưa có có thể noop
const errorHandler = require('./middleware/error-handler');       // middleware cuối
// const sanitize = require('./middleware/sanitize');             // dùng nếu bạn đã viết
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// -----------------------------
// 1) MIDDLEWARE CHUNG
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bảo mật (helmet, hpp, rate-limit...) nếu bạn đã cấu hình trong file security.js
if (typeof security === 'function') security(app);

// CORS cho frontend
app.use(cors({
  origin: ORIGIN,
  credentials: true,
}));

// Làm sạch input (nếu có)
/// app.use(sanitize);

// -----------------------------
// 2) ROUTES
// -----------------------------
app.use('/api', apiRoutes);

// healthcheck (đơn giản)
app.get('/healthz', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'Backend API',
    env: process.env.NODE_ENV || 'development',
  });
});

// -----------------------------
// 3) ERROR HANDLERS (đặt cuối)
// -----------------------------
if (typeof errorHandler === 'function') {
  app.use(errorHandler);
}

// -----------------------------
// 4) BOOT & SHUTDOWN
// -----------------------------
let server;

connectDB()
  .then(() => {
    server = app.listen(PORT, () => {
      console.log(`🚀 Backend listening on http://localhost:${PORT}`);
      console.log(`🩺 Healthcheck: GET http://localhost:${PORT}/healthz`);
      console.log(`🌐 CORS origin: ${ORIGIN}`);
    });
  })
  .catch((err) => {
    console.error('❌ Kết nối Database thất bại. Thoát ứng dụng.', err);
    process.exit(1);
  });

// Graceful shutdown
async function shutdown(signal) {
  try {
    console.log(`\n📴 Received ${signal}. Closing server...`);
    if (server) await new Promise((r) => server.close(r));
    await disconnectDB();
    console.log('✅ Clean shutdown complete.');
    process.exit(0);
  } catch (e) {
    console.error('⚠️ Error during shutdown:', e);
    process.exit(1);
  }
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app; // hữu ích cho test
