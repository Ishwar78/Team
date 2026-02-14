import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { AppError } from '../utils/errors';

const router = Router();

/* ================= CREATE COMPANY ================= */
router.post(
  '/company',
  authenticate,
  requireRole('super_admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, domain, adminEmail, adminPassword } = req.body;

      if (!name || !adminEmail || !adminPassword) {
        throw new AppError('Missing fields', 400);
      }

      const company = await Company.create({
        name,
        domain,
        max_users: 10,
      });

      const hashed = await bcrypt.hash(adminPassword, 10);

      const admin = await User.create({
        company_id: company._id,
        email: adminEmail,
        password_hash: hashed,
        name: 'Company Admin',
        role: 'company_admin',
        status: 'active',
      });

      res.status(201).json({
        company,
        admin: {
          id: admin._id,
          email: admin.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/* ================= GET ALL COMPANIES ================= */
router.get(
  '/companies',
  authenticate,
  requireRole('super_admin'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await Company.find().sort({ createdAt: -1 });
      res.json({ companies });
    } catch (err) {
      next(err);
    }
  }
);

export const superAdminRoutes = router;
