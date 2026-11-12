import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IVybzRewardConfig, {}, {}, {}, mongoose.Document<unknown, {}, IVybzRewardConfig, {}, {}> & IVybzRewardConfig & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzRewardConfig.d.ts.map