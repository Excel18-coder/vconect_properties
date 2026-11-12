import mongoose, { Document } from 'mongoose';
export interface IVybzRewardsBudget extends Document {
    period: string;
    budgetCoins: number;
    issuedCoins: number;
    active: boolean;
    updatedBy?: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<IVybzRewardsBudget, {}, {}, {}, mongoose.Document<unknown, {}, IVybzRewardsBudget, {}, {}> & IVybzRewardsBudget & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzRewardsBudget.d.ts.map