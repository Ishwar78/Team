import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Company } from '../models/Company';
import { User } from '../models/User';
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

router.post('/register', async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Invalid input', 400);

  const { companyName, domain, adminName, email, password } = parsed.data;

  const existing = await Company.findOne({ domain: domain.toLowerCase() });
  if (existing) throw new AppError('Domain already exists', 400);

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
});

/* ================= LIST USERS ================= */

router.get(
  '/users',
  authenticate,
  requireRole('company_admin', 'sub_admin'),
  async (req, res) => {
    const users = await User.find({
      company_id: req.auth!.company_id,
      role: { $ne: 'super_admin' },
    }).select('-password_hash');

    res.json({ users });
  }
);

export const companyRoutes = router;
