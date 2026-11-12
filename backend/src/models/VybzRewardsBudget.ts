import mongoose, { Document, Schema } from 'mongoose';

export interface IVybzRewardsBudget extends Document {
    period: string;
    budgetCoins: number;
    issuedCoins: number;
    active: boolean;
    updatedBy?: mongoose.Types.ObjectId;
}

const schema = new Schema<IVybzRewardsBudget>(
    {
        period: { type: String, required: true, unique: true },
        budgetCoins: { type: Number, required: true, min: 0, default: 1000000 },
        issuedCoins: { type: Number, required: true, min: 0, default: 0 },
        active: { type: Boolean, default: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<IVybzRewardsBudget>('VybzRewardsBudget', schema);
