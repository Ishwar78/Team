import express from "express";
import helmet from "helmet";
import cors from "cors";

import { env } from "./config/env";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { superAdminRoutes } from "./routes/superAdmin.routes";

import { authRoutes } from "./routes/auth.routes";

import companyRoutes from "./routes/company.routes";
import sessionRoutes from "./routes/session.routes";
import activityRoutes from "./routes/activity.routes";
import screenshotRoutes from "./routes/screenshot.routes";
import adminRoutes from "./routes/admin.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "1mb" }));

/* ================= CORS ================= */
const allowedOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ================= STATIC ================= */
app.use("/uploads", express.static("uploads"));

/* ================= RATE LIMIT ================= */
app.use(rateLimiter);

/* ================= HEALTH ================= */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/agent/activity", activityRoutes);
app.use("/api/agent/screenshots", screenshotRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

console.log("superAdminRoutes type:", typeof superAdminRoutes);

export default app;
