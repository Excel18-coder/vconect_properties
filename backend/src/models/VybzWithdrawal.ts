import mongoose, { Document, Schema } from 'mongoose';

export type VybzWithdrawalStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'failed' | 'cancelled';

export interface IVybzWithdrawal extends Document {
    reference: string;
    userId: mongoose.Types.ObjectId;
    coins: number;
    grossKes: number;
    feeKes: number;
    netKes: number;
    phone: string;
    status: VybzWithdrawalStatus;
    rejectionReason?: string;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    providerReference?: string;
    paymentAttemptId?: string;
    paidAt?: Date;
}

const schema = new Schema<IVybzWithdrawal>(
    {
        reference: { type: String, required: true, unique: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        coins: { type: Number, required: true, min: 1 },
        grossKes: { type: Number, required: true, min: 0 },
        feeKes: { type: Number, required: true, min: 0 },
        netKes: { type: Number, required: true, min: 0 },
        phone: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'processing', 'paid', 'rejected', 'failed', 'cancelled'], default: 'pending', index: true },
        rejectionReason: { type: String, maxlength: 500 },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: { type: Date },
        providerReference: { type: String, unique: true, sparse: true },
        paymentAttemptId: { type: String },
        paidAt: { type: Date },
    },
    { timestamps: true }
);

schema.index({ userId: 1, status: 1 });

export default mongoose.model<IVybzWithdrawal>('VybzWithdrawal', schema);
