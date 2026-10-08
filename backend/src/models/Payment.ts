import mongoose, { Document, Schema } from 'mongoose';

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

const paymentSchema = new Schema<IPayment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        role: { type: String, enum: ['seller', 'buyer'], required: true, index: true },
        purpose: { type: String, enum: ['subscription', 'inquiry_fee'], default: 'subscription', index: true },
        planId: { type: String, required: true, index: true },
        planName: { type: String, required: true },
        billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'KES' },
        status: { type: String, enum: ['pending', 'processing', 'paid', 'failed', 'cancelled'], default: 'pending' },
        provider: { type: String, default: 'payhero' },
        providerReference: { type: String },
        checkoutUrl: { type: String },
        metadata: { type: Schema.Types.Mixed },
        paidAt: { type: Date },
        expiresAt: { type: Date },
    },
    { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);