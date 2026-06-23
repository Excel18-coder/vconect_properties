import { Router, Response } from 'express';
import { z } from 'zod';
import Property from '../models/Property';
import Favorite from '../models/Favorite';
import { protect, AuthRequest } from '../middleware/auth';
import { requireSeller } from '../middleware/roles';
import { SortOrder } from 'mongoose';

const router = Router();

// GET /api/properties — public, with filters, sorting, pagination
router.get('/', async (req, res: Response) => {
    try {
        const {
            location, type, listing, minPrice, maxPrice, bedrooms, bathrooms, featured,
            sort = 'newest', page = '1', limit = '12',
        } = req.query as Record<string, string>;

        const filter: Record<string, any> = { status: 'active' };

        if (location) {
            filter.$or = [
                { city: { $regex: location, $options: 'i' } },
                { county: { $regex: location, $options: 'i' } },
                { fullAddress: { $regex: location, $options: 'i' } },
                { title: { $regex: location, $options: 'i' } },
            ];
        }
        if (type && type !== 'all') filter.propertyType = type;
        if (listing && listing !== 'all') filter.listingType = listing;
        if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
        if (bathrooms) filter.bathrooms = { $gte: Number(bathrooms) };
        if (featured === 'true') filter.isFeatured = true;

        const sortMap: Record<string, Record<string, SortOrder>> = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            views: { viewsCount: -1 },
        };
        const sortOrder = sortMap[sort] || sortMap.newest;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(50, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [properties, total] = await Promise.all([
            Property.find(filter)
                .sort(sortOrder)
                .skip(skip)
                .limit(limitNum)
                .populate('sellerId', 'fullName email phone agencyName verificationStatus avatarUrl')
                .lean(),
            Property.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: properties,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/properties/:id — public
router.get('/:id', async (req, res: Response) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('sellerId', 'fullName email phone agencyName verificationStatus avatarUrl');

        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }

        // Increment view count asynchronously
        Property.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }).exec();

        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/properties — seller only
router.post('/', protect, requireSeller, async (req: AuthRequest, res: Response) => {
    try {
        const schema = z.object({
            title: z.string().min(3),
            description: z.string().optional(),
            price: z.number().positive(),
            propertyType: z.enum(['apartment', 'house', 'villa', 'townhouse', 'commercial', 'office', 'land']),
            listingType: z.enum(['sale', 'rent']),
            bedrooms: z.number().min(0).default(0),
            bathrooms: z.number().min(0).default(0),
            parkingSpaces: z.number().min(0).default(0),
            propertySize: z.number().positive().optional(),
            landSize: z.number().positive().optional(),
            country: z.string().min(1),
            county: z.string().min(1),
            city: z.string().min(1),
            fullAddress: z.string().optional(),
            amenities: z.array(z.string()).default([]),
            features: z.array(z.string()).default([]),
            images: z.array(z.object({ url: z.string(), publicId: z.string(), isPrimary: z.boolean().default(false), sortOrder: z.number().default(0) })).default([]),
            virtualTourLink: z.string().url().optional().or(z.literal('')),
        });

        const data = schema.parse(req.body);
        const property = await Property.create({ ...data, sellerId: req.user!._id });
        res.status(201).json({ success: true, data: property });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/properties/:id — owner or admin
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }

        const isOwner = String(property.sellerId) === String(req.user!._id);
        const isAdmin = req.user!.role === 'admin';

        if (!isOwner && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        // Admins can change status; owners cannot set themselves to active (must be approved)
        if (!isAdmin && req.body.status === 'active') {
            delete req.body.status;
        }

        const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/properties/:id — owner or admin
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }

        const isOwner = String(property.sellerId) === String(req.user!._id);
        const isAdmin = req.user!.role === 'admin';
        if (!isOwner && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        await property.deleteOne();
        res.json({ success: true, message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/properties/seller/mine — seller's own properties
router.get('/seller/mine', protect, requireSeller, async (req: AuthRequest, res: Response) => {
    try {
        const properties = await Property.find({ sellerId: req.user!._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/properties/seller/stats — seller's dashboard stats
router.get('/seller/stats', protect, requireSeller, async (req: AuthRequest, res: Response) => {
    try {
        const [
            totalListings,
            activeListings,
            pendingListings,
            totalViews,
            totalFavorites,
        ] = await Promise.all([
            Property.countDocuments({ sellerId: req.user!._id }),
            Property.countDocuments({ sellerId: req.user!._id, status: 'active' }),
            Property.countDocuments({ sellerId: req.user!._id, status: 'pending_approval' }),
            Property.aggregate([
                { $match: { sellerId: req.user!._id } },
                { $group: { _id: null, total: { $sum: '$viewsCount' } } },
            ]),
            Property.aggregate([
                { $match: { sellerId: req.user!._id } },
                { $group: { _id: null, total: { $sum: '$favoritesCount' } } },
            ]),
        ]);

        res.json({
            success: true,
            data: {
                totalListings,
                activeListings,
                pendingListings,
                totalViews: totalViews[0]?.total || 0,
                totalFavorites: totalFavorites[0]?.total || 0,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
