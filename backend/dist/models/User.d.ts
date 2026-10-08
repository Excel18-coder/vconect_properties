import mongoose, { Document } from 'mongoose';
export type UserRole = 'admin' | 'seller' | 'buyer';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';
export type SubscriptionRole = 'seller' | 'buyer';
export type SubscriptionStatus = 'inactive' | 'pending' | 'active' | 'past_due' | 'cancelled';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    avatarUrl?: string;
    agencyName?: string;
    businessDetails?: string;
    verificationStatus: VerificationStatus;
    subscriptionRole?: SubscriptionRole;
    subscriptionPlan?: string;
    subscriptionStatus?: SubscriptionStatus;
    subscriptionProvider?: string;
    subscriptionReference?: string;
    subscriptionExpiresAt?: Date;
    country?: string;
    county?: string;
    city?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map