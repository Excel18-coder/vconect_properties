import mongoose, { Document } from 'mongoose';
export interface IFavorite extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    createdAt: Date;
}
declare const _default: mongoose.Model<IFavorite, {}, {}, {}, mongoose.Document<unknown, {}, IFavorite, {}, {}> & IFavorite & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Favorite.d.ts.map