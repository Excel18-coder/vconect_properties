import mongoose, { Document, Schema } from 'mongoose';

export interface IVybzFollow extends Document {
    followerId: mongoose.Types.ObjectId;
    followingId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const followSchema = new Schema<IVybzFollow>(
    {
        followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default mongoose.model<IVybzFollow>('VybzFollow', followSchema);
