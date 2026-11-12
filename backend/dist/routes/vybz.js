"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const VybzPost_1 = __importDefault(require("../models/VybzPost"));
const VybzFollow_1 = __importDefault(require("../models/VybzFollow"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const postInput = zod_1.z.object({
    type: zod_1.z.enum(['video', 'image', 'text']),
    category: zod_1.z.enum(['videos', 'memes', 'pictures', 'stories', 'inspiration', 'art', 'text']),
    caption: zod_1.z.string().max(2000).optional().default(''),
    mediaUrl: zod_1.z.string().url().optional(),
    mediaPublicId: zod_1.z.string().optional(),
    hashtags: zod_1.z.array(zod_1.z.string().max(50)).max(20).optional().default([]),
}).superRefine((input, ctx) => {
    if (input.type === 'text' && input.category !== 'text') {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ['category'], message: 'Text posts must use the text category' });
    }
    if (input.type !== 'text' && input.category === 'text') {
        ctx.addIssue({ code: zod_1.z.ZodIssueCode.custom, path: ['type'], message: 'Text category requires a text post' });
    }
});
const populatePost = (query) => query
    .populate('authorId', 'fullName avatarUrl verificationStatus')
    .populate('comments.userId', 'fullName avatarUrl verificationStatus');
router.get('/feed', auth_1.protect, async (req, res) => {
    try {
        const { category, search, following } = req.query;
        const page = Math.max(Number.parseInt(String(req.query.page || '1'), 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || '20'), 10) || 20, 1), 50);
        const filter = {};
        if (typeof category === 'string' && !['all', 'following', 'explore'].includes(category))
            filter.category = category;
        if (typeof search === 'string' && search.trim())
            filter.$text = { $search: search.trim() };
        const visibleAuthorIds = await User_1.default.find({ verificationStatus: { $ne: 'suspended' } }).distinct('_id');
        filter.authorId = { $in: visibleAuthorIds };
        if (following === 'true') {
            const follows = await VybzFollow_1.default.find({ followerId: req.user._id }).select('followingId');
            filter.authorId = {
                $in: follows
                    .map((follow) => String(follow.followingId))
                    .filter((id) => visibleAuthorIds.some((authorId) => String(authorId) === id)),
            };
        }
        const [posts, total] = await Promise.all([
            populatePost(VybzPost_1.default.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
            VybzPost_1.default.countDocuments(filter),
        ]);
        res.json({ success: true, data: posts });
        res.setHeader('X-VYBZ-Page', String(page));
        res.setHeader('X-VYBZ-Pages', String(Math.ceil(total / limit)));
    }
    catch (error) {
        console.error('VYBZ feed error:', error);
        res.status(500).json({ success: false, message: 'Unable to load VYBZ feed' });
    }
});
router.get('/explore', auth_1.protect, async (_req, res) => {
    try {
        const visibleAuthorIds = await User_1.default.find({ verificationStatus: { $ne: 'suspended' } }).distinct('_id');
        const posts = await populatePost(VybzPost_1.default.find({ authorId: { $in: visibleAuthorIds } }).sort({ likes: -1, viewsCount: -1, createdAt: -1 }).limit(30));
        const creators = await User_1.default.find().select('fullName avatarUrl verificationStatus').sort({ createdAt: -1 }).limit(12);
        res.json({ success: true, data: { posts, creators } });
    }
    catch (error) {
        console.error('VYBZ explore error:', error);
        res.status(500).json({ success: false, message: 'Unable to load VYBZ explore' });
    }
});
router.post('/posts', auth_1.protect, async (req, res) => {
    try {
        const input = postInput.parse(req.body);
        if (input.type !== 'text' && !input.mediaUrl) {
            res.status(400).json({ success: false, message: 'Media is required for this post type' });
            return;
        }
        const post = await VybzPost_1.default.create({
            ...input,
            authorId: req.user._id,
            hashtags: input.hashtags.map((tag) => tag.replace(/^#/, '').toLowerCase()),
        });
        res.status(201).json({ success: true, data: await populatePost(VybzPost_1.default.findById(post._id)) });
    }
    catch (error) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid post details', errors: error.errors });
            return;
        }
        console.error('VYBZ create post error:', error);
        res.status(500).json({ success: false, message: 'Unable to publish post' });
    }
});
router.post('/posts/:id/view', auth_1.protect, async (req, res) => {
    try {
        const post = await VybzPost_1.default.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('VYBZ view error:', error);
        res.status(500).json({ success: false, message: 'Unable to record view' });
    }
});
router.post('/posts/:id/like', auth_1.protect, async (req, res) => {
    try {
        const post = await VybzPost_1.default.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const userId = req.user._id;
        const index = post.likes.findIndex((id) => id.equals(userId));
        if (index >= 0)
            post.likes.splice(index, 1);
        else
            post.likes.push(userId);
        await post.save();
        res.json({ success: true, liked: index < 0, likesCount: post.likes.length });
    }
    catch {
        res.status(500).json({ success: false, message: 'Unable to update like' });
    }
});
router.post('/posts/:id/comments', auth_1.protect, async (req, res) => {
    try {
        const text = zod_1.z.string().trim().min(1).max(500).parse(req.body.text);
        const post = await VybzPost_1.default.findByIdAndUpdate(req.params.id, { $push: { comments: { userId: req.user._id, text } } }, { new: true });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, data: post.comments[post.comments.length - 1] });
    }
    catch {
        res.status(400).json({ success: false, message: 'Comment must contain 1 to 500 characters' });
    }
});
router.post('/follow/:userId', auth_1.protect, async (req, res) => {
    try {
        if (String(req.user._id) === req.params.userId) {
            res.status(400).json({ success: false, message: 'You cannot follow yourself' });
            return;
        }
        const existing = await VybzFollow_1.default.findOne({ followerId: req.user._id, followingId: req.params.userId });
        if (existing) {
            await existing.deleteOne();
            res.json({ success: true, following: false });
            return;
        }
        await VybzFollow_1.default.create({ followerId: req.user._id, followingId: req.params.userId });
        res.json({ success: true, following: true });
    }
    catch {
        res.status(500).json({ success: false, message: 'Unable to update follow' });
    }
});
router.delete('/posts/:id', auth_1.protect, async (req, res) => {
    const post = await VybzPost_1.default.findOneAndDelete({ _id: req.params.id, authorId: req.user._id });
    if (!post) {
        res.status(404).json({ success: false, message: 'Post not found or not owned by you' });
        return;
    }
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=vybz.js.map