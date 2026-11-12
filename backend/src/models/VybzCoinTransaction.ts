import mongoose, { Document, Schema } from 'mongoose';

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

const schema = new Schema<IVybzCoinTransaction>(
    {
        transactionId: { type: String, required: true, unique: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: ['view_reward', 'like_reward', 'bonus', 'withdrawal', 'reversal', 'adjustment'], required: true },
        coins: { type: Number, required: true, min: 1 },
        kesAmount: { type: Number, min: 0 },
        status: { type: String, enum: ['pending', 'available', 'reserved', 'redeemed', 'reversed'], required: true },
        postId: { type: Schema.Types.ObjectId, ref: 'VybzPost' },
        sourceKey: { type: String, required: true, unique: true, index: true },
        description: { type: String, required: true, maxlength: 500 },
        availableAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IVybzCoinTransaction>('VybzCoinTransaction', schema);
