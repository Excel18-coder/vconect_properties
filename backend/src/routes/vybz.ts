import { Router, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import VybzPost from '../models/VybzPost';
import VybzFollow from '../models/VybzFollow';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import VybzEngagementEvent from '../models/VybzEngagementEvent';
import { createPendingReward, getVybzRewardConfig, recordQualifiedView } from '../services/vybzRewards';

const router = Router();
const postInput = z.object({
    type: z.enum(['video', 'image', 'text']),
    category: z.enum(['videos', 'memes', 'pictures', 'stories', 'inspiration', 'art', 'text']),
    caption: z.string().max(2000).optional().default(''),
    mediaUrl: z.string().url().optional(),
    mediaPublicId: z.string().optional(),
    hashtags: z.array(z.string().max(50)).max(20).optional().default([]),
}).superRefine((input, ctx) => {
    if (input.type === 'text' && input.category !== 'text') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['category'], message: 'Text posts must use the text category' });
    }
    if (input.type !== 'text' && input.category === 'text') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['type'], message: 'Text category requires a text post' });
    }
});

const populatePost = (query: any) => query
    .populate('authorId', 'fullName avatarUrl verificationStatus')
    .populate('comments.userId', 'fullName avatarUrl verificationStatus');

router.get('/feed', protect, async (req: AuthRequest, res: Response) => {
    try {
        const { category, search, following } = req.query;
        const page = Math.max(Number.parseInt(String(req.query.page || '1'), 10) || 1, 1);
        const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || '20'), 10) || 20, 1), 50);
        const filter: Record<string, any> = {};
        if (typeof category === 'string' && !['all', 'following', 'explore'].includes(category)) filter.category = category;
        if (typeof search === 'string' && search.trim()) filter.$text = { $search: search.trim() };
        const visibleAuthorIds = await User.find({ verificationStatus: { $ne: 'suspended' } }).distinct('_id');
        filter.authorId = { $in: visibleAuthorIds };
        if (following === 'true') {
            const follows = await VybzFollow.find({ followerId: req.user!._id }).select('followingId');
            filter.authorId = {
                $in: follows
                    .map((follow) => String(follow.followingId))
                    .filter((id) => visibleAuthorIds.some((authorId) => String(authorId) === id)),
            };
        }
        const [posts, total] = await Promise.all([
            populatePost(VybzPost.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)),
            VybzPost.countDocuments(filter),
        ]);
        res.setHeader('X-VYBZ-Page', String(page));
        res.setHeader('X-VYBZ-Pages', String(Math.ceil(total / limit)));
        res.json({ success: true, data: posts });
    } catch (error) {
        console.error('VYBZ feed error:', error);
        res.status(500).json({ success: false, message: 'Unable to load VYBZ feed' });
    }
});

router.get('/explore', protect, async (_req: AuthRequest, res: Response) => {
    try {
        const visibleAuthorIds = await User.find({ verificationStatus: { $ne: 'suspended' } }).distinct('_id');
        const posts = await populatePost(VybzPost.find({ authorId: { $in: visibleAuthorIds } }).sort({ likes: -1, viewsCount: -1, createdAt: -1 }).limit(30));
        const creators = await User.find().select('fullName avatarUrl verificationStatus').sort({ createdAt: -1 }).limit(12);
        res.json({ success: true, data: { posts, creators } });
    } catch (error) {
        console.error('VYBZ explore error:', error);
        res.status(500).json({ success: false, message: 'Unable to load VYBZ explore' });
    }
});

router.post('/posts', protect, async (req: AuthRequest, res: Response) => {
    try {
        const input = postInput.parse(req.body);
        if (input.type !== 'text' && !input.mediaUrl) {
            res.status(400).json({ success: false, message: 'Media is required for this post type' });
            return;
        }
        const post = await VybzPost.create({
            ...input,
            authorId: req.user!._id,
            hashtags: input.hashtags.map((tag) => tag.replace(/^#/, '').toLowerCase()),
        });
        res.status(201).json({ success: true, data: await populatePost(VybzPost.findById(post._id)) });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ success: false, message: 'Invalid post details', errors: error.errors });
            return;
        }
        console.error('VYBZ create post error:', error);
        res.status(500).json({ success: false, message: 'Unable to publish post' });
    }
});

router.post('/posts/:id/view', protect, async (req: AuthRequest, res: Response) => {
    try {
        const post = await VybzPost.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }, { new: true });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const watchSeconds = z.number().min(0).max(86400).optional().parse(req.body?.watchSeconds);
        const qualified = watchSeconds === undefined
            ? { qualified: false, reason: 'watch_duration_required' }
            : await recordQualifiedView({
                postId: post._id,
                creatorId: post.authorId,
                viewerId: req.user!._id,
                watchSeconds,
                qualificationKey: new Date().toISOString().slice(0, 10),
            });
        res.json({ success: true, qualified: qualified.qualified });
    } catch (error) {
        console.error('VYBZ view error:', error);
        res.status(500).json({ success: false, message: 'Unable to record view' });
    }
});

router.post('/posts/:id/like', protect, async (req: AuthRequest, res: Response) => {
    try {
        const post = await VybzPost.findById(req.params.id);
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const userId = req.user!._id;
        if (post.authorId.equals(userId)) {
            res.status(400).json({ success: false, message: 'You cannot like your own post' });
            return;
        }
        const index = post.likes.findIndex((id) => id.equals(userId));
        if (index >= 0) post.likes.splice(index, 1);
        else {
            post.likes.push(userId);
            const config = await getVybzRewardConfig();
            if (config.rewardsActive) {
                try {
                    await VybzEngagementEvent.create({
                        postId: post._id,
                        creatorId: post.authorId,
                        viewerId: userId,
                        type: 'like',
                        status: 'qualified',
                        qualificationKey: 'lifetime',
                    });
                    await createPendingReward({
                        userId: post.authorId,
                        postId: post._id,
                        type: 'like_reward',
                        coins: config.coinsPerLike,
                        sourceKey: `like:${post._id}:${userId}`,
                        description: 'Eligible unique like',
                    });
                    const eligibleLikes = await VybzEngagementEvent.countDocuments({
                        postId: post._id,
                        type: 'like',
                        status: 'qualified',
                    });
                    if (eligibleLikes === config.likeBonusThreshold) {
                        await createPendingReward({
                            userId: post.authorId,
                            postId: post._id,
                            type: 'bonus',
                            coins: config.likeBonusCoins,
                            sourceKey: `bonus:like:${post._id}:${config.likeBonusThreshold}`,
                            description: `${config.likeBonusThreshold} eligible like bonus`,
                        });
                    }
                } catch (error: any) {
                    if (error?.code !== 11000) throw error;
                }
            }
        }
        await post.save();
        res.json({ success: true, liked: index < 0, likesCount: post.likes.length });
    } catch {
        res.status(500).json({ success: false, message: 'Unable to update like' });
    }
});

router.post('/posts/:id/comments', protect, async (req: AuthRequest, res: Response) => {
    try {
        const text = z.string().trim().min(1).max(500).parse(req.body.text);
        const post = await VybzPost.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: { userId: req.user!._id, text } } },
            { new: true }
        );
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        res.json({ success: true, data: post.comments[post.comments.length - 1] });
    } catch {
        res.status(400).json({ success: false, message: 'Comment must contain 1 to 500 characters' });
    }
});

router.post('/follow/:userId', protect, async (req: AuthRequest, res: Response) => {
    try {
        if (String(req.user!._id) === req.params.userId) {
            res.status(400).json({ success: false, message: 'You cannot follow yourself' });
            return;
        }
        const existing = await VybzFollow.findOne({ followerId: req.user!._id, followingId: req.params.userId });
        if (existing) {
            await existing.deleteOne();
            res.json({ success: true, following: false });
            return;
        }
        await VybzFollow.create({ followerId: req.user!._id, followingId: req.params.userId });
        res.json({ success: true, following: true });
    } catch {
        res.status(500).json({ success: false, message: 'Unable to update follow' });
    }
});

router.delete('/posts/:id', protect, async (req: AuthRequest, res: Response) => {
    const post = await VybzPost.findOneAndDelete({ _id: req.params.id, authorId: req.user!._id });
    if (!post) {
        res.status(404).json({ success: false, message: 'Post not found or not owned by you' });
        return;
    }
    res.json({ success: true });
});

export default router;
