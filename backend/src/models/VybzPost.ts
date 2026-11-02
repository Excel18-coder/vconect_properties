import mongoose, { Document, Schema } from 'mongoose';

export type VybzPostType = 'video' | 'image' | 'text';
export type VybzCategory = 'videos' | 'memes' | 'pictures' | 'stories' | 'inspiration' | 'art' | 'text';

export interface IVybzComment {
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
}

export interface IVybzPost extends Document {
    authorId: mongoose.Types.ObjectId;
    type: VybzPostType;
    category: VybzCategory;
    caption: string;
    mediaUrl?: string;
    mediaPublicId?: string;
    hashtags: string[];
    likes: mongoose.Types.ObjectId[];
    comments: IVybzComment[];
    viewsCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IVybzComment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true, trim: true, maxlength: 500 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const postSchema = new Schema<IVybzPost>(
    {
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: { type: String, enum: ['video', 'image', 'text'], required: true },
        category: {
            type: String,
            enum: ['videos', 'memes', 'pictures', 'stories', 'inspiration', 'art', 'text'],
            required: true,
        },
        caption: { type: String, trim: true, maxlength: 2_000, default: '' },
        mediaUrl: { type: String },
        mediaPublicId: { type: String },
        hashtags: [{ type: String, trim: true, lowercase: true }],
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        comments: [commentSchema],
        viewsCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ caption: 'text', hashtags: 'text' });

export default mongoose.model<IVybzPost>('VybzPost', postSchema);
