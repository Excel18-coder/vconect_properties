"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/profile/me
router.get('/me', auth_1.protect, async (req, res) => {
    res.json({ success: true, data: req.user });
});
// PUT /api/profile/me
router.put('/me', auth_1.protect, async (req, res) => {
    try {
        const schema = zod_1.z.object({
            fullName: zod_1.z.string().min(2).optional(),
            phone: zod_1.z.string().optional(),
            agencyName: zod_1.z.string().optional(),
            businessDetails: zod_1.z.string().optional(),
            country: zod_1.z.string().optional(),
            county: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            address: zod_1.z.string().optional(),
            avatarUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
        });
        const data = schema.parse(req.body);
        const updated = await User_1.default.findByIdAndUpdate(req.user._id, data, {
            new: true,
            runValidators: true,
        }).select('-password');
        res.json({ success: true, data: updated });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=profile.js.map