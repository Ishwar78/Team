import { Router } from 'express';
import { Plan } from '../models/Plan';

const router = Router();

// GET Public Plans
router.get('/plans', async (_req, res, next) => {
    try {
        const plans = await Plan.find({ isActive: true }).select('name price_monthly max_users features isPopular').sort({ price_monthly: 1 }).lean();

        const formatted = plans.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price_monthly,
            users: p.max_users,
            features: p.features || [],
            popular: (p as any).isPopular || false // Assuming we might add this field later or use a logic
        }));

        res.json({ success: true, data: formatted });
    } catch (err) { next(err); }
});

export const publicRoutes = router;
