import { Router, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile/me
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: req.user });
});

// PUT /api/profile/me
router.put('/me', protect, async (req: AuthRequest, res: Response) => {
    try {
        const schema = z.object({
            fullName: z.string().min(2).optional(),
            phone: z.string().optional(),
            agencyName: z.string().optional(),
            businessDetails: z.string().optional(),
            country: z.string().optional(),
            county: z.string().optional(),
            city: z.string().optional(),
            address: z.string().optional(),
            avatarUrl: z.string().url().optional().or(z.literal('')),
        });

        const data = schema.parse(req.body);

        const updated = await User.findByIdAndUpdate(req.user!._id, data, {
            new: true,
            runValidators: true,
        }).select('-password');

        res.json({ success: true, data: updated });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
