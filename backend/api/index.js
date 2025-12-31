export default async function vercelHandler(req, res) {
  try {
    // Fast health check without importing the whole app (helps debug crashes)
    const url = req?.url || "";
    if (req?.method === "GET" && (url === "/" || url === "/health" || url === "/api/health")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: true,
          path: url,
          env: {
            NODE_ENV: process.env.NODE_ENV || null,
            hasMongo: Boolean(process.env.MONGODB_URI),
            hasJwt: Boolean(process.env.JWT_SECRET),
            hasR2Endpoint: Boolean(process.env.R2_ENDPOINT),
            hasR2Bucket: Boolean(process.env.R2_BUCKET),
            hasR2AccessKey: Boolean(process.env.R2_ACCESS_KEY_ID),
            hasR2Secret: Boolean(process.env.R2_SECRET_ACCESS_KEY),
          },
        })
      );
      return;
    }

    // Vercel Node Functions use (req, res). Express app can handle this directly.
    const mod = await import("../app.js");
    const app = mod?.default;
    if (!app) {
      throw new Error("backend/app.js does not export default app");
    }
    return await app(req, res);
  } catch (error) {
    console.error("Vercel function crashed:", error);
    try {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: false,
          message: "FUNCTION_CRASH",
          error: String(error?.message || error),
        })
      );
    } catch (_e) {
      // ignore
    }
  }
}
import serverless from "serverless-http";
import app from "../app.js";

export default serverless(app);
// Vercel serverless function entry point
import app from '../app.js';
import connectDB from '../config/database.js';
import mongoose from 'mongoose';

// Ensure database is connected before handling requests
let isConnecting = false;
let connectionPromise = null;

const ensureDBConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  if (isConnecting && connectionPromise) {
    return connectionPromise; // Connection in progress
  }
  
  isConnecting = true;
  connectionPromise = connectDB().catch(err => {
    console.error('Database connection error:', err);
    isConnecting = false;
    throw err;
  });
  
  return connectionPromise;
};

// Vercel serverless function handler
export default async (req, res) => {
  try {
    // Ensure database is connected
    await ensureDBConnection();
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    // Still try to handle the request, but it may fail if DB is needed
  }
  
  // Handle the request with Express app
  return app(req, res);
};

