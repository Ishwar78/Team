import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { enforceTenant } from '../middleware/tenantIsolation';
import { requireRole } from '../middleware/roleGuard';
import { validate } from '../middleware/validate';
import { Session } from '../models/Session';
import { Company } from '../models/Company';
import { AppError } from '../utils/errors';

const router = Router();
router.use(authenticate, enforceTenant);

/* ================= VALIDATION ================= */

const startSchema = z.object({
  device_id: z.string().uuid(),
  timestamp: z.string().datetime(),
});

/* ================= START SESSION ================= */

router.post('/start', validate(startSchema), async (req, res) => {
  const { user_id, company_id } = req.auth!;

  const company = await Company.findById(company_id);
  if (!company) throw new AppError('Company not found', 404);

  const existing = await Session.findOne({
    user_id,
    company_id,
    status: { $in: ['active', 'paused'] },
  });

  if (existing) {
    return res.json({
      session_id: existing._id,
      message: 'Session already active'
    });
  }


  const session = await Session.create({
    user_id,
    company_id,
    device_id: req.body.device_id,
    start_time: new Date(req.body.timestamp),
    status: 'active',
    events: [
      { type: 'start', timestamp: new Date(req.body.timestamp) },
    ],
  });

  res.status(201).json({
    session_id: session._id,
    startTime: session.start_time,
  });
});

/* ================= PAUSE ================= */

router.put('/:id/pause', async (req, res) => {
  const session = await Session.findOneAndUpdate(
    {
      _id: req.params.id,
      user_id: req.auth!.user_id,
      company_id: req.auth!.company_id,
      status: 'active',
    },
    {
      $set: { status: 'paused' },
      $push: { events: { type: 'pause', timestamp: new Date() } },
    },
    { new: true }
  );

  if (!session) throw new AppError('Active session not found', 404);

  res.json({ success: true });
});

/* ================= RESUME ================= */

router.put('/:id/resume', async (req, res) => {
  const session = await Session.findOneAndUpdate(
    {
      _id: req.params.id,
      user_id: req.auth!.user_id,
      company_id: req.auth!.company_id,
      status: 'paused',
    },
    {
      $set: { status: 'active' },
      $push: { events: { type: 'resume', timestamp: new Date() } },
    },
    { new: true }
  );

  if (!session) throw new AppError('Paused session not found', 404);

  res.json({ success: true });
});

/* ================= END ================= */

router.put('/:id/end', async (req, res) => {
  const session = await Session.findOneAndUpdate(
    {
      _id: req.params.id,
      user_id: req.auth!.user_id,
      company_id: req.auth!.company_id,
      status: { $in: ['active', 'paused'] },
    },
    {
      $set: {
        status: 'ended',
        end_time: new Date(),
      },
      $push: { events: { type: 'end', timestamp: new Date() } },
    },
    { new: true }
  );

  if (!session) throw new AppError('Session not found', 404);

  res.json({ success: true });
});

/* ================= ADMIN ACTIVE SESSIONS ================= */

router.get(
  '/active',
  requireRole('company_admin', 'sub_admin'),
  async (req, res) => {
    const sessions = await Session.find({
      company_id: req.auth!.company_id,
      status: { $in: ['active', 'paused'] },
    })
      .populate('user_id', 'name email')
      .lean();

    res.json({ sessions });
  }
);

export const sessionRoutes = router;
