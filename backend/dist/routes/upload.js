"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });
// POST /api/upload — upload image to Cloudinary, returns { url, publicId }
router.post('/', auth_1.protect, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'media', maxCount: 1 }]), async (req, res) => {
    try {
        const files = req.files;
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
        const result = await cloudinary_1.default.uploader.upload(fileStr, {
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
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});
// DELETE /api/upload/:publicId — delete image from Cloudinary
router.delete('/:publicId', auth_1.protect, async (req, res) => {
    try {
        // Decode the publicId (it may contain slashes encoded as %2F etc)
        const publicId = decodeURIComponent(req.params.publicId);
        await cloudinary_1.default.uploader.destroy(publicId);
        res.json({ success: true, message: 'Image deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete image' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map