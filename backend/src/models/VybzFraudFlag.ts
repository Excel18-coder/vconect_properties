import mongoose, { Document, Schema } from 'mongoose';

export type VybzFraudFlagStatus = 'open' | 'dismissed' | 'confirmed';

export interface IVybzFraudFlag extends Document {
    userId: mongoose.Types.ObjectId;
    postId?: mongoose.Types.ObjectId;
    eventType: 'view' | 'like' | 'withdrawal';
    reason: string;
    status: VybzFraudFlagStatus;
    evidence?: Record<string, unknown>;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
}

const schema = new Schema<IVybzFraudFlag>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        postId: { type: Schema.Types.ObjectId, ref: 'VybzPost' },
        eventType: { type: String, enum: ['view', 'like', 'withdrawal'], required: true },
        reason: { type: String, required: true, maxlength: 500 },
        status: { type: String, enum: ['open', 'dismissed', 'confirmed'], default: 'open', index: true },
        evidence: { type: Schema.Types.Mixed },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IVybzFraudFlag>('VybzFraudFlag', schema);
