import { Router, Response } from 'express';
import User from '../models/User';
import Property from '../models/Property';
import Inquiry from '../models/Inquiry';
import { protect, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';

const router = Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (_req, res: Response) => {
    try {
        const [
            totalUsers,
            totalSellers,
            totalBuyers,
            totalProperties,
            pendingListings,
            activeListings,
            featuredListings,
            totalInquiries,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'seller' }),
            User.countDocuments({ role: 'buyer' }),
            Property.countDocuments(),
            Property.countDocuments({ status: 'pending_approval' }),
            Property.countDocuments({ status: 'active' }),
            Property.countDocuments({ isFeatured: true }),
            Inquiry.countDocuments(),
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalBuyers,
                totalProperties,
                pendingListings,
                activeListings,
                featuredListings,
                totalInquiries,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res: Response) => {
    try {
        const { role, status, limit = '50', page = '1' } = req.query as Record<string, string>;
        const filter: Record<string, any> = {};
        if (role) filter.role = role;
        if (status) filter.verificationStatus = status;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            User.countDocuments(filter),
        ]);

        res.json({ success: true, data: users, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res: Response) => {
    try {
        const { verificationStatus, role } = req.body;
        const update: Record<string, any> = {};
        if (verificationStatus) update.verificationStatus = verificationStatus;
        if (role) update.role = role;

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/properties
router.get('/properties', async (req, res: Response) => {
    try {
        const { status, limit = '50', page = '1' } = req.query as Record<string, string>;
        const filter: Record<string, any> = {};
        if (status) filter.status = status;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const [properties, total] = await Promise.all([
            Property.find(filter)
                .populate('sellerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Property.countDocuments(filter),
        ]);

        res.json({ success: true, data: properties, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/properties/:id
router.put('/properties/:id', async (req, res: Response) => {
    try {
        const { status, isFeatured } = req.body;
        const update: Record<string, any> = {};
        if (status) update.status = status;
        if (typeof isFeatured === 'boolean') update.isFeatured = isFeatured;

        const property = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/inquiries
router.get('/inquiries', async (req, res: Response) => {
    try {
        const { limit = '50', page = '1' } = req.query as Record<string, string>;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const [inquiries, total] = await Promise.all([
            Inquiry.find()
                .populate('propertyId', 'title city county')
                .populate('buyerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Inquiry.countDocuments(),
        ]);

        res.json({ success: true, data: inquiries, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
