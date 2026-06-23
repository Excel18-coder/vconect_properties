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
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// POST /api/upload — upload image to Cloudinary, returns { url, publicId }
router.post('/', auth_1.protect, upload.single('image'), async (req, res) => {
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
        const result = await cloudinary_1.default.uploader.upload(fileStr, {
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