import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import VybzCoinTransaction from '../models/VybzCoinTransaction';
import VybzWithdrawal from '../models/VybzWithdrawal';
import VybzWallet from '../models/VybzWallet';
import VybzEngagementEvent from '../models/VybzEngagementEvent';
import { protect, AuthRequest } from '../middleware/auth';
import { getVybzRewardConfig, normalizeKenyanPhone, settleMaturedRewards } from '../services/vybzRewards';

const router = Router();

router.use(protect);

router.get('/wallet', async (req: AuthRequest, res: Response) => {
    try {
        const [wallet, config] = await Promise.all([
            settleMaturedRewards(req.user!._id),
            getVybzRewardConfig(),
        ]);
        const transactions = await VybzCoinTransaction.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(100).populate('postId', 'caption');
        res.json({ success: true, data: { wallet, transactions, config: config.toObject() } });
    } catch (error) {
        console.error('VYBZ wallet error:', error);
        res.status(500).json({ success: false, message: 'Unable to load VYBZ wallet' });
    }
});

router.get('/withdrawals', async (req: AuthRequest, res: Response) => {
    const withdrawals = await VybzWithdrawal.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: withdrawals });
});

router.get('/analytics', async (req: AuthRequest, res: Response) => {
    const end = req.query.to ? new Date(String(req.query.to)) : new Date();
    const start = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        res.status(400).json({ success: false, message: 'Invalid analytics date range' });
        return;
    }
    const [engagement, earnings, bestPosts] = await Promise.all([
        VybzEngagementEvent.aggregate([
            { $match: { creatorId: req.user!._id, status: 'qualified', createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' }, count: { $sum: 1 } } },
            { $sort: { '_id.day': 1 } },
        ]),
        VybzCoinTransaction.aggregate([
            { $match: { userId: req.user!._id, status: { $in: ['pending', 'available'] }, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: '$type', coins: { $sum: '$coins' } } },
        ]),
        VybzEngagementEvent.aggregate([
            { $match: { creatorId: req.user!._id, status: 'qualified', createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: '$postId', engagements: { $sum: 1 } } },
            { $sort: { engagements: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'vybzposts', localField: '_id', foreignField: '_id', as: 'post' } },
            { $unwind: '$post' },
            { $project: { _id: 1, engagements: 1, caption: '$post.caption' } },
        ]),
    ]);
    res.json({ success: true, data: { from: start, to: end, engagement, earnings, bestPosts } });
});

router.post('/withdrawals', async (req: AuthRequest, res: Response) => {
    const input = z.object({
        coins: z.number().int().positive(),
        phone: z.string().optional(),
    }).parse(req.body);
    const config = await getVybzRewardConfig();
    if (input.coins < config.minimumWithdrawalCoins) {
        res.status(400).json({ success: false, message: `Minimum withdrawal is ${config.minimumWithdrawalCoins} VBC` });
        return;
    }
    if (config.maximumWithdrawalCoins && input.coins > config.maximumWithdrawalCoins) {
        res.status(400).json({ success: false, message: `Maximum withdrawal is ${config.maximumWithdrawalCoins} VBC` });
        return;
    }
    const phone = await normalizeKenyanPhone(input.phone || req.user!.phone);
    if (!phone) {
        res.status(400).json({ success: false, message: 'A valid registered Kenyan mobile number is required' });
        return;
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const existing = await VybzWithdrawal.exists({
            userId: req.user!._id,
            status: { $in: ['pending', 'approved', 'processing'] },
        }).session(session);
        if (existing) {
            res.status(409).json({ success: false, message: 'You already have a pending withdrawal request' });
            await session.abortTransaction();
            return;
        }
        const wallet = await VybzWallet.findOneAndUpdate(
            { userId: req.user!._id, availableCoins: { $gte: input.coins } },
            { $inc: { availableCoins: -input.coins, reservedCoins: input.coins } },
            { new: true, session }
        );
        if (!wallet) {
            res.status(400).json({ success: false, message: 'Insufficient available VBC balance' });
            await session.abortTransaction();
            return;
        }
        const grossKes = Math.floor(input.coins / config.coinsPerKes);
        const feeKes = config.withdrawalFeeKes;
        const withdrawal = await VybzWithdrawal.create([{
            reference: `VYW-${new mongoose.Types.ObjectId().toString().toUpperCase()}`,
            userId: req.user!._id,
            coins: input.coins,
            grossKes,
            feeKes,
            netKes: Math.max(0, grossKes - feeKes),
            phone,
            status: 'pending',
        }], { session });
        await VybzCoinTransaction.create([{
            transactionId: `VBC-${new mongoose.Types.ObjectId().toString().toUpperCase()}`,
            userId: req.user!._id,
            type: 'withdrawal',
            coins: input.coins,
            kesAmount: grossKes,
            status: 'reserved',
            sourceKey: `withdrawal:${withdrawal[0].reference}`,
            description: `Reserved for withdrawal ${withdrawal[0].reference}`,
        }], { session });
        await session.commitTransaction();
        res.status(201).json({ success: true, data: withdrawal[0] });
    } catch (error) {
        await session.abortTransaction();
        console.error('VYBZ withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Unable to create withdrawal request' });
    } finally {
        await session.endSession();
    }
});

export default router;
