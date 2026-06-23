import { Router, Response } from 'express';
import { z } from 'zod';
import Inquiry from '../models/Inquiry';
import Property from '../models/Property';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/inquiries — buyer submits inquiry
router.post('/', protect, async (req: AuthRequest, res: Response) => {
    try {
        const schema = z.object({
            propertyId: z.string(),
            fullName: z.string().min(2),
            email: z.string().email(),
            phone: z.string().optional(),
            preferredContact: z.string().optional(),
            preferredContactTime: z.string().optional(),
            message: z.string().optional(),
            inquiryType: z.enum(['information', 'viewing', 'callback', 'offer']).default('information'),
        });

        const data = schema.parse(req.body);
        const property = await Property.findById(data.propertyId);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }

        const inquiry = await Inquiry.create({
            ...data,
            buyerId: req.user!._id,
            sellerId: property.sellerId,
        });

        res.status(201).json({ success: true, data: inquiry });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
            return;
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/inquiries — seller sees inquiries for their properties
router.get('/', protect, async (req: AuthRequest, res: Response) => {
    try {
        let filter: Record<string, any> = {};
        if (req.user!.role === 'admin') {
            filter = {};
        } else if (req.user!.role === 'seller') {
            filter = { sellerId: req.user!._id };
        } else {
            filter = { buyerId: req.user!._id };
        }

        const inquiries = await Inquiry.find(filter)
            .populate('propertyId', 'title city county')
            .populate('buyerId', 'fullName email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: inquiries });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/inquiries/:id — seller updates status/notes
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) {
            res.status(404).json({ success: false, message: 'Inquiry not found' });
            return;
        }

        const isOwner = String(inquiry.sellerId) === String(req.user!._id);
        if (!isOwner && req.user!.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const updated = await Inquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, notes: req.body.notes },
            { new: true }
        );

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
