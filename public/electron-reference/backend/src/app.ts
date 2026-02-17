import express from "express";
import helmet from "helmet";
import cors from "cors";

import { env } from "./config/env";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

import { superAdminRoutes } from "./routes/superAdmin.routes";
import { authRoutes } from "./routes/auth.routes";
import { companyRoutes } from "./routes/company.routes";
import { sessionRoutes } from "./routes/session.routes";
import { activityRoutes } from "./routes/activity.routes";
import { screenshotRoutes } from "./routes/screenshot.routes";
import { adminRoutes } from "./routes/admin.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { publicRoutes } from "./routes/public.routes";
import { paymentRoutes } from "./routes/payment.routes";

const app = express();

/* ================= SECURITY ================= */
app.use(helmet());

/* ================= BODY PARSER ================= */
app.use(express.json({ limit: "5mb" }));

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

/* 🔥 FIXED ACTIVITY ROUTE */
app.use("/api/activity", activityRoutes);

app.use("/api/agent/screenshots", screenshotRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/payment", paymentRoutes);

/* ================= ERROR HANDLER ================= */
app.use(errorHandler);

export default app;
