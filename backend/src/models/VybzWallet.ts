import mongoose, { Document, Schema } from 'mongoose';

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

const schema = new Schema<IVybzWallet>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
        pendingCoins: { type: Number, default: 0, min: 0 },
        availableCoins: { type: Number, default: 0, min: 0 },
        reservedCoins: { type: Number, default: 0, min: 0 },
        redeemedCoins: { type: Number, default: 0, min: 0 },
        reversedCoins: { type: Number, default: 0, min: 0 },
        lifetimeEarnedCoins: { type: Number, default: 0, min: 0 },
        lifetimeViewCoins: { type: Number, default: 0, min: 0 },
        lifetimeLikeCoins: { type: Number, default: 0, min: 0 },
        lifetimeBonusCoins: { type: Number, default: 0, min: 0 },
    },
    { timestamps: true }
);

export default mongoose.model<IVybzWallet>('VybzWallet', schema);
