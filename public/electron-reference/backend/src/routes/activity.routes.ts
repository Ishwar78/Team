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

// const schema = z.object({
//   session_id: z.string(),
//   logs: z.array(z.object({
//     timestamp: z.string().datetime(),
//     activity_score: z.number().min(0).max(100),
//   })),
// });



const schema = z.object({
  session_id: z.string(),
  logs: z.array(z.object({
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
  }))
});




router.post('/', validate(schema), async (req, res) => {
  // const docs = req.body.logs.map((log: any) => ({
  //   ...log,
  //   user_id: req.auth!.user_id,
  //   company_id: req.auth!.company_id,
  //   session_id: req.body.session_id,
  //   timestamp: new Date(log.timestamp),
  // }));



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

/* ================= USAGE AGGREGATION ================= */

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
      // today
      startDate.setHours(0, 0, 0, 0);
    }

    const match: any = {
      company_id: new Types.ObjectId(companyId as string),
      timestamp: { $gte: startDate }
    };

    if (userId && userId !== 'all') {
      match.user_id = new Types.ObjectId(userId as string);
    }

    const apps = await ActivityLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$active_window.app_name",
          totalSeconds: {
            $sum: {
              $divide: [{ $subtract: ["$interval_end", "$interval_start"] }, 1000]
            }
          },
          users: { $addToSet: "$user_id" },
          category: { $first: "$active_window.category" }
        }
      },
      {
        $project: {
          name: "$_id",
          hours: { $divide: ["$totalSeconds", 3600] },
          users: { $size: "$users" },
          category: { $ifNull: ["$category", "Other"] }
        }
      },
      { $sort: { hours: -1 } }
    ]);

    const urls = await ActivityLog.aggregate([
      { $match: { ...match, "active_window.url": { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$active_window.url",
          totalSeconds: {
            $sum: {
              $divide: [{ $subtract: ["$interval_end", "$interval_start"] }, 1000]
            }
          },
          visits: { $sum: 1 },
          category: { $first: "$active_window.category" }
        }
      },
      {
        $project: {
          url: "$_id",
          hours: { $divide: ["$totalSeconds", 3600] },
          visits: "$visits",
          category: { $ifNull: ["$category", "Web"] }
        }
      },
      { $sort: { hours: -1 } }
    ]);

    res.json({ apps, urls });
  } catch (err) {
    next(err);
  }
});

export const activityRoutes = router;
