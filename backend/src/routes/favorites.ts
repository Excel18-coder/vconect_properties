import { Router, Response } from 'express';
import Favorite from '../models/Favorite';
import Property from '../models/Property';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/favorites — get user's favorites
router.get('/', protect, async (req: AuthRequest, res: Response) => {
    try {
        const favorites = await Favorite.find({ userId: req.user!._id })
            .populate({
                path: 'propertyId',
                populate: { path: 'sellerId', select: 'fullName email phone agencyName verificationStatus' },
            })
            .sort({ createdAt: -1 });

        const properties = favorites.map((f: any) => f.propertyId).filter(Boolean);
        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/favorites/check/:propertyId — check if property is favorited
router.get('/check/:propertyId', protect, async (req: AuthRequest, res: Response) => {
    try {
        const favorite = await Favorite.findOne({ userId: req.user!._id, propertyId: req.params.propertyId });
        res.json({ success: true, isFavorited: !!favorite });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/favorites — add to favorites
router.post('/', protect, async (req: AuthRequest, res: Response) => {
    try {
        const { propertyId } = req.body;
        if (!propertyId) {
            res.status(400).json({ success: false, message: 'propertyId is required' });
            return;
        }

        const property = await Property.findById(propertyId);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }

        const favorite = await Favorite.findOneAndUpdate(
            { userId: req.user!._id, propertyId },
            { userId: req.user!._id, propertyId },
            { upsert: true, new: true }
        );

        // Increment favorites count
        Property.findByIdAndUpdate(propertyId, { $inc: { favoritesCount: 1 } }).exec();

        res.status(201).json({ success: true, data: favorite });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/favorites/:propertyId — remove from favorites
router.delete('/:propertyId', protect, async (req: AuthRequest, res: Response) => {
    try {
        const result = await Favorite.findOneAndDelete({ userId: req.user!._id, propertyId: req.params.propertyId });
        if (!result) {
            res.status(404).json({ success: false, message: 'Favorite not found' });
            return;
        }

        // Decrement favorites count
        Property.findByIdAndUpdate(req.params.propertyId, { $inc: { favoritesCount: -1 } }).exec();

        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
