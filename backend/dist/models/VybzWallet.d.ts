import mongoose, { Document } from 'mongoose';
export interface IVybzWallet extends Document {
    userId: mongoose.Types.ObjectId;
    pendingCoins: number;
    availableCoins: number;
    reservedCoins: number;
    redeemedCoins: number;
    reversedCoins: number;
    lifetimeEarnedCoins: number;
    lifetimeViewCoins: number;
    lifetimeLikeCoins: number;
    lifetimeBonusCoins: number;
}
declare const _default: mongoose.Model<IVybzWallet, {}, {}, {}, mongoose.Document<unknown, {}, IVybzWallet, {}, {}> & IVybzWallet & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzWallet.d.ts.map