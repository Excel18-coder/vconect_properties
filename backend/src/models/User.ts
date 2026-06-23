import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'seller' | 'buyer';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

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
    country?: string;
    county?: string;
    city?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['admin', 'seller', 'buyer'],
            default: 'buyer',
        },
        phone: {
            type: String,
        },
        avatarUrl: {
            type: String,
        },
        agencyName: {
            type: String,
        },
        businessDetails: {
            type: String,
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'suspended'],
            default: 'pending',
        },
        country: {
            type: String,
        },
        county: {
            type: String,
        },
        city: {
            type: String,
        },
        address: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON responses
userSchema.set('toJSON', {
    transform: (_doc, ret: Record<string, any>) => {
        delete ret.password;
        return ret;
    },
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;