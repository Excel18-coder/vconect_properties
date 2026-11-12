import mongoose, { Document } from 'mongoose';
export type VybzWithdrawalStatus = 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'failed' | 'cancelled';
export interface IVybzWithdrawal extends Document {
    reference: string;
    userId: mongoose.Types.ObjectId;
    coins: number;
    grossKes: number;
    feeKes: number;
    netKes: number;
    phone: string;
    status: VybzWithdrawalStatus;
    rejectionReason?: string;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    providerReference?: string;
    paymentAttemptId?: string;
    paidAt?: Date;
}
declare const _default: mongoose.Model<IVybzWithdrawal, {}, {}, {}, mongoose.Document<unknown, {}, IVybzWithdrawal, {}, {}> & IVybzWithdrawal & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VybzWithdrawal.d.ts.map