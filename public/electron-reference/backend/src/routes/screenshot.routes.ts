import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middleware/auth";
import { enforceTenant } from "../middleware/tenantIsolation";
import { requireRole } from "../middleware/roleGuard";
import { Screenshot } from "../models/Screenshot";
import { AppError } from "../utils/errors";

const router = Router();
router.use(authenticate, enforceTenant);

/* ================= LOCAL UPLOAD FOLDER ================= */

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ================= AGENT UPLOAD ================= */

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError("No file uploaded", 400);
    if (!req.body.session_id)
      throw new AppError("Missing session_id", 400);

    const screenshot = await Screenshot.create({
      user_id: req.auth!.user_id,
      company_id: req.auth!.company_id,
      session_id: req.body.session_id,
      timestamp: req.body.timestamp
        ? new Date(req.body.timestamp)
        : new Date(),
      s3_key: req.file.filename,
      file_size: req.file.size,
      resolution: {
        width: Number(req.body.resolution_width || 1280),
        height: Number(req.body.resolution_height || 720),
      },
      activity_score: Number(req.body.activity_score || 0),
      active_window: {
        title: req.body.window_title || "",
        app_name: req.body.app_name || "",
      },
      blurred: false,
    });

    res.status(201).json({
      success: true,
      id: screenshot._id,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= ADMIN LIST ================= */

router.get(
  "/:userId",
  requireRole("company_admin", "sub_admin"),
  async (req, res, next) => {
    try {
      const screenshots = await Screenshot.find({
        company_id: req.auth!.company_id,
        user_id: req.params.userId,
      })
        .sort({ timestamp: -1 })
        .lean();

      res.json({ screenshots });
    } catch (err) {
      next(err);
    }
  }
);

export const screenshotRoutes = router;
