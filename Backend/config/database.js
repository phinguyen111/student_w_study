// Backend/config/database.js
require('dotenv').config();
const mongoose = require('mongoose');

// Giữ kết nối dùng lại giữa các lần import (hữu ích cho dev/hot-reload)
let cached = global.__mongooseConn;
if (!cached) cached = (global.__mongooseConn = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI in .env');

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((m) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`✅ MongoDB connected: ${m.connection.host}/${m.connection.name}`);
      }
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    if (process.env.NODE_ENV !== 'test') {
      console.log('🛑 MongoDB disconnected');
    }
  }
}

module.exports = { connectDB, disconnectDB };
