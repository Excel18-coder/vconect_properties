import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

const generateToken = (id: string): string => {
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
    try {
        const schema = z.object({
            fullName: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(['buyer', 'seller']).default('buyer'),
        });

        const { fullName, email, password, role } = schema.parse(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }

        const finalRole = email === 'vconectproperties@gmail.com' ? 'admin' : role;
        const user = await User.create({ fullName, email, password, role: finalRole });
        const token = generateToken(String(user._id));

        res.status(201).json({ success: true, token, user });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
    try {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(1),
        });

        const { email, password } = schema.parse(req.body);

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        if (user.verificationStatus === 'suspended') {
            res.status(403).json({ success: false, message: 'Account suspended' });
            return;
        }

        const token = generateToken(String(user._id));
        // Return user without password
        const userObj = user.toJSON();
        res.json({ success: true, token, user: userObj });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/auth/me  (requires auth)
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
    res.json({ success: true, user: req.user });
});

export default router;
