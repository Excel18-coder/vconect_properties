import mongoose, { Document, Schema } from 'mongoose';

export type VybzEngagementType = 'view' | 'like';
export type VybzEngagementStatus = 'pending' | 'qualified' | 'rejected';

export interface IVybzEngagementEvent extends Document {
    postId: mongoose.Types.ObjectId;
    creatorId: mongoose.Types.ObjectId;
    viewerId: mongoose.Types.ObjectId;
    type: VybzEngagementType;
    status: VybzEngagementStatus;
    watchSeconds?: number;
    qualificationKey: string;
    rewardProcessed: boolean;
    rejectionReason?: string;
}

const schema = new Schema<IVybzEngagementEvent>(
    {
        postId: { type: Schema.Types.ObjectId, ref: 'VybzPost', required: true, index: true },
        creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        viewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: ['view', 'like'], required: true },
        status: { type: String, enum: ['pending', 'qualified', 'rejected'], required: true },
        watchSeconds: { type: Number, min: 0 },
        qualificationKey: { type: String, required: true },
        rewardProcessed: { type: Boolean, default: false },
        rejectionReason: { type: String },
    },
    { timestamps: true }
);

schema.index({ postId: 1, viewerId: 1, type: 1, qualificationKey: 1 }, { unique: true });

export default mongoose.model<IVybzEngagementEvent>('VybzEngagementEvent', schema);
