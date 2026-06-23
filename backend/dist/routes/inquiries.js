"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
const Property_1 = __importDefault(require("../models/Property"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/inquiries — buyer submits inquiry
router.post('/', auth_1.protect, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            propertyId: zod_1.z.string(),
            fullName: zod_1.z.string().min(2),
            email: zod_1.z.string().email(),
            phone: zod_1.z.string().optional(),
            preferredContact: zod_1.z.string().optional(),
            preferredContactTime: zod_1.z.string().optional(),
            message: zod_1.z.string().optional(),
            inquiryType: zod_1.z.enum(['information', 'viewing', 'callback', 'offer']).default('information'),
        });
        const data = schema.parse(req.body);
        const property = await Property_1.default.findById(data.propertyId);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        const inquiry = await Inquiry_1.default.create({
            ...data,
            buyerId: req.user._id,
            sellerId: property.sellerId,
        });
        res.status(201).json({ success: true, data: inquiry });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/inquiries — seller sees inquiries for their properties
router.get('/', auth_1.protect, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'admin') {
            filter = {};
        }
        else if (req.user.role === 'seller') {
            filter = { sellerId: req.user._id };
        }
        else {
            filter = { buyerId: req.user._id };
        }
        const inquiries = await Inquiry_1.default.find(filter)
            .populate('propertyId', 'title city county')
            .populate('buyerId', 'fullName email phone')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: inquiries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/inquiries/:id — seller updates status/notes
router.put('/:id', auth_1.protect, async (req, res) => {
    try {
        const inquiry = await Inquiry_1.default.findById(req.params.id);
        if (!inquiry) {
            res.status(404).json({ success: false, message: 'Inquiry not found' });
            return;
        }
        const isOwner = String(inquiry.sellerId) === String(req.user._id);
        if (!isOwner && req.user.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const updated = await Inquiry_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status, notes: req.body.notes }, { new: true });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=inquiries.js.map