import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IInquiry, {}, {}, {}, mongoose.Document<unknown, {}, IInquiry, {}, {}> & IInquiry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Inquiry.d.ts.map