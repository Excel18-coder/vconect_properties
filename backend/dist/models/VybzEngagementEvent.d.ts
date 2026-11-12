import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IVybzEngagementEvent, {}, {}, {}, mongoose.Document<unknown, {}, IVybzEngagementEvent, {}, {}> & IVybzEngagementEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzEngagementEvent.d.ts.map