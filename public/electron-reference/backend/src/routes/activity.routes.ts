import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { ActivityLog } from '../models/ActivityLog';

const router = Router();

router.use(authenticate, enforceTenant);

/* =======================================================
   VALIDATION SCHEMA
======================================================= */

const schema = z.object({
  session_id: z.string(),
  logs: z.array(
    z.object({
      timestamp: z.string().datetime(),
      interval_start: z.string().datetime(),
      interval_end: z.string().datetime(),
      keyboard_events: z.number().optional(),
      mouse_events: z.number().optional(),
      mouse_distance: z.number().optional(),
      activity_score: z.number().min(0).max(100),
      idle: z.boolean().optional(),
      active_window: z.object({
        title: z.string(),
        app_name: z.string(),
        url: z.string().optional(),
        category: z.string().optional()
      })
    })
  )
});

/* =======================================================
   CREATE ACTIVITY LOGS
======================================================= */

router.post('/', validate(schema), async (req, res) => {

  const docs = req.body.logs.map((log: any) => ({
    user_id: req.auth!.user_id,
    company_id: req.auth!.company_id,
    session_id: new Types.ObjectId(req.body.session_id),

    timestamp: new Date(log.timestamp),
    interval_start: new Date(log.interval_start),
    interval_end: new Date(log.interval_end),

    keyboard_events: log.keyboard_events || 0,
    mouse_events: log.mouse_events || 0,
    mouse_distance: log.mouse_distance || 0,
    activity_score: log.activity_score,
    idle: log.idle || false,

    active_window: {
      title: log.active_window.title,
      app_name: log.active_window.app_name,
      url: log.active_window.url || "",
      category: log.active_window.category || "Other"
    }
  }));

  await ActivityLog.insertMany(docs);

  res.json({ success: true });
});

/* =======================================================
   TIMELINE DATA (USED BY FRONTEND)
======================================================= */

router.get('/timeline', async (req, res) => {
  const { user_id, start_date, end_date } = req.query;

  const logs = await ActivityLog.find({
    user_id,
    company_id: req.auth!.company_id,
    timestamp: {
      $gte: new Date(start_date as string),
      $lte: new Date(end_date as string)
    }
  })
    .sort({ interval_start: 1 })
    .lean();

  res.json({ success: true, logs });
});

/* =======================================================
   USAGE AGGREGATION (APPS + URLS)
======================================================= */

router.get('/usage', async (req, res, next) => {
  try {
    const { userId, period } = req.query;
    const companyId = req.auth!.company_id;

    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setHours(0, 0, 0, 0);
    }

    const match: any = {
      company_id: new Types.ObjectId(companyId as string),
      timestamp: { $gte: startDate }
    };

    if (userId && userId !== 'all') {
      match.user_id = new Types.ObjectId(userId as string);
    }

    /* ================= APPS ================= */

    const apps = await ActivityLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$active_window.app_name",
          totalSeconds: {
            $sum: {
              $divide: [
                { $subtract: ["$interval_end", "$interval_start"] },
                1000
              ]
            }
          },
          users: { $addToSet: "$user_id" },
          category: { $first: "$active_window.category" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          seconds: { $round: ["$totalSeconds", 0] },
          users: { $size: "$users" },
          category: { $ifNull: ["$category", "Other"] }
        }
      },
      { $sort: { seconds: -1 } }
    ]);

    /* ================= URLS ================= */

    const urls = await ActivityLog.aggregate([
      {
        $match: {
          ...match,
          "active_window.url": { $exists: true, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$active_window.url",
          totalSeconds: {
            $sum: {
              $divide: [
                { $subtract: ["$interval_end", "$interval_start"] },
                1000
              ]
            }
          },
          visits: { $sum: 1 },
          category: { $first: "$active_window.category" }
        }
      },
      {
        $project: {
          _id: 0,
          url: "$_id",
          seconds: { $round: ["$totalSeconds", 0] },
          visits: 1,
          category: { $ifNull: ["$category", "Web"] }
        }
      },
      { $sort: { seconds: -1 } }
    ]);

    res.json({
      success: true,
      apps,
      urls
    });

  } catch (err) {
    next(err);
  }
});

/* =======================================================
   PRODUCTIVITY %
======================================================= */

router.get('/productivity', async (req, res) => {

  const result = await ActivityLog.aggregate([
    {
      $match: {
        company_id: new Types.ObjectId(req.auth!.company_id)
      }
    },
    {
      $group: {
        _id: "$user_id",
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ["$idle", false] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        user_id: "$_id",
        productivity: {
          $round: [
            { $multiply: [{ $divide: ["$active", "$total"] }, 100] },
            0
          ]
        }
      }
    }
  ]);

  res.json({ success: true, data: result });
});

export const activityRoutes = router;
