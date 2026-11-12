import mongoose, { Document } from 'mongoose';
export type VybzCoinTransactionType = 'view_reward' | 'like_reward' | 'bonus' | 'withdrawal' | 'reversal' | 'adjustment';
export type VybzCoinTransactionStatus = 'pending' | 'available' | 'reserved' | 'redeemed' | 'reversed';
export interface IVybzCoinTransaction extends Document {
    transactionId: string;
    userId: mongoose.Types.ObjectId;
    type: VybzCoinTransactionType;
    coins: number;
    kesAmount?: number;
    status: VybzCoinTransactionStatus;
    postId?: mongoose.Types.ObjectId;
    sourceKey: string;
    description: string;
    availableAt?: Date;
}
declare const _default: mongoose.Model<IVybzCoinTransaction, {}, {}, {}, mongoose.Document<unknown, {}, IVybzCoinTransaction, {}, {}> & IVybzCoinTransaction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzCoinTransaction.d.ts.map