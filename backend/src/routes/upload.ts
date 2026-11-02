import { Router, Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// POST /api/upload — upload image to Cloudinary, returns { url, publicId }
router.post('/', protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), async (req: AuthRequest, res: Response) => {
    try {
        const files = req.files as { image?: Express.Multer.File[]; media?: Express.Multer.File[] } | undefined;
        const file = files?.image?.[0] || files?.media?.[0];
        if (!file) {
            res.status(400).json({ success: false, message: 'No media file provided' });
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowedTypes.includes(file.mimetype)) {
            res.status(400).json({ success: false, message: 'Invalid file type. Use JPEG, PNG, WEBP, MP4, WEBM, or MOV.' });
            return;
        }

        // Convert buffer to base64 data URI for Cloudinary upload
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'vconect',
            resource_type: 'auto',
            ...(file.mimetype.startsWith('image/') ? { transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }] } : {}),
        });

        res.json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

// DELETE /api/upload/:publicId — delete image from Cloudinary
router.delete('/:publicId', protect, async (req: AuthRequest, res: Response) => {
    try {
        // Decode the publicId (it may contain slashes encoded as %2F etc)
        const publicId = decodeURIComponent(req.params.publicId);
        await cloudinary.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
});

export default router;
