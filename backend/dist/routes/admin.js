"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Property_1 = __importDefault(require("../models/Property"));
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const router = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_1.protect, roles_1.requireAdmin);
// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
    try {
        const [totalUsers, totalSellers, totalBuyers, totalProperties, pendingListings, activeListings, featuredListings, totalInquiries,] = await Promise.all([
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ role: 'seller' }),
            User_1.default.countDocuments({ role: 'buyer' }),
            Property_1.default.countDocuments(),
            Property_1.default.countDocuments({ status: 'pending_approval' }),
            Property_1.default.countDocuments({ status: 'active' }),
            Property_1.default.countDocuments({ isFeatured: true }),
            Inquiry_1.default.countDocuments(),
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role, status, limit = '50', page = '1' } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (status)
            filter.verificationStatus = status;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const [users, total] = await Promise.all([
            User_1.default.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            User_1.default.countDocuments(filter),
        ]);
        res.json({ success: true, data: users, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
    try {
        const { verificationStatus, role } = req.body;
        const update = {};
        if (verificationStatus)
            update.verificationStatus = verificationStatus;
        if (role)
            update.role = role;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/admin/properties
router.get('/properties', async (req, res) => {
    try {
        const { status, limit = '50', page = '1' } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const [properties, total] = await Promise.all([
            Property_1.default.find(filter)
                .populate('sellerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Property_1.default.countDocuments(filter),
        ]);
        res.json({ success: true, data: properties, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/admin/properties/:id
router.put('/properties/:id', async (req, res) => {
    try {
        const { status, isFeatured } = req.body;
        const update = {};
        if (status)
            update.status = status;
        if (typeof isFeatured === 'boolean')
            update.isFeatured = isFeatured;
        const property = await Property_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        res.json({ success: true, data: property });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/admin/inquiries
router.get('/inquiries', async (req, res) => {
    try {
        const { limit = '50', page = '1' } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const [inquiries, total] = await Promise.all([
            Inquiry_1.default.find()
                .populate('propertyId', 'title city county')
                .populate('buyerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Inquiry_1.default.countDocuments(),
        ]);
        res.json({ success: true, data: inquiries, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map