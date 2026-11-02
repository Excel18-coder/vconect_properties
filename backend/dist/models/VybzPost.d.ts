import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IVybzPost, {}, {}, {}, mongoose.Document<unknown, {}, IVybzPost, {}, {}> & IVybzPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzPost.d.ts.map