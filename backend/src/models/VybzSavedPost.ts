import mongoose, { Document, Schema } from 'mongoose';

export interface IVybzSavedPost extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const schema = new Schema<IVybzSavedPost>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        postId: { type: Schema.Types.ObjectId, ref: 'VybzPost', required: true, index: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.model<IVybzSavedPost>('VybzSavedPost', schema);
