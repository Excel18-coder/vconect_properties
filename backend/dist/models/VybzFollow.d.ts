import mongoose, { Document } from 'mongoose';
export interface IVybzFollow extends Document {
    followerId: mongoose.Types.ObjectId;
    followingId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVybzFollow, {}, {}, {}, mongoose.Document<unknown, {}, IVybzFollow, {}, {}> & IVybzFollow & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzFollow.d.ts.map