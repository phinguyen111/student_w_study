// Backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB, disconnectDB } = require('./config/database');
const security = require('./middleware/security'); // nếu có, file này tự app.use bên trong
const { notFound, errorHandler } = require('./middleware/error-handler'); // <<< sửa
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// -----------------------------
// 1) MIDDLEWARE CHUNG
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bảo mật (helmet, rate-limit...) nếu bạn có cài trong file security.js
if (typeof security === 'function') security(app);

// CORS cho frontend (prod + preview vercel + local)
app.use(
  cors({
    origin: [ORIGIN, 'http://localhost:3000', /\.vercel\.app$/],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// -----------------------------
// 2) ROUTES
// -----------------------------
app.use('/api', apiRoutes);

// Healthcheck
const healthHandler = (_req, res) =>
  res.status(200).json({
    ok: true,
    service: 'Backend API',
    env: process.env.NODE_ENV || 'development',
  });

app.get('/healthz', healthHandler);
app.get('/api/health', healthHandler); // thêm để khớp Render

// -----------------------------
// 3) ERROR HANDLERS (đặt CUỐI CÙNG)
// -----------------------------
app.use(notFound);       // 404
app.use(errorHandler);   // 500 (4 tham số)

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

module.exports = app;
