"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Not authorized — no token' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET not configured');
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_1.default.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        if (user.verificationStatus === 'suspended') {
            res.status(403).json({ success: false, message: 'Account suspended' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized — invalid token' });
    }
};
exports.protect = protect;
//# sourceMappingURL=auth.js.map