import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { Company } from '../models/Company';
import { User } from '../models/User';
import { Invitation } from '../models/Invitation';
import { Plan } from '../models/Plan';
import { AppError } from '../utils/errors';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

/* ================= REGISTER ================= */

const schema = z.object({
  companyName: z.string().min(2),
  domain: z.string().min(2),
  adminName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

router.post('/register', async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }

    const { companyName, domain, adminName, email, password } = parsed.data;

    const existing = await Company.findOne({ domain: domain.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Domain already exists' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name: companyName,
      domain: domain.toLowerCase(),
    });

    const admin = await User.create({
      company_id: company._id,
      email: email.toLowerCase(),
      password_hash: hashed,
      name: adminName,
      role: 'company_admin',
      status: 'active',
    });

    res.status(201).json({
      company: company._id,
      admin: admin._id,
    });
  } catch (err) {
    next(err);
  }
});

/* ================= LIST USERS ================= */

router.get(
  '/users',
  authenticate,
  requireRole('company_admin', 'sub_admin'),
  async (req, res) => {
    console.log('Entering /users handler, company_id:', req.auth!.company_id);
    const users = await User.find({
      company_id: req.auth!.company_id,
      role: { $ne: 'super_admin' },
    }).select('-password_hash');

    res.json({ users });
  }
);

/* ================= DETAILS ================= */

router.get(
  '/details',
  authenticate,
  requireRole('company_admin', 'sub_admin'),
  async (req, res, next) => {
    try {
      const company = await Company.findById(req.auth!.company_id).populate('plan_id').lean();
      if (!company) throw new AppError('Company not found', 404);

      res.json({ success: true, company });
    } catch (err) {
      next(err);
    }
  }
);

/* ================= INVITATIONS ================= */

router.get(
  '/invites',
  authenticate,
  requireRole('company_admin', 'sub_admin'),
  async (req, res) => {
    const invites = await Invitation.find({
      company_id: req.auth!.company_id,
      status: 'pending'
    }).sort({ createdAt: -1 });

    res.json({ invites });
  }
);

router.post(
  '/invites',
  authenticate,
  requireRole('company_admin'),
  async (req, res, next) => {
    try {
      const { email, role } = req.body;

      if (!email || !role) {
        throw new AppError('Email and role are required', 400);
      }

      const company = await Company.findById(req.auth!.company_id);
      if (!company) throw new AppError('Company not found', 404);

      // Check user limit
      const currentUsersCount = await User.countDocuments({ company_id: company._id });
      const pendingInvitesCount = await Invitation.countDocuments({
        company_id: company._id,
        status: 'pending'
      });

      if (currentUsersCount + pendingInvitesCount >= company.max_users) {
        throw new AppError('User limit reached for your plan. Please upgrade.', 403);
      }

      // Check if already invited or exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) throw new AppError('User already exists in system', 400);

      const existingInvite = await Invitation.findOne({
        email: email.toLowerCase(),
        company_id: company._id,
        status: 'pending'
      });
      if (existingInvite) throw new AppError('Invitation already sent to this email', 400);

      const token = crypto.randomBytes(20).toString('hex');
      const invitation = await Invitation.create({
        email: email.toLowerCase(),
        company_id: company._id,
        role,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      res.status(201).json({ success: true, invitation });
    } catch (err) {
      next(err);
    }
  }
);

export const companyRoutes = router;
