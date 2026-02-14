import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { Session } from '../models/Session';
import { Screenshot } from '../models/Screenshot';

export const dashboardRoutes = Router();

dashboardRoutes.get(
  '/stats',
  authenticate,
  requireRole('company_admin', 'sub_admin'),
  async (req, res, next) => {
    try {
      const companyId = req.auth!.company_id;

      const activeNow = await Session.countDocuments({
        company_id: companyId,
        status: 'active'
      });

      const screenshots = await Screenshot.countDocuments({
        company_id: companyId
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const hours = await Session.aggregate([
        {
          $match: {
            company_id: companyId,
            start_time: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$summary.total_duration" }
          }
        }
      ]);

      res.json({
        activeNow,
        screenshots,
        hoursToday: hours[0]?.total || 0
      });
    } catch (err) {
      next(err);
    }
  }
);
