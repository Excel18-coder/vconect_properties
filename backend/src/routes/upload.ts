import { Router, Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload — upload image to Cloudinary, returns { url, publicId }
router.post('/', protect, upload.single('image'), async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No image file provided' });
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG, PNG, WEBP allowed.' });
            return;
        }

        // Convert buffer to base64 data URI for Cloudinary upload
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const result = await cloudinary.uploader.upload(fileStr, {
            folder: 'vconect_properties',
            transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto:good' }],
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
