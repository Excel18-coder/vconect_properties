import mongoose, { Document, Schema } from 'mongoose';

export interface IVybzRewardConfig extends Document {
    coinsPerThousandViews: number;
    coinsPerLike: number;
    viewThreshold: number;
    minimumWithdrawalCoins: number;
    maximumWithdrawalCoins?: number;
    coinsPerKes: number;
    withdrawalFeeKes: number;
    verificationPeriodDays: number;
    minimumWatchSeconds: number;
    shortVideoCompletionPercent: number;
    viewBonusThreshold: number;
    viewBonusCoins: number;
    likeBonusThreshold: number;
    likeBonusCoins: number;
    dailyEarningLimit: number;
    monthlyEarningLimit: number;
    rewardsActive: boolean;
    updatedBy?: mongoose.Types.ObjectId;
}

const schema = new Schema<IVybzRewardConfig>(
    {
        coinsPerThousandViews: { type: Number, required: true, min: 0, default: 100 },
        coinsPerLike: { type: Number, required: true, min: 0, default: 5 },
        viewThreshold: { type: Number, required: true, min: 1, default: 1000 },
        minimumWithdrawalCoins: { type: Number, required: true, min: 1, default: 20000 },
        maximumWithdrawalCoins: { type: Number, min: 1 },
        coinsPerKes: { type: Number, required: true, min: 1, default: 100 },
        withdrawalFeeKes: { type: Number, required: true, min: 0, default: 0 },
        verificationPeriodDays: { type: Number, required: true, min: 0, default: 7 },
        minimumWatchSeconds: { type: Number, required: true, min: 0, default: 5 },
        shortVideoCompletionPercent: { type: Number, required: true, min: 0, max: 100, default: 90 },
        viewBonusThreshold: { type: Number, required: true, min: 1, default: 10000 },
        viewBonusCoins: { type: Number, required: true, min: 0, default: 500 },
        likeBonusThreshold: { type: Number, required: true, min: 1, default: 100 },
        likeBonusCoins: { type: Number, required: true, min: 0, default: 100 },
        dailyEarningLimit: { type: Number, required: true, min: 0, default: 0 },
        monthlyEarningLimit: { type: Number, required: true, min: 0, default: 0 },
        rewardsActive: { type: Boolean, default: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<IVybzRewardConfig>('VybzRewardConfig', schema);
