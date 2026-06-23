"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign({ id }, secret, { expiresIn });
};
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const schema = zod_1.z.object({
            fullName: zod_1.z.string().min(2),
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6),
            role: zod_1.z.enum(['buyer', 'seller']).default('buyer'),
        });
        const { fullName, email, password, role } = schema.parse(req.body);
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }
        const finalRole = email === 'vconectproperties@gmail.com' ? 'admin' : role;
        const user = await User_1.default.create({ fullName, email, password, role: finalRole });
        const token = generateToken(String(user._id));
        res.status(201).json({ success: true, token, user });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const schema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(1),
        });
        const { email, password } = schema.parse(req.body);
        const user = await User_1.default.findOne({ email }).select('+password');
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
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/auth/me  (requires auth)
router.get('/me', auth_1.protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});
exports.default = router;
//# sourceMappingURL=auth.js.map