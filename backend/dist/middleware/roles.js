"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSeller = exports.requireAdmin = exports.requireRole = void 0;
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireSeller = (0, exports.requireRole)('seller', 'admin');
//# sourceMappingURL=roles.js.map