"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Favorite_1 = __importDefault(require("../models/Favorite"));
const Property_1 = __importDefault(require("../models/Property"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/favorites — get user's favorites
router.get('/', auth_1.protect, async (req, res) => {
    try {
        const favorites = await Favorite_1.default.find({ userId: req.user._id })
            .populate({
            path: 'propertyId',
            populate: { path: 'sellerId', select: 'fullName email phone agencyName verificationStatus' },
        })
            .sort({ createdAt: -1 });
        const properties = favorites.map((f) => f.propertyId).filter(Boolean);
        res.json({ success: true, data: properties });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/favorites/check/:propertyId — check if property is favorited
router.get('/check/:propertyId', auth_1.protect, async (req, res) => {
    try {
        const favorite = await Favorite_1.default.findOne({ userId: req.user._id, propertyId: req.params.propertyId });
        res.json({ success: true, isFavorited: !!favorite });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/favorites — add to favorites
router.post('/', auth_1.protect, async (req, res) => {
    try {
        const { propertyId } = req.body;
        if (!propertyId) {
            res.status(400).json({ success: false, message: 'propertyId is required' });
            return;
        }
        const property = await Property_1.default.findById(propertyId);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        const favorite = await Favorite_1.default.findOneAndUpdate({ userId: req.user._id, propertyId }, { userId: req.user._id, propertyId }, { upsert: true, new: true });
        // Increment favorites count
        Property_1.default.findByIdAndUpdate(propertyId, { $inc: { favoritesCount: 1 } }).exec();
        res.status(201).json({ success: true, data: favorite });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// DELETE /api/favorites/:propertyId — remove from favorites
router.delete('/:propertyId', auth_1.protect, async (req, res) => {
    try {
        const result = await Favorite_1.default.findOneAndDelete({ userId: req.user._id, propertyId: req.params.propertyId });
        if (!result) {
            res.status(404).json({ success: false, message: 'Favorite not found' });
            return;
        }
        // Decrement favorites count
        Property_1.default.findByIdAndUpdate(req.params.propertyId, { $inc: { favoritesCount: -1 } }).exec();
        res.json({ success: true, message: 'Removed from favorites' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=favorites.js.map