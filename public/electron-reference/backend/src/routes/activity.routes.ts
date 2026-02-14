import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { ActivityLog } from '../models/ActivityLog';

const router = Router();
router.use(authenticate, enforceTenant);

const schema = z.object({
  session_id: z.string(),
  logs: z.array(z.object({
    timestamp: z.string().datetime(),
    activity_score: z.number().min(0).max(100),
  })),
});

router.post('/', validate(schema), async (req, res) => {
  const docs = req.body.logs.map((log: any) => ({
    ...log,
    user_id: req.auth!.user_id,
    company_id: req.auth!.company_id,
    session_id: req.body.session_id,
    timestamp: new Date(log.timestamp),
  }));

  await ActivityLog.insertMany(docs);

  res.json({ success: true });
});

export const activityRoutes = router;
