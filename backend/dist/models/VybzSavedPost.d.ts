import mongoose, { Document } from 'mongoose';
export interface IVybzSavedPost extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVybzSavedPost, {}, {}, {}, mongoose.Document<unknown, {}, IVybzSavedPost, {}, {}> & IVybzSavedPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzSavedPost.d.ts.map