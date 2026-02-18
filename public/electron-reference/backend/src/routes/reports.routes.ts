import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Types } from 'mongoose';

const router = Router();

// GET /summary - Overall company stats
router.get('/summary', authenticate, requireRole('company_admin', 'sub_admin'), async (req: any, res, next) => {
    try {
        const companyId = new Types.ObjectId(req.auth.company_id as string);

        // Aggregation for totals
        const totalStats = await Session.aggregate([
            { $match: { company_id: companyId } },
            {
                $group: {
                    _id: null,
                    totalActive: { $sum: "$summary.active_duration" },
                    totalIdle: { $sum: "$summary.idle_duration" },
                    totalDuration: { $sum: "$summary.total_duration" },
                    totalScreenshots: { $sum: "$summary.screenshots_count" },
                    avgScore: { $avg: "$summary.activity_score" }
                }
            }
        ]);

        const stats = totalStats[0] || { totalActive: 0, totalIdle: 0, totalDuration: 0, totalScreenshots: 0, avgScore: 0 };

        // Weekly data (last 7 days active hours)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyStats = await Session.aggregate([
            {
                $match: {
                    company_id: companyId,
                    start_time: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } },
                    hours: { $sum: "$summary.active_duration" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format weekly data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedWeekly = weeklyStats.map(d => {
            const date = new Date(d._id);
            return {
                day: days[date.getDay()],
                hours: Math.round((d.hours / 3600) * 10) / 10 // seconds to hours
            };
        });

        res.json({
            success: true,
            totals: {
                active: Math.round((stats.totalActive / 3600) * 10) / 10,
                idle: Math.round((stats.totalIdle / 3600) * 10) / 10,
                total: Math.round((stats.totalDuration / 3600) * 10) / 10,
                screenshots: stats.totalScreenshots,
                avgProd: Math.round(stats.avgScore || 0)
            },
            weekly: formattedWeekly
        });

    } catch (err) {
        next(err);
    }
});

// GET /users - Per user stats
router.get('/users', authenticate, requireRole('company_admin', 'sub_admin'), async (req: any, res, next) => {
    try {
        const companyId = new Types.ObjectId(req.auth.company_id as string);

        const userStats = await Session.aggregate([
            { $match: { company_id: companyId } },
            {
                $group: {
                    _id: "$user_id",
                    active: { $sum: "$summary.active_duration" },
                    idle: { $sum: "$summary.idle_duration" },
                    total: { $sum: "$summary.total_duration" },
                    screenshots: { $sum: "$summary.screenshots_count" },
                    avgScore: { $avg: "$summary.activity_score" }
                }
            }
        ]);

        // Populate user details and top app
        const populatedStats = await Promise.all(userStats.map(async (stat) => {
            const user = await User.findById(stat._id).select('name role').lean();

            // Get top app from ActivityLog
            const topApp = await ActivityLog.aggregate([
                { $match: { user_id: stat._id, company_id: companyId } },
                { $group: { _id: "$active_window.app_name", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 }
            ]);

            return {
                id: stat._id,
                name: user?.name || 'Unknown',
                role: user?.role || 'User',
                activeH: Math.round((stat.active / 3600) * 10) / 10,
                idleH: Math.round((stat.idle / 3600) * 10) / 10,
                totalH: Math.round((stat.total / 3600) * 10) / 10,
                screenshots: stat.screenshots,
                productivity: Math.round(stat.avgScore || 0),
                topApp: topApp[0]?._id || 'N/A'
            };
        }));

        res.json({ success: true, users: populatedStats });

    } catch (err) {
        next(err);
    }
});

export const reportRoutes = router;
