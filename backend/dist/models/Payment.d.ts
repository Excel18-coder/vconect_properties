import mongoose, { Document } from 'mongoose';
export type PaymentRole = 'seller' | 'buyer';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled';
export type BillingCycle = 'monthly' | 'yearly';
export type PaymentPurpose = 'subscription' | 'inquiry_fee';
export interface IPayment extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    role: PaymentRole;
    purpose: PaymentPurpose;
    planId: string;
    planName: string;
    billingCycle: BillingCycle;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: 'payhero';
    providerReference?: string;
    checkoutUrl?: string;
    metadata?: Record<string, any>;
    paidAt?: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Payment.d.ts.map