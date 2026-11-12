import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IVybzFraudFlag, {}, {}, {}, mongoose.Document<unknown, {}, IVybzFraudFlag, {}, {}> & IVybzFraudFlag & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzFraudFlag.d.ts.map