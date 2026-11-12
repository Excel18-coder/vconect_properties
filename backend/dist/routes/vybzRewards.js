"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const VybzCoinTransaction_1 = __importDefault(require("../models/VybzCoinTransaction"));
const VybzWithdrawal_1 = __importDefault(require("../models/VybzWithdrawal"));
const VybzWallet_1 = __importDefault(require("../models/VybzWallet"));
const VybzEngagementEvent_1 = __importDefault(require("../models/VybzEngagementEvent"));
const auth_1 = require("../middleware/auth");
const vybzRewards_1 = require("../services/vybzRewards");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router.get('/wallet', async (req, res) => {
    try {
        const [wallet, config] = await Promise.all([
            (0, vybzRewards_1.settleMaturedRewards)(req.user._id),
            (0, vybzRewards_1.getVybzRewardConfig)(),
        ]);
        const transactions = await VybzCoinTransaction_1.default.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100).populate('postId', 'caption');
        res.json({ success: true, data: { wallet, transactions, config: config.toObject() } });
    }
    catch (error) {
        console.error('VYBZ wallet error:', error);
        res.status(500).json({ success: false, message: 'Unable to load VYBZ wallet' });
    }
});
router.get('/withdrawals', async (req, res) => {
    const withdrawals = await VybzWithdrawal_1.default.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: withdrawals });
});
router.get('/analytics', async (req, res) => {
    const end = req.query.to ? new Date(String(req.query.to)) : new Date();
    const start = req.query.from ? new Date(String(req.query.from)) : new Date(Date.now() - 30 * 86400000);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        res.status(400).json({ success: false, message: 'Invalid analytics date range' });
        return;
    }
    const [engagement, earnings, bestPosts] = await Promise.all([
        VybzEngagementEvent_1.default.aggregate([
            { $match: { creatorId: req.user._id, status: 'qualified', createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, type: '$type' }, count: { $sum: 1 } } },
            { $sort: { '_id.day': 1 } },
        ]),
        VybzCoinTransaction_1.default.aggregate([
            { $match: { userId: req.user._id, status: { $in: ['pending', 'available'] }, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: '$type', coins: { $sum: '$coins' } } },
        ]),
        VybzEngagementEvent_1.default.aggregate([
            { $match: { creatorId: req.user._id, status: 'qualified', createdAt: { $gte: start, $lte: end } } },
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
router.post('/withdrawals', async (req, res) => {
    const input = zod_1.z.object({
        coins: zod_1.z.number().int().positive(),
        phone: zod_1.z.string().optional(),
    }).parse(req.body);
    const config = await (0, vybzRewards_1.getVybzRewardConfig)();
    if (input.coins < config.minimumWithdrawalCoins) {
        res.status(400).json({ success: false, message: `Minimum withdrawal is ${config.minimumWithdrawalCoins} VBC` });
        return;
    }
    if (config.maximumWithdrawalCoins && input.coins > config.maximumWithdrawalCoins) {
        res.status(400).json({ success: false, message: `Maximum withdrawal is ${config.maximumWithdrawalCoins} VBC` });
        return;
    }
    const phone = await (0, vybzRewards_1.normalizeKenyanPhone)(input.phone || req.user.phone);
    if (!phone) {
        res.status(400).json({ success: false, message: 'A valid registered Kenyan mobile number is required' });
        return;
    }
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const existing = await VybzWithdrawal_1.default.exists({
            userId: req.user._id,
            status: { $in: ['pending', 'approved', 'processing'] },
        }).session(session);
        if (existing) {
            res.status(409).json({ success: false, message: 'You already have a pending withdrawal request' });
            await session.abortTransaction();
            return;
        }
        const wallet = await VybzWallet_1.default.findOneAndUpdate({ userId: req.user._id, availableCoins: { $gte: input.coins } }, { $inc: { availableCoins: -input.coins, reservedCoins: input.coins } }, { new: true, session });
        if (!wallet) {
            res.status(400).json({ success: false, message: 'Insufficient available VBC balance' });
            await session.abortTransaction();
            return;
        }
        const grossKes = Math.floor(input.coins / config.coinsPerKes);
        const feeKes = config.withdrawalFeeKes;
        const withdrawal = await VybzWithdrawal_1.default.create([{
                reference: `VYW-${new mongoose_1.default.Types.ObjectId().toString().toUpperCase()}`,
                userId: req.user._id,
                coins: input.coins,
                grossKes,
                feeKes,
                netKes: Math.max(0, grossKes - feeKes),
                phone,
                status: 'pending',
            }], { session });
        await VybzCoinTransaction_1.default.create([{
                transactionId: `VBC-${new mongoose_1.default.Types.ObjectId().toString().toUpperCase()}`,
                userId: req.user._id,
                type: 'withdrawal',
                coins: input.coins,
                kesAmount: grossKes,
                status: 'reserved',
                sourceKey: `withdrawal:${withdrawal[0].reference}`,
                description: `Reserved for withdrawal ${withdrawal[0].reference}`,
            }], { session });
        await session.commitTransaction();
        res.status(201).json({ success: true, data: withdrawal[0] });
    }
    catch (error) {
        await session.abortTransaction();
        console.error('VYBZ withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Unable to create withdrawal request' });
    }
    finally {
        await session.endSession();
    }
});
exports.default = router;
//# sourceMappingURL=vybzRewards.js.map