let appPromise;

const getApp = async () => {
  if (!appPromise) {
    appPromise = import("../app.js").then((mod) => {
      if (!mod?.default) {
        throw new Error("backend/app.js does not export default app");
      }
      return mod.default;
    });
  }
  return appPromise;
};

const getPathname = (req) => {
  try {
    const url = req?.url || "/";
    return new URL(url, "http://localhost").pathname;
  } catch {
    return req?.url || "/";
  }
};

export default async function handler(req, res) {
  try {
    // Fast health check without importing the whole app
    const pathname = getPathname(req);
    if (req?.method === "GET" && (pathname === "/" || pathname === "/health" || pathname === "/api/health")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: true,
          path: pathname,
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

    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Vercel function crashed:", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
    }
    res.end(
      JSON.stringify({
        success: false,
        message: "FUNCTION_CRASH",
        error: String(error?.message || error),
      })
    );
  }
}

