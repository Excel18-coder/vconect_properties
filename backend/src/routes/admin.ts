import { Router, Response } from 'express';
import User from '../models/User';
import Property from '../models/Property';
import Inquiry from '../models/Inquiry';
import { protect, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/roles';
import VybzRewardConfig from '../models/VybzRewardConfig';
import VybzWallet from '../models/VybzWallet';
import VybzWithdrawal from '../models/VybzWithdrawal';
import VybzCoinTransaction from '../models/VybzCoinTransaction';
import VybzRewardsBudget from '../models/VybzRewardsBudget';
import VybzFraudFlag from '../models/VybzFraudFlag';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { z } from 'zod';
import { buildPayHeroHeaders, extractGatewayReference, getPayHeroBaseUrl } from './payments';
import { reconcileVybzPayout } from '../services/vybzPayouts';

const router = Router();
export const vybzPayoutCallbackRouter = Router();

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

router.get('/vybz/rewards', async (_req, res: Response) => {
    const config = await VybzRewardConfig.findOne();
    const [pending, paid, rejected, totals] = await Promise.all([
        VybzWithdrawal.countDocuments({ status: 'pending' }),
        VybzWithdrawal.countDocuments({ status: 'paid' }),
        VybzWithdrawal.countDocuments({ status: 'rejected' }),
        VybzWithdrawal.aggregate([{ $group: { _id: null, grossKes: { $sum: '$grossKes' }, netKes: { $sum: '$netKes' }, fees: { $sum: '$feeKes' } } }]),
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

router.put('/vybz/rewards', async (req: AuthRequest, res: Response) => {
    const update: Record<string, unknown> = z.object({
        coinsPerThousandViews: z.number().int().min(0).optional(),
        coinsPerLike: z.number().int().min(0).optional(),
        viewThreshold: z.number().int().positive().optional(),
        minimumWithdrawalCoins: z.number().int().positive().optional(),
        maximumWithdrawalCoins: z.number().int().positive().optional(),
        coinsPerKes: z.number().int().positive().optional(),
        withdrawalFeeKes: z.number().int().min(0).optional(),
        verificationPeriodDays: z.number().int().min(0).optional(),
        minimumWatchSeconds: z.number().min(0).optional(),
        shortVideoCompletionPercent: z.number().min(0).max(100).optional(),
        viewBonusThreshold: z.number().int().positive().optional(),
        viewBonusCoins: z.number().int().min(0).optional(),
        likeBonusThreshold: z.number().int().positive().optional(),
        likeBonusCoins: z.number().int().min(0).optional(),
        dailyEarningLimit: z.number().int().min(0).optional(),
        monthlyEarningLimit: z.number().int().min(0).optional(),
        rewardsActive: z.boolean().optional(),
    }).strict().parse(req.body);
    update.updatedBy = req.user!._id;
    const config = await VybzRewardConfig.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ success: true, data: config });
});

router.get('/vybz/budget', async (_req, res: Response) => {
    const period = new Date().toISOString().slice(0, 7);
    const budget = await VybzRewardsBudget.findOne({ period });
    res.json({ success: true, data: budget });
});

router.put('/vybz/budget', async (req: AuthRequest, res: Response) => {
    const input = z.object({
        budgetCoins: z.number().int().min(0),
        active: z.boolean().optional(),
    }).parse(req.body);
    const period = new Date().toISOString().slice(0, 7);
    const budget = await VybzRewardsBudget.findOneAndUpdate(
        { period },
        { $set: { ...input, updatedBy: req.user!._id } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: budget });
});

router.get('/vybz/fraud-flags', async (req, res: Response) => {
    const status = typeof req.query.status === 'string' ? req.query.status : 'open';
    const flags = await VybzFraudFlag.find({ status }).populate('userId', 'fullName email').populate('postId', 'caption').sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: flags });
});

router.put('/vybz/fraud-flags/:id', async (req: AuthRequest, res: Response) => {
    const status = z.enum(['open', 'dismissed', 'confirmed']).parse(req.body.status);
    const flag = await VybzFraudFlag.findByIdAndUpdate(
        req.params.id,
        { $set: { status, reviewedBy: req.user!._id, reviewedAt: new Date() } },
        { new: true }
    );
    if (!flag) {
        res.status(404).json({ success: false, message: 'Fraud flag not found' });
        return;
    }
    res.json({ success: true, data: flag });
});

router.get('/vybz/withdrawals', async (req, res: Response) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const filter = status ? { status } : {};
    const withdrawals = await VybzWithdrawal.find(filter)
        .populate('userId', 'fullName email phone')
        .populate('approvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(200);
    res.json({ success: true, data: withdrawals });
});

router.post('/vybz/withdrawals/:id/reject', async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const withdrawal = await VybzWithdrawal.findOneAndUpdate(
            { _id: req.params.id, status: 'pending' },
            { $set: { status: 'rejected', rejectionReason: String(req.body.reason || 'Rejected by administrator') } },
            { new: true, session }
        );
        if (!withdrawal) {
            await session.abortTransaction();
            res.status(404).json({ success: false, message: 'Pending withdrawal not found' });
            return;
        }
        await VybzWallet.findOneAndUpdate(
            { userId: withdrawal.userId },
            { $inc: { reservedCoins: -withdrawal.coins, availableCoins: withdrawal.coins } },
            { session }
        );
        await VybzCoinTransaction.updateOne(
            { sourceKey: `withdrawal:${withdrawal.reference}`, status: 'reserved' },
            { $set: { status: 'reversed' } },
            { session }
        );
        await session.commitTransaction();
        res.json({ success: true, data: withdrawal });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: 'Unable to reject withdrawal' });
    } finally {
        await session.endSession();
    }
});

router.post('/vybz/withdrawals/:id/approve', async (req: AuthRequest, res: Response) => {
    const withdrawal = await VybzWithdrawal.findOneAndUpdate(
        { _id: req.params.id, status: 'pending' },
        { $set: { status: 'approved', approvedBy: req.user!._id, approvedAt: new Date() } },
        { new: true }
    );
    if (!withdrawal) {
        res.status(404).json({ success: false, message: 'Pending withdrawal not found' });
        return;
    }
    res.json({ success: true, data: withdrawal });
});

router.post('/vybz/withdrawals/:id/pay', async (req, res: Response) => {
    const withdrawal = await VybzWithdrawal.findOneAndUpdate(
        { _id: req.params.id, status: 'approved', providerReference: { $exists: false } },
        { $set: { status: 'processing', paymentAttemptId: crypto.randomUUID() } },
        { new: true }
    );
    if (!withdrawal) {
        res.status(409).json({ success: false, message: 'Withdrawal is not approved or has already been submitted' });
        return;
    }
    try {
        const baseUrl = getPayHeroBaseUrl();
        const discoveryUrl = new URL(`${baseUrl}/api/global/discovery/discover-rails`);
        discoveryUrl.searchParams.set('country', 'KE');
        const discoveryResponse = await fetch(discoveryUrl, { headers: buildPayHeroHeaders() });
        const discovery = await discoveryResponse.json() as any;
        if (!discoveryResponse.ok) throw new Error(discovery.message || 'PayHero payout network discovery failed');
        const providers = discovery.available_providers?.momo || [];
        const networks = providers
            .flatMap((provider: string) => (discovery.provider_networks?.[provider] || []).map((network: any) => ({ ...network, provider })))
            .filter((network: any) => network.ramp_type === 'withdraw' && network.status === 'active');
        if (!networks.length) throw new Error('PayHero has no active Kenya mobile-money withdrawal network enabled for this account');
        const network = networks[0];
        const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() || req.protocol;
        const callbackUrl = `${forwardedProto}://${req.get('host')}/api/payments/webhook/payhero`;
        const providerResponse = await fetch(`${baseUrl}/api/global/payments`, {
            method: 'POST',
            headers: buildPayHeroHeaders(),
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
        const payload: any = await providerResponse.json().catch(() => ({}));
        if (!providerResponse.ok) throw new Error(payload.message || `Payout provider returned ${providerResponse.status}`);
        const providerReference = extractGatewayReference(payload);
        if (providerReference) {
            await VybzWithdrawal.findByIdAndUpdate(withdrawal._id, { $set: { providerReference } });
        }
        res.json({ success: true, data: { withdrawal, provider: payload } });
    } catch (error: any) {
        await VybzWithdrawal.findByIdAndUpdate(withdrawal._id, { $set: { status: 'failed' } });
        await VybzWallet.findOneAndUpdate({ userId: withdrawal.userId }, { $inc: { reservedCoins: -withdrawal.coins, availableCoins: withdrawal.coins } });
        await VybzCoinTransaction.updateOne({ sourceKey: `withdrawal:${withdrawal.reference}`, status: 'reserved' }, { $set: { status: 'reversed' } });
        res.status(502).json({ success: false, message: error.message || 'Payout provider request failed' });
    }
});

vybzPayoutCallbackRouter.post('/vybz/withdrawals/callback', async (req, res: Response) => {
    const reference = String(req.body.reference || '');
    const status = String(req.body.status || '').toLowerCase();
    if (!reference) {
        res.status(400).json({ success: false, message: 'Missing withdrawal reference' });
        return;
    }
    await reconcileVybzPayout(reference, status, String(req.body.providerReference || req.body.transactionId || ''));
    res.json({ success: true });
});

// GET /api/admin/stats
router.get('/stats', async (_req, res: Response) => {
    try {
        const [
            totalUsers,
            totalSellers,
            totalBuyers,
            totalProperties,
            pendingListings,
            activeListings,
            featuredListings,
            totalInquiries,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'seller' }),
            User.countDocuments({ role: 'buyer' }),
            Property.countDocuments(),
            Property.countDocuments({ status: 'pending_approval' }),
            Property.countDocuments({ status: 'active' }),
            Property.countDocuments({ isFeatured: true }),
            Inquiry.countDocuments(),
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
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/users
router.get('/users', async (req, res: Response) => {
    try {
        const { role, status, limit = '50', page = '1' } = req.query as Record<string, string>;
        const filter: Record<string, any> = {};
        if (role) filter.role = role;
        if (status) filter.verificationStatus = status;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const [users, total] = await Promise.all([
            User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            User.countDocuments(filter),
        ]);

        res.json({ success: true, data: users, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res: Response) => {
    try {
        const { verificationStatus, role } = req.body;
        const update: Record<string, any> = {};
        if (verificationStatus) update.verificationStatus = verificationStatus;
        if (role) update.role = role;

        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/properties
router.get('/properties', async (req, res: Response) => {
    try {
        const { status, limit = '50', page = '1' } = req.query as Record<string, string>;
        const filter: Record<string, any> = {};
        if (status) filter.status = status;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const [properties, total] = await Promise.all([
            Property.find(filter)
                .populate('sellerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Property.countDocuments(filter),
        ]);

        res.json({ success: true, data: properties, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/admin/properties/:id
router.put('/properties/:id', async (req, res: Response) => {
    try {
        const { status, isFeatured } = req.body;
        const update: Record<string, any> = {};
        if (status) update.status = status;
        if (typeof isFeatured === 'boolean') update.isFeatured = isFeatured;

        const property = await Property.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        res.json({ success: true, data: property });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/admin/inquiries
router.get('/inquiries', async (req, res: Response) => {
    try {
        const { limit = '50', page = '1' } = req.query as Record<string, string>;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Number(limit));
        const skip = (pageNum - 1) * limitNum;

        const [inquiries, total] = await Promise.all([
            Inquiry.find()
                .populate('propertyId', 'title city county')
                .populate('buyerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Inquiry.countDocuments(),
        ]);

        res.json({ success: true, data: inquiries, pagination: { total, page: pageNum, limit: limitNum } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

export default router;
