"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Property_1 = __importDefault(require("../models/Property"));
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
// GET /api/properties — public, with filters, sorting, pagination
router.get('/', async (req, res) => {
    try {
        const { location, type, listing, minPrice, maxPrice, bedrooms, bathrooms, featured, sort = 'newest', page = '1', limit = '12', } = req.query;
        const filter = { status: 'active' };
        if (location) {
            filter.$or = [
                { city: { $regex: location, $options: 'i' } },
                { county: { $regex: location, $options: 'i' } },
                { fullAddress: { $regex: location, $options: 'i' } },
                { title: { $regex: location, $options: 'i' } },
            ];
        }
        if (type && type !== 'all')
            filter.propertyType = type;
        if (listing && listing !== 'all')
            filter.listingType = listing;
        if (minPrice)
            filter.price = { ...filter.price, $gte: Number(minPrice) };
        if (maxPrice)
            filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (bedrooms)
            filter.bedrooms = { $gte: Number(bedrooms) };
        if (bathrooms)
            filter.bathrooms = { $gte: Number(bathrooms) };
        if (featured === 'true')
            filter.isFeatured = true;
        const sortMap = {
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
            Property_1.default.find(filter)
                .sort(sortOrder)
                .skip(skip)
                .limit(limitNum)
                .populate('sellerId', 'fullName email phone agencyName verificationStatus avatarUrl')
                .lean(),
            Property_1.default.countDocuments(filter),
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/properties/:id — public
router.get('/:id', async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id)
            .populate('sellerId', 'fullName email phone agencyName verificationStatus avatarUrl');
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        // Increment view count asynchronously
        Property_1.default.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }).exec();
        res.json({ success: true, data: property });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/properties — seller only
router.post('/', auth_1.protect, roles_1.requireSeller, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            title: zod_1.z.string().min(3),
            description: zod_1.z.string().optional(),
            price: zod_1.z.number().positive(),
            propertyType: zod_1.z.enum(['apartment', 'house', 'villa', 'townhouse', 'commercial', 'office', 'land']),
            listingType: zod_1.z.enum(['sale', 'rent']),
            bedrooms: zod_1.z.number().min(0).default(0),
            bathrooms: zod_1.z.number().min(0).default(0),
            parkingSpaces: zod_1.z.number().min(0).default(0),
            propertySize: zod_1.z.number().positive().optional(),
            landSize: zod_1.z.number().positive().optional(),
            country: zod_1.z.string().min(1),
            county: zod_1.z.string().min(1),
            city: zod_1.z.string().min(1),
            fullAddress: zod_1.z.string().optional(),
            amenities: zod_1.z.array(zod_1.z.string()).default([]),
            features: zod_1.z.array(zod_1.z.string()).default([]),
            images: zod_1.z.array(zod_1.z.object({ url: zod_1.z.string(), publicId: zod_1.z.string(), isPrimary: zod_1.z.boolean().default(false), sortOrder: zod_1.z.number().default(0) })).default([]),
            virtualTourLink: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        });
        const data = schema.parse(req.body);
        const property = await Property_1.default.create({ ...data, sellerId: req.user._id });
        res.status(201).json({ success: true, data: property });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/properties/:id — owner or admin
router.put('/:id', auth_1.protect, async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        const isOwner = String(property.sellerId) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        // Admins can change status; owners cannot set themselves to active (must be approved)
        if (!isAdmin && req.body.status === 'active') {
            delete req.body.status;
        }
        const updated = await Property_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// DELETE /api/properties/:id — owner or admin
router.delete('/:id', auth_1.protect, async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        const isOwner = String(property.sellerId) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        await property.deleteOne();
        res.json({ success: true, message: 'Property deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/properties/seller/mine — seller's own properties
router.get('/seller/mine', auth_1.protect, roles_1.requireSeller, async (req, res) => {
    try {
        const properties = await Property_1.default.find({ sellerId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: properties });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/properties/seller/stats — seller's dashboard stats
router.get('/seller/stats', auth_1.protect, roles_1.requireSeller, async (req, res) => {
    try {
        const [totalListings, activeListings, pendingListings, totalViews, totalFavorites,] = await Promise.all([
            Property_1.default.countDocuments({ sellerId: req.user._id }),
            Property_1.default.countDocuments({ sellerId: req.user._id, status: 'active' }),
            Property_1.default.countDocuments({ sellerId: req.user._id, status: 'pending_approval' }),
            Property_1.default.aggregate([
                { $match: { sellerId: req.user._id } },
                { $group: { _id: null, total: { $sum: '$viewsCount' } } },
            ]),
            Property_1.default.aggregate([
                { $match: { sellerId: req.user._id } },
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=properties.js.map