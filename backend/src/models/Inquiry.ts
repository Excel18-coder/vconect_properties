import mongoose, { Document, Schema } from 'mongoose';

export type InquiryType = 'information' | 'viewing' | 'callback' | 'offer';
export type InquiryStatus = 'new' | 'contacted' | 'viewing_scheduled' | 'negotiating' | 'closed' | 'not_interested';

export interface IInquiry extends Document {
    _id: mongoose.Types.ObjectId;
    propertyId: mongoose.Types.ObjectId;
    buyerId?: mongoose.Types.ObjectId;
    sellerId: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
    phone?: string;
    preferredContact?: string;
    preferredContactTime?: string;
    message?: string;
    inquiryType: InquiryType;
    status: InquiryStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
    {
        propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
        buyerId: { type: Schema.Types.ObjectId, ref: 'User' },
        sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        preferredContact: { type: String },
        preferredContactTime: { type: String },
        message: { type: String },
        inquiryType: {
            type: String,
            enum: ['information', 'viewing', 'callback', 'offer'],
            default: 'information',
        },
        status: {
            type: String,
            enum: ['new', 'contacted', 'viewing_scheduled', 'negotiating', 'closed', 'not_interested'],
            default: 'new',
        },
        notes: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
