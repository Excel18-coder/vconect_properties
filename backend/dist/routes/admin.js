"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vybzPayoutCallbackRouter = void 0;
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const Property_1 = __importDefault(require("../models/Property"));
const Inquiry_1 = __importDefault(require("../models/Inquiry"));
const auth_1 = require("../middleware/auth");
const roles_1 = require("../middleware/roles");
const VybzRewardConfig_1 = __importDefault(require("../models/VybzRewardConfig"));
const VybzWallet_1 = __importDefault(require("../models/VybzWallet"));
const VybzWithdrawal_1 = __importDefault(require("../models/VybzWithdrawal"));
const VybzCoinTransaction_1 = __importDefault(require("../models/VybzCoinTransaction"));
const VybzRewardsBudget_1 = __importDefault(require("../models/VybzRewardsBudget"));
const VybzFraudFlag_1 = __importDefault(require("../models/VybzFraudFlag"));
const mongoose_1 = __importDefault(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const zod_1 = require("zod");
const payments_1 = require("./payments");
const vybzPayouts_1 = require("../services/vybzPayouts");
const router = (0, express_1.Router)();
exports.vybzPayoutCallbackRouter = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_1.protect, roles_1.requireAdmin);
router.get('/vybz/rewards', async (_req, res) => {
    const config = await VybzRewardConfig_1.default.findOne();
    const [pending, paid, rejected, totals] = await Promise.all([
        VybzWithdrawal_1.default.countDocuments({ status: 'pending' }),
        VybzWithdrawal_1.default.countDocuments({ status: 'paid' }),
        VybzWithdrawal_1.default.countDocuments({ status: 'rejected' }),
        VybzWithdrawal_1.default.aggregate([{ $group: { _id: null, grossKes: { $sum: '$grossKes' }, netKes: { $sum: '$netKes' }, fees: { $sum: '$feeKes' } } }]),
    ]);
    res.json({
        success: true,
        data: {
            config,
            counts: { pending, paid, rejected },
            totals: totals[0] || { grossKes: 0, netKes: 0, fees: 0 },
        },
    });
});
router.put('/vybz/rewards', async (req, res) => {
    const update = zod_1.z.object({
        coinsPerThousandViews: zod_1.z.number().int().min(0).optional(),
        coinsPerLike: zod_1.z.number().int().min(0).optional(),
        viewThreshold: zod_1.z.number().int().positive().optional(),
        minimumWithdrawalCoins: zod_1.z.number().int().positive().optional(),
        maximumWithdrawalCoins: zod_1.z.number().int().positive().optional(),
        coinsPerKes: zod_1.z.number().int().positive().optional(),
        withdrawalFeeKes: zod_1.z.number().int().min(0).optional(),
        verificationPeriodDays: zod_1.z.number().int().min(0).optional(),
        minimumWatchSeconds: zod_1.z.number().min(0).optional(),
        shortVideoCompletionPercent: zod_1.z.number().min(0).max(100).optional(),
        viewBonusThreshold: zod_1.z.number().int().positive().optional(),
        viewBonusCoins: zod_1.z.number().int().min(0).optional(),
        likeBonusThreshold: zod_1.z.number().int().positive().optional(),
        likeBonusCoins: zod_1.z.number().int().min(0).optional(),
        dailyEarningLimit: zod_1.z.number().int().min(0).optional(),
        monthlyEarningLimit: zod_1.z.number().int().min(0).optional(),
        rewardsActive: zod_1.z.boolean().optional(),
    }).strict().parse(req.body);
    update.updatedBy = req.user._id;
    const config = await VybzRewardConfig_1.default.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ success: true, data: config });
});
router.get('/vybz/budget', async (_req, res) => {
    const period = new Date().toISOString().slice(0, 7);
    const budget = await VybzRewardsBudget_1.default.findOne({ period });
    res.json({ success: true, data: budget });
});
router.put('/vybz/budget', async (req, res) => {
    const input = zod_1.z.object({
        budgetCoins: zod_1.z.number().int().min(0),
        active: zod_1.z.boolean().optional(),
    }).parse(req.body);
    const period = new Date().toISOString().slice(0, 7);
    const budget = await VybzRewardsBudget_1.default.findOneAndUpdate({ period }, { $set: { ...input, updatedBy: req.user._id } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ success: true, data: budget });
});
router.get('/vybz/fraud-flags', async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : 'open';
    const flags = await VybzFraudFlag_1.default.find({ status }).populate('userId', 'fullName email').populate('postId', 'caption').sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: flags });
});
router.put('/vybz/fraud-flags/:id', async (req, res) => {
    const status = zod_1.z.enum(['open', 'dismissed', 'confirmed']).parse(req.body.status);
    const flag = await VybzFraudFlag_1.default.findByIdAndUpdate(req.params.id, { $set: { status, reviewedBy: req.user._id, reviewedAt: new Date() } }, { new: true });
    if (!flag) {
        res.status(404).json({ success: false, message: 'Fraud flag not found' });
        return;
    }
    res.json({ success: true, data: flag });
});
router.get('/vybz/withdrawals', async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const filter = status ? { status } : {};
    const withdrawals = await VybzWithdrawal_1.default.find(filter)
        .populate('userId', 'fullName email phone')
        .populate('approvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(200);
    res.json({ success: true, data: withdrawals });
});
router.post('/vybz/withdrawals/:id/reject', async (req, res) => {
    const session = await mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const withdrawal = await VybzWithdrawal_1.default.findOneAndUpdate({ _id: req.params.id, status: 'pending' }, { $set: { status: 'rejected', rejectionReason: String(req.body.reason || 'Rejected by administrator') } }, { new: true, session });
        if (!withdrawal) {
            await session.abortTransaction();
            res.status(404).json({ success: false, message: 'Pending withdrawal not found' });
            return;
        }
        await VybzWallet_1.default.findOneAndUpdate({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, availableCoins: withdrawal.coins } }, { session });
        await VybzCoinTransaction_1.default.updateOne({ sourceKey: `withdrawal:${withdrawal.reference}`, status: 'reserved' }, { $set: { status: 'reversed' } }, { session });
        await session.commitTransaction();
        res.json({ success: true, data: withdrawal });
    }
    catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: 'Unable to reject withdrawal' });
    }
    finally {
        await session.endSession();
    }
});
router.post('/vybz/withdrawals/:id/approve', async (req, res) => {
    const withdrawal = await VybzWithdrawal_1.default.findOneAndUpdate({ _id: req.params.id, status: 'pending' }, { $set: { status: 'approved', approvedBy: req.user._id, approvedAt: new Date() } }, { new: true });
    if (!withdrawal) {
        res.status(404).json({ success: false, message: 'Pending withdrawal not found' });
        return;
    }
    res.json({ success: true, data: withdrawal });
});
router.post('/vybz/withdrawals/:id/pay', async (req, res) => {
    const withdrawal = await VybzWithdrawal_1.default.findOneAndUpdate({ _id: req.params.id, status: 'approved', providerReference: { $exists: false } }, { $set: { status: 'processing', paymentAttemptId: crypto_1.default.randomUUID() } }, { new: true });
    if (!withdrawal) {
        res.status(409).json({ success: false, message: 'Withdrawal is not approved or has already been submitted' });
        return;
    }
    try {
        const baseUrl = (0, payments_1.getPayHeroBaseUrl)();
        const discoveryUrl = new URL(`${baseUrl}/api/global/discovery/discover-rails`);
        discoveryUrl.searchParams.set('country', 'KE');
        const discoveryResponse = await fetch(discoveryUrl, { headers: (0, payments_1.buildPayHeroHeaders)() });
        const discovery = await discoveryResponse.json();
        if (!discoveryResponse.ok)
            throw new Error(discovery.message || 'PayHero payout network discovery failed');
        const providers = discovery.available_providers?.momo || [];
        const networks = providers
            .flatMap((provider) => (discovery.provider_networks?.[provider] || []).map((network) => ({ ...network, provider })))
            .filter((network) => network.ramp_type === 'withdraw' && network.status === 'active');
        if (!networks.length)
            throw new Error('PayHero has no active Kenya mobile-money withdrawal network enabled for this account');
        const network = networks[0];
        const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() || req.protocol;
        const callbackUrl = `${forwardedProto}://${req.get('host')}/api/payments/webhook/payhero`;
        const providerResponse = await fetch(`${baseUrl}/api/global/payments`, {
            method: 'POST',
            headers: (0, payments_1.buildPayHeroHeaders)(),
            body: JSON.stringify({
                request_type: 'withdrawal',
                transaction_channel: 'momo',
                provider: network.provider,
                amount: withdrawal.netKes,
                currency: 'KES',
                country: 'KE',
                reason: `VYBZ creator withdrawal ${withdrawal.reference}`,
                provider_config: {
                    network_id: network.network_id,
                    network_name: network.network_name,
                    network_code: network.network_code,
                    channel_id: network.channel_id,
                    account_type: network.channel_type || 'momo',
                },
                payment_config: {
                    reference: withdrawal.reference,
                    account_number: withdrawal.phone.startsWith('0') ? `+254${withdrawal.phone.slice(1)}` : withdrawal.phone,
                    callback_url: callbackUrl,
                },
            }),
        });
        const payload = await providerResponse.json().catch(() => ({}));
        if (!providerResponse.ok)
            throw new Error(payload.message || `Payout provider returned ${providerResponse.status}`);
        const providerReference = (0, payments_1.extractGatewayReference)(payload);
        if (providerReference) {
            await VybzWithdrawal_1.default.findByIdAndUpdate(withdrawal._id, { $set: { providerReference } });
        }
        res.json({ success: true, data: { withdrawal, provider: payload } });
    }
    catch (error) {
        await VybzWithdrawal_1.default.findByIdAndUpdate(withdrawal._id, { $set: { status: 'failed' } });
        await VybzWallet_1.default.findOneAndUpdate({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, availableCoins: withdrawal.coins } });
        await VybzCoinTransaction_1.default.updateOne({ sourceKey: `withdrawal:${withdrawal.reference}`, status: 'reserved' }, { $set: { status: 'reversed' } });
        res.status(502).json({ success: false, message: error.message || 'Payout provider request failed' });
    }
});
exports.vybzPayoutCallbackRouter.post('/vybz/withdrawals/callback', async (req, res) => {
    const reference = String(req.body.reference || '');
    const status = String(req.body.status || '').toLowerCase();
    if (!reference) {
        res.status(400).json({ success: false, message: 'Missing withdrawal reference' });
        return;
    }
    await (0, vybzPayouts_1.reconcileVybzPayout)(reference, status, String(req.body.providerReference || req.body.transactionId || ''));
    res.json({ success: true });
});
// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
    try {
        const [totalUsers, totalSellers, totalBuyers, totalProperties, pendingListings, activeListings, featuredListings, totalInquiries,] = await Promise.all([
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ role: 'seller' }),
            User_1.default.countDocuments({ role: 'buyer' }),
            Property_1.default.countDocuments(),
            Property_1.default.countDocuments({ status: 'pending_approval' }),
            Property_1.default.countDocuments({ status: 'active' }),
            Property_1.default.countDocuments({ isFeatured: true }),
            Inquiry_1.default.countDocuments(),
        ]);
        res.json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalBuyers,
                totalProperties,
                pendingListings,
                activeListings,
                featuredListings,
                totalInquiries,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const { role, status, limit = '50', page = '1' } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (status)
            filter.verificationStatus = status;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const [users, total] = await Promise.all([
            User_1.default.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            User_1.default.countDocuments(filter),
        ]);
        res.json({ success: true, data: users, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
    try {
        const { verificationStatus, role } = req.body;
        const update = {};
        if (verificationStatus)
            update.verificationStatus = verificationStatus;
        if (role)
            update.role = role;
        const user = await User_1.default.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/admin/properties
router.get('/properties', async (req, res) => {
    try {
        const { status, limit = '50', page = '1' } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const [properties, total] = await Promise.all([
            Property_1.default.find(filter)
                .populate('sellerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Property_1.default.countDocuments(filter),
        ]);
        res.json({ success: true, data: properties, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/admin/properties/:id
router.put('/properties/:id', async (req, res) => {
    try {
        const { status, isFeatured } = req.body;
        const update = {};
        if (status)
            update.status = status;
        if (typeof isFeatured === 'boolean')
            update.isFeatured = isFeatured;
        const property = await Property_1.default.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        res.json({ success: true, data: property });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/admin/inquiries
router.get('/inquiries', async (req, res) => {
    try {
        const { limit = '50', page = '1' } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const [inquiries, total] = await Promise.all([
            Inquiry_1.default.find()
                .populate('propertyId', 'title city county')
                .populate('buyerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Inquiry_1.default.countDocuments(),
        ]);
        res.json({ success: true, data: inquiries, pagination: { total, page: pageNum, limit: limitNum } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map