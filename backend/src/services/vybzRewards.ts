import mongoose from 'mongoose';
import VybzCoinTransaction, { VybzCoinTransactionType } from '../models/VybzCoinTransaction';
import VybzEngagementEvent from '../models/VybzEngagementEvent';
import VybzRewardConfig from '../models/VybzRewardConfig';
import VybzWallet from '../models/VybzWallet';
import VybzRewardsBudget from '../models/VybzRewardsBudget';
import VybzFraudFlag from '../models/VybzFraudFlag';

export async function getVybzRewardConfig() {
    let config = await VybzRewardConfig.findOne();
    if (!config) config = await VybzRewardConfig.create({});
    return config;
}

export async function getOrCreateWallet(userId: mongoose.Types.ObjectId) {
    return VybzWallet.findOneAndUpdate(
        { userId },
        { $setOnInsert: { userId } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
}

export async function createPendingReward({
    userId,
    postId,
    type,
    coins,
    sourceKey,
    description,
    session,
}: {
    userId: mongoose.Types.ObjectId;
    postId?: mongoose.Types.ObjectId;
    type: VybzCoinTransactionType;
    coins: number;
    sourceKey: string;
    description: string;
    session?: mongoose.ClientSession;
}) {
    if (coins <= 0) return null;
    const config = await getVybzRewardConfig();
    const now = new Date();
    if (config.dailyEarningLimit || config.monthlyEarningLimit) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [daily, monthly] = await Promise.all([
            VybzCoinTransaction.aggregate([
                { $match: { userId, type: { $in: ['view_reward', 'like_reward', 'bonus'] }, status: { $in: ['pending', 'available'] }, createdAt: { $gte: dayStart } } },
                { $group: { _id: null, coins: { $sum: '$coins' } } },
            ]),
            VybzCoinTransaction.aggregate([
                { $match: { userId, type: { $in: ['view_reward', 'like_reward', 'bonus'] }, status: { $in: ['pending', 'available'] }, createdAt: { $gte: monthStart } } },
                { $group: { _id: null, coins: { $sum: '$coins' } } },
            ]),
        ]);
        if ((config.dailyEarningLimit && (daily[0]?.coins || 0) + coins > config.dailyEarningLimit) ||
            (config.monthlyEarningLimit && (monthly[0]?.coins || 0) + coins > config.monthlyEarningLimit)) return null;
    }
    const period = new Date().toISOString().slice(0, 7);
    let budget = await VybzRewardsBudget.findOne({ period }).session(session || null);
    if (!budget) {
        try {
            budget = await VybzRewardsBudget.create([{ period }], { session: session || undefined }).then((items) => items[0]);
        } catch (error: any) {
            if (error?.code !== 11000) throw error;
            budget = await VybzRewardsBudget.findOne({ period }).session(session || null);
        }
    }
    if (budget) {
        budget = await VybzRewardsBudget.findOneAndUpdate(
            { _id: budget._id, active: true, $expr: { $gte: [{ $subtract: ['$budgetCoins', '$issuedCoins'] }, coins] } },
            { $inc: { issuedCoins: coins } },
            { new: true, session: session || null }
        );
    }
    if (!budget || budget.issuedCoins > budget.budgetCoins) return null;
    try {
        const transaction = await VybzCoinTransaction.create([{
            transactionId: `VBC-${new mongoose.Types.ObjectId().toString().toUpperCase()}`,
            userId,
            postId,
            type,
            coins,
            status: 'pending',
            sourceKey,
            description,
            availableAt: new Date(Date.now() + config.verificationPeriodDays * 86400000),
        }], { session: session || undefined });
        await VybzWallet.findOneAndUpdate(
            { userId },
            { $setOnInsert: { userId }, $inc: { pendingCoins: coins } },
            { upsert: true, setDefaultsOnInsert: true, session: session || undefined }
        );
        return transaction[0];
    } catch (error: any) {
        await VybzRewardsBudget.updateOne({ _id: budget._id }, { $inc: { issuedCoins: -coins } }, { session: session || undefined });
        if (error?.code === 11000) return null;
        throw error;
    }
}

export async function settleMaturedRewards(userId: mongoose.Types.ObjectId) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const now = new Date();
        const rewards = await VybzCoinTransaction.find({
            userId,
            status: 'pending',
            availableAt: { $lte: now },
        }).session(session);
        if (rewards.length) {
            const coins = rewards.reduce((sum, reward) => sum + reward.coins, 0);
            await VybzCoinTransaction.updateMany(
                { _id: { $in: rewards.map((reward) => reward._id) }, status: 'pending' },
                { $set: { status: 'available' } },
                { session }
            );
            await VybzWallet.findOneAndUpdate(
                { userId },
                {
                    $inc: {
                        pendingCoins: -coins,
                        availableCoins: coins,
                        lifetimeEarnedCoins: coins,
                        lifetimeViewCoins: rewards.filter((reward) => reward.type === 'view_reward').reduce((sum, reward) => sum + reward.coins, 0),
                        lifetimeLikeCoins: rewards.filter((reward) => reward.type === 'like_reward').reduce((sum, reward) => sum + reward.coins, 0),
                        lifetimeBonusCoins: rewards.filter((reward) => reward.type === 'bonus').reduce((sum, reward) => sum + reward.coins, 0),
                    },
                },
                { new: true, session }
            );
        }
        await session.commitTransaction();
        return getOrCreateWallet(userId);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}

export async function normalizeKenyanPhone(phone?: string) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) return `0${digits.slice(3)}`;
    if (digits.startsWith('0') && digits.length === 10) return digits;
    if (digits.length === 9) return `0${digits}`;
    return '';
}

export async function recordQualifiedView({
    postId,
    creatorId,
    viewerId,
    watchSeconds,
    qualificationKey,
}: {
    postId: mongoose.Types.ObjectId;
    creatorId: mongoose.Types.ObjectId;
    viewerId: mongoose.Types.ObjectId;
    watchSeconds: number;
    qualificationKey: string;
}) {
    if (String(creatorId) === String(viewerId)) return { qualified: false, reason: 'self_view' };
    const config = await getVybzRewardConfig();
    if (!config.rewardsActive || watchSeconds < config.minimumWatchSeconds) return { qualified: false, reason: 'watch_requirement' };
    try {
        const event = await VybzEngagementEvent.create({
            postId,
            creatorId,
            viewerId,
            type: 'view',
            status: 'qualified',
            watchSeconds,
            qualificationKey,
        });
        const count = await VybzEngagementEvent.countDocuments({ postId, type: 'view', status: 'qualified' });
        if (count % config.viewThreshold === 0) {
            await createPendingReward({
                userId: creatorId,
                postId,
                type: 'view_reward',
                coins: config.coinsPerThousandViews,
                sourceKey: `view:${postId}:${count}`,
                description: `${config.viewThreshold} qualified views`,
            });
        }

        if (count === config.viewBonusThreshold) {
            await createPendingReward({
                userId: creatorId,
                postId,
                type: 'bonus',
                coins: config.viewBonusCoins,
                sourceKey: `bonus:view:${postId}:${config.viewBonusThreshold}`,
                description: `${config.viewBonusThreshold} qualified view bonus`,
            });
        }

        return { qualified: true, eventId: event._id };
    } catch (error: any) {
        if (error?.code === 11000) {
            await VybzFraudFlag.create({ userId: viewerId, postId, eventType: 'view', reason: 'Duplicate qualification attempt', evidence: { qualificationKey } });
            return { qualified: false, reason: 'duplicate_view' };
        }
        throw error;
    }
}
